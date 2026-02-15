import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';

const RoutineContext = createContext();

// Routine execution phases
const ROUTINE_PHASES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STEP_FINISHED: 'STEP_FINISHED',
  ROUTINE_FINISHED: 'ROUTINE_FINISHED',
};

const initialState = {
  phase: ROUTINE_PHASES.IDLE,
  activeRoutine: null,
  currentStepIndex: 0,
  stepRemainingSeconds: 0,
  stepTotalSeconds: 0,
};

function routineReducer(state, action) {
  switch (action.type) {
    case 'START_ROUTINE': {
      const { routine } = action.payload;
      if (!routine || !routine.steps || routine.steps.length === 0) {
        return state;
      }
      const firstStep = routine.steps[0];
      return {
        ...state,
        phase: ROUTINE_PHASES.RUNNING,
        activeRoutine: routine,
        currentStepIndex: 0,
        stepTotalSeconds: firstStep.minutes * 60,
        stepRemainingSeconds: firstStep.minutes * 60,
      };
    }
    
    case 'TICK': {
      if (state.phase !== ROUTINE_PHASES.RUNNING) return state;
      
      const newRemaining = Math.max(0, state.stepRemainingSeconds - 1);
      
      if (newRemaining === 0) {
        // Step finished
        const nextIndex = state.currentStepIndex + 1;
        if (nextIndex >= state.activeRoutine.steps.length) {
          // Routine finished
          return {
            ...state,
            phase: ROUTINE_PHASES.ROUTINE_FINISHED,
            stepRemainingSeconds: 0,
          };
        } else {
          // Move to next step
          const nextStep = state.activeRoutine.steps[nextIndex];
          return {
            ...state,
            phase: ROUTINE_PHASES.STEP_FINISHED,
            currentStepIndex: nextIndex,
            stepTotalSeconds: nextStep.minutes * 60,
            stepRemainingSeconds: nextStep.minutes * 60,
          };
        }
      }
      
      return {
        ...state,
        stepRemainingSeconds: newRemaining,
      };
    }
    
    case 'ADVANCE_TO_NEXT_STEP': {
      if (!state.activeRoutine) return state;
      
      const nextIndex = state.currentStepIndex;
      if (nextIndex >= state.activeRoutine.steps.length) {
        return {
          ...state,
          phase: ROUTINE_PHASES.ROUTINE_FINISHED,
        };
      }
      
      const step = state.activeRoutine.steps[nextIndex];
      return {
        ...state,
        phase: ROUTINE_PHASES.RUNNING,
        stepTotalSeconds: step.minutes * 60,
        stepRemainingSeconds: step.minutes * 60,
      };
    }
    
    case 'SKIP_STEP': {
      if (!state.activeRoutine) return state;
      
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex >= state.activeRoutine.steps.length) {
        return {
          ...state,
          phase: ROUTINE_PHASES.ROUTINE_FINISHED,
          stepRemainingSeconds: 0,
        };
      }
      
      const nextStep = state.activeRoutine.steps[nextIndex];
      return {
        ...state,
        currentStepIndex: nextIndex,
        stepTotalSeconds: nextStep.minutes * 60,
        stepRemainingSeconds: nextStep.minutes * 60,
        phase: ROUTINE_PHASES.RUNNING,
      };
    }
    
    case 'PAUSE':
      return {
        ...state,
        phase: ROUTINE_PHASES.PAUSED,
      };
    
    case 'RESUME':
      return {
        ...state,
        phase: ROUTINE_PHASES.RUNNING,
      };
    
    case 'RESET':
      return {
        ...initialState,
      };
    
    case 'GO_TO_STEP': {
      const { stepIndex } = action.payload;
      if (!state.activeRoutine || stepIndex < 0 || stepIndex >= state.activeRoutine.steps.length) {
        return state;
      }
      const step = state.activeRoutine.steps[stepIndex];
      return {
        ...state,
        currentStepIndex: stepIndex,
        stepTotalSeconds: step.minutes * 60,
        stepRemainingSeconds: step.minutes * 60,
        phase: ROUTINE_PHASES.RUNNING,
      };
    }
    
    default:
      return state;
  }
}

// Audio context for beeps
let audioContextSingleton = null;

