import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';

const TimerContext = createContext();

const TIMER_PHASES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED'
};

const TIMER_STYLES = {
  NUMBERS: 'NUMBERS',
  PIE: 'PIE',
  BAR: 'BAR'
};

const initialState = {
  phase: TIMER_PHASES.IDLE,
  totalSeconds: 0,
  remainingSeconds: 0,
  style: TIMER_STYLES.NUMBERS,
  focusLockEnabled: false,
  lastCustomMinutes: 5,
  soundEnabled: true,
  soundHalfway: false,
  soundLastTen: false,
  error: null,
};

function timerReducer(state, action) {
  switch (action.type) {
    case 'START_PRESET':
      return {
        ...state,
        phase: action.payload.minutes > 0 ? TIMER_PHASES.RUNNING : TIMER_PHASES.FINISHED,
        totalSeconds: Math.max(0, action.payload.minutes * 60),
        remainingSeconds: Math.max(0, action.payload.minutes * 60),
        lastCustomMinutes: Math.max(1, Math.min(180, action.payload.minutes)),
        error: null,
      };
    case 'TICK':
      const newRemaining = Math.max(0, state.remainingSeconds - 1);
      const newPhase = newRemaining === 0 ? TIMER_PHASES.FINISHED : state.phase;
      return {
        ...state,
        remainingSeconds: newRemaining,
        phase: newPhase,
      };
    case 'PAUSE':
      return {
        ...state,
        phase: TIMER_PHASES.PAUSED,
      };
    case 'RESUME':
      return {
        ...state,
        phase: TIMER_PHASES.RUNNING,
      };
    case 'RESET':
      return {
        ...initialState,
        style: state.style,
        focusLockEnabled: state.focusLockEnabled,
        soundEnabled: state.soundEnabled,
        soundHalfway: state.soundHalfway,
        soundLastTen: state.soundLastTen,
        lastCustomMinutes: state.lastCustomMinutes,
      };
    case 'TOGGLE_LOCK':
      return {
        ...state,
        focusLockEnabled: !state.focusLockEnabled,
      };
    case 'CYCLE_STYLE':
      const styles = [TIMER_STYLES.NUMBERS, TIMER_STYLES.PIE, TIMER_STYLES.BAR];
      const currentIndex = styles.indexOf(state.style);
      const nextIndex = (currentIndex + 1) % styles.length;
      return {
        ...state,
        style: styles[nextIndex],
      };
    case 'SET_CUSTOM_MINUTES':
      return {
        ...state,
        lastCustomMinutes: Math.max(1, Math.min(180, action.payload.minutes)),
      };
    case 'TOGGLE_SOUND':
      return {
        ...state,
        soundEnabled: !state.soundEnabled,
      };
    case 'TOGGLE_HALFWAY':
      return {
        ...state,
        soundHalfway: !state.soundHalfway,
      };
    case 'TOGGLE_LAST_TEN':
      return {
        ...state,
        soundLastTen: !state.soundLastTen,
      };
    case 'LOAD_SETTINGS':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Audio context singleton to prevent recreating on each beep
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

// Resume audio context if suspended (required for autoplay policies)
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

export function TimerProvider({ children }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const intervalRef = useRef(null);
  const halfwayPlayedRef = useRef(false);
  const lastTenPlayedRef = useRef(false);
  const lastTickTimeRef = useRef(null);
  
  // Get volume from settings
  const { getAccessibilityVolume, isReducedMotion } = useSettings();

  // Simple beep function using Web Audio API with volume control
  function playBeep(frequency, duration) {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return false;
      
      // Resume if suspended
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

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bigtimer-timer-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        dispatch({ type: 'LOAD_SETTINGS', payload: settings });
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      const settingsToSave = {
        style: state.style,
        focusLockEnabled: state.focusLockEnabled,
        lastCustomMinutes: state.lastCustomMinutes,
        soundEnabled: state.soundEnabled,
        soundHalfway: state.soundHalfway,
        soundLastTen: state.soundLastTen,
      };
      localStorage.setItem('bigtimer-timer-settings', JSON.stringify(settingsToSave));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [state.style, state.focusLockEnabled, state.lastCustomMinutes, 
      state.soundEnabled, state.soundHalfway, state.soundLastTen]);

  // Timer tick effect with drift correction
  useEffect(() => {
    if (state.phase === TIMER_PHASES.RUNNING) {
      // Use a more accurate timing approach
      const targetInterval = 1000;
      lastTickTimeRef.current = performance.now();
      
      intervalRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = now - lastTickTimeRef.current;
        
        // Only tick if approximately 1 second has passed
        if (elapsed >= targetInterval * 0.9) {
          dispatch({ type: 'TICK' });
          lastTickTimeRef.current = now;
        }
      }, 100); // Check more frequently for better accuracy
      
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

  // Sound effects
  useEffect(() => {
    if (!state.soundEnabled || state.phase !== TIMER_PHASES.RUNNING) {
      return;
    }

    // Halfway point
    if (state.soundHalfway && !halfwayPlayedRef.current && state.totalSeconds > 0) {
      const halfwaySeconds = Math.floor(state.totalSeconds / 2);
      if (state.remainingSeconds <= halfwaySeconds && state.remainingSeconds > 0) {
        halfwayPlayedRef.current = true;
        playBeep(800, 200);
      }
    }

    // Last 10 seconds countdown beep
    if (state.soundLastTen && !lastTenPlayedRef.current && 
        state.remainingSeconds <= 10 && state.remainingSeconds > 0) {
      lastTenPlayedRef.current = true;
      playBeep(600, 100);
    }
  }, [state.remainingSeconds, state.phase, state.soundEnabled, 
      state.soundHalfway, state.soundLastTen, state.totalSeconds, getAccessibilityVolume]);

  // Finished sound
  useEffect(() => {
    if (state.remainingSeconds === 0 && state.phase === TIMER_PHASES.FINISHED && state.soundEnabled) {
      // Play completion sound
      playBeep(1000, 500);
      setTimeout(() => playBeep(1200, 300), 600);
      setTimeout(() => playBeep(1500, 400), 1000);
    }
  }, [state.phase, state.remainingSeconds, state.soundEnabled, getAccessibilityVolume]);

  // Reset sound flags when timer starts
  useEffect(() => {
    if (state.phase === TIMER_PHASES.RUNNING && state.remainingSeconds === state.totalSeconds) {
      halfwayPlayedRef.current = false;
      lastTenPlayedRef.current = false;
    }
  }, [state.phase, state.remainingSeconds, state.totalSeconds]);

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

  const value = {
    state,
    dispatch,
    TIMER_PHASES,
    TIMER_STYLES,
    playBeep: useCallback((freq, dur) => playBeep(freq, dur), [getAccessibilityVolume]),
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export function formatClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