function getAudioContext() {
  if (!audioContextSingleton) {
    try {
      audioContextSingleton = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return null;
    }
  }
  return audioContextSingleton;
}

async function ensureAudioContextResumed() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('Failed to resume audio context:', e);
    }
  }
  return ctx;
}

export function RoutineProvider({ children }) {
  const [state, dispatch] = useReducer(routineReducer, initialState);
  const intervalRef = useRef(null);
  const lastTickTimeRef = useRef(null);
  const { getAccessibilityVolume } = useSettings();

  // Timer tick effect
  useEffect(() => {
    if (state.phase === ROUTINE_PHASES.RUNNING) {
      const targetInterval = 1000;
      lastTickTimeRef.current = performance.now();
      
      intervalRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = now - lastTickTimeRef.current;
        
        if (elapsed >= targetInterval * 0.9) {
          dispatch({ type: 'TICK' });
          lastTickTimeRef.current = now;
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.phase]);

  // Handle step finished - auto advance after a brief pause
  useEffect(() => {
    if (state.phase === ROUTINE_PHASES.STEP_FINISHED) {
      // Play step completion sound
      playBeep(800, 200);
      
      // Auto-advance after 2 seconds
      const timeout = setTimeout(() => {
        dispatch({ type: 'ADVANCE_TO_NEXT_STEP' });
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [state.phase]);

  // Handle routine finished
  useEffect(() => {
    if (state.phase === ROUTINE_PHASES.ROUTINE_FINISHED) {
      // Play routine completion sound
      playBeep(1000, 500);
      setTimeout(() => playBeep(1200, 300), 600);
      setTimeout(() => playBeep(1500, 400), 1000);
    }
  }, [state.phase]);

  // Play beep with volume control
  function playBeep(frequency, duration) {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return false;
      
      if (audioContext.state === 'suspended') {
        ensureAudioContextResumed().then(() => playBeep(frequency, duration));
        return false;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const volume = getAccessibilityVolume();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.3 * volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
      
      return true;
    } catch (e) {
      console.warn('Failed to play beep:', e);
      return false;
    }
  }

  // Resume audio context on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      ensureAudioContextResumed();
    };
    
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Helper functions
  const startRoutine = useCallback((routine) => {
    dispatch({ type: 'START_ROUTINE', payload: { routine } });
  }, []);

  const pauseRoutine = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const resumeRoutine = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  const skipStep = useCallback(() => {
    dispatch({ type: 'SKIP_STEP' });
  }, []);

  const goToStep = useCallback((stepIndex) => {
    dispatch({ type: 'GO_TO_STEP', payload: { stepIndex } });
  }, []);

  const resetRoutine = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const getCurrentStep = useCallback(() => {
    if (!state.activeRoutine || state.currentStepIndex >= state.activeRoutine.steps.length) {
      return null;
    }
    return state.activeRoutine.steps[state.currentStepIndex];
  }, [state.activeRoutine, state.currentStepIndex]);

  const getTotalRoutineTime = useCallback(() => {
    if (!state.activeRoutine) return 0;
    return state.activeRoutine.steps.reduce((total, step) => total + step.minutes, 0);
  }, [state.activeRoutine]);

  const getElapsedRoutineTime = useCallback(() => {
    if (!state.activeRoutine) return 0;
    
    // Add completed steps
    let elapsed = 0;
    for (let i = 0; i < state.currentStepIndex; i++) {
      elapsed += state.activeRoutine.steps[i].minutes;
    }
    // Add current step progress
    if (state.stepTotalSeconds > 0) {
      elapsed += (state.stepTotalSeconds - state.stepRemainingSeconds) / 60;
    }
    
    return elapsed;
  }, [state.activeRoutine, state.currentStepIndex, state.stepTotalSeconds, state.stepRemainingSeconds]);

  const value = {
    state,
    dispatch,
    ROUTINE_PHASES,
    
    // Actions
    startRoutine,
    pauseRoutine,
    resumeRoutine,
    skipStep,
    goToStep,
    resetRoutine,
    
    // Helpers
    getCurrentStep,
    getTotalRoutineTime,
    getElapsedRoutineTime,
    playBeep,
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}

// Export ROUTINE_PHASES for direct use
export { ROUTINE_PHASES };

// Format seconds as clock display
export function formatRoutineClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
