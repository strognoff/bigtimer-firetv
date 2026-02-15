import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../SettingsContext';
import { useRoutine, formatRoutineClock, ROUTINE_PHASES } from '../RoutineContext';

export default function RunningRoutineScreen({ onNavigate }) {
  const { getActiveTheme } = useSettings();
  const { 
    state: routineState, 
    pauseRoutine, 
    resumeRoutine, 
    skipStep, 
    goToStep, 
    resetRoutine,
    getCurrentStep,
    getTotalRoutineTime,
    getElapsedRoutineTime,
  } = useRoutine();
  
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showStepNavigator, setShowStepNavigator] = useState(false);
  const firstButtonRef = useRef(null);
  const currentTheme = getActiveTheme();
  
  const currentStep = getCurrentStep();
  const totalTime = getTotalRoutineTime();
  const elapsed = getElapsedRoutineTime();
  const totalProgress = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmExit) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setShowConfirmExit(false);
        }
        return;
      }

      if (showStepNavigator) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setShowStepNavigator(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'Enter':
        case ' ':
          if (routineState.phase === ROUTINE_PHASES.RUNNING) {
            pauseRoutine();
          } else if (routineState.phase === ROUTINE_PHASES.PAUSED) {
            resumeRoutine();
          }
          break;
        case 'ArrowRight':
          skipStep();
          break;
        case 'ArrowUp':
          setShowStepNavigator(true);
          break;
        case 'ArrowDown':
          // Could be used for something else
          break;
        case 'Escape':
        case 'Backspace':
          setShowConfirmExit(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [routineState.phase, showConfirmExit, showStepNavigator, pauseRoutine, resumeRoutine, skipStep]);

  const handleExit = () => {
    resetRoutine();
    onNavigate('presets');
  };

  // Step finished transition screen
  if (routineState.phase === ROUTINE_PHASES.STEP_FINISHED && currentStep) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: currentTheme.gradients.paused }}
      >
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {currentStep.name} Complete!
          </h1>
          <p className="text-3xl text-gray-300 mb-2">
            {formatRoutineClock(currentStep.minutes * 60)}
          </p>
          
          {routineState.activeRoutine && routineState.currentStepIndex < routineState.activeRoutine.steps.length && (
            <div className="mt-8">
              <p className="text-xl text-gray-400 mb-2">Next up:</p>
              <p className="text-2xl text-white">
                {routineState.activeRoutine.steps[routineState.currentStepIndex].name}
              </p>
              <p className="text-xl text-gray-400">
                ({routineState.activeRoutine.steps[routineState.currentStepIndex].minutes} min)
              </p>
            </div>
          )}
          
          <p className="text-xl text-gray-500 mt-8 animate-pulse">
            Starting in a moment...
          </p>
        </div>
      </div>
    );
  }

  // Routine finished screen
  if (routineState.phase === ROUTINE_PHASES.ROUTINE_FINISHED) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: currentTheme.gradients.finished }
      }>
        <div className="text-center animate-pulse-slow">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-7xl font-bold text-green-400 mb-8">All Done!</h1>
          <p className="text-4xl text-gray-300 mb-12">
            {routineState.activeRoutine?.name} completed
          </p>
          <div className="mb-8">
            <p className="text-2xl text-gray-400">Total time</p>
            <p className="text-4xl text-white font-bold">
              {totalTime} minutes
            </p>
          </div>
          <button
            onClick={handleExit}
            className="btn-preset bg-green-600 hover:bg-green-500 text-4xl px-16 py-8"
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Confirm exit modal
  if (showConfirmExit) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: 'rgba(0,0,0,0.8)' }}
      >
        <div className="text-center animate-fade-in">
          <h2 className="text-6xl font-bold text-white mb-8">Exit Routine?</h2>
          <p className="text-3xl text-gray-400 mb-12">Your progress will be lost.</p>
          <div className="flex justify-center gap-8">
            <button
              onClick={handleExit}
              className="btn-preset bg-red-600 hover:bg-red-500 text-3xl px-12 py-6"
              autoFocus
            >
              Exit
            </button>
            <button
              onClick={() => setShowConfirmExit(false)}
              className="btn-preset bg-gray-700 hover:bg-gray-600 text-3xl px-12 py-6"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step navigator modal
  if (showStepNavigator && routineState.activeRoutine) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: 'rgba(0,0,0,0.9)' }}
      >
        <div className="w-full max-w-2xl animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Jump to Step</h2>
          
          <div className="space-y-3 mb-8 max-h-96 overflow-auto">
            {routineState.activeRoutine.steps.map((step, index) => (
              <button
                key={index}
                onClick={() => {
                  goToStep(index);
                  setShowStepNavigator(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  index === routineState.currentStepIndex
                    ? 'bg-white/20 ring-2 ring-white'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <span className="text-2xl text-gray-500 w-8">{index + 1}.</span>
                <span className={`text-xl ${index < routineState.currentStepIndex ? 'text-gray-500' : 'text-white'}`}>
                  {step.name}
                </span>
                <span className="text-lg text-gray-400 ml-auto">
                  {step.minutes}m
                </span>
                {index < routineState.currentStepIndex && (
                  <span className="text-green-400 text-xl">✓</span>
                )}
                {index === routineState.currentStepIndex && (
                  <span className="text-blue-400 text-xl">▶</span>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setShowStepNavigator(false)}
              className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main running screen
  return (
    <div 
      className="min-h-screen flex flex-col p-8"
      style={{ background: currentTheme.gradients.running }
    }>
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">{routineState.activeRoutine?.emoji}</span>
            <h1 className="text-3xl font-bold text-white">
              {routineState.activeRoutine?.name}
            </h1>
          </div>
          <p className="text-xl text-gray-400">
            Step {routineState.currentStepIndex + 1} of {routineState.activeRoutine?.steps?.length || 0}
            {routineState.phase === ROUTINE_PHASES.PAUSED && ' • PAUSED'}
          </p>
        </div>
        
        {/* Current Step Info */}
        <div className="text-center mb-6">
          <h2 className="text-5xl font-bold text-white mb-2">
            {currentStep?.name}
          </h2>
        </div>
        
        {/* Timer Display */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="text-center">
            <p 
              className="text-[12rem] font-mono font-bold leading-none"
              style={{ color: currentTheme.colors.primary }}
            >
              {formatRoutineClock(routineState.stepRemainingSeconds)}
            </p>
            
            {/* Step Progress */}
            <div className="mt-8">
              <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${routineState.stepTotalSeconds > 0 
                      ? ((routineState.stepTotalSeconds - routineState.stepRemainingSeconds) / routineState.stepTotalSeconds) * 100 
                      : 0}%`,
                    backgroundColor: currentTheme.colors.primary 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 max-w-3xl mx-auto">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {routineState.activeRoutine?.steps?.map((step, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all ${
                    index < routineState.currentStepIndex
                      ? 'bg-green-500'
                      : index === routineState.currentStepIndex
                        ? 'ring-2 ring-white'
                        : 'bg-gray-600'
                  }`}
                  style={index === routineState.currentStepIndex ? {
                    backgroundColor: currentTheme.colors.primary,
                  } : undefined}
                />
              ))}
            </div>
            
            {/* Overall progress bar */}
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${totalProgress}%`,
                  backgroundColor: currentTheme.colors.accent 
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{Math.round(elapsed)} min elapsed</span>
              <span>{totalTime - Math.round(elapsed)} min remaining</span>
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {routineState.phase === ROUTINE_PHASES.RUNNING && (
            <button
              ref={firstButtonRef}
              onClick={pauseRoutine}
              className="btn-preset bg-yellow-600 hover:bg-yellow-500 min-w-[140px]"
            >
              ⏸ Pause
            </button>
          )}
          {routineState.phase === ROUTINE_PHASES.PAUSED && (
            <button
              ref={firstButtonRef}
              onClick={resumeRoutine}
              className="btn-preset bg-green-600 hover:bg-green-500 min-w-[140px]"
            >
              ▶ Resume
            </button>
          )}
          <button
            onClick={skipStep}
            className="btn-preset bg-blue-600 hover:bg-blue-500 min-w-[140px]"
          >
            ⏭ Skip Step
          </button>
          <button
            onClick={() => setShowStepNavigator(true)}
            className="btn-preset bg-gray-700 hover:bg-gray-600 min-w-[140px]"
          >
            📋 All Steps
          </button>
          <button
            onClick={() => setShowConfirmExit(true)}
            className="btn-preset bg-red-600 hover:bg-red-500 min-w-[140px]"
          >
            ⏹ Exit
          </button>
        </div>
        
        {/* Controls Help */}
        <div className="text-center text-lg text-gray-500 space-y-1">
          <p>◀/Space = Pause/Resume • ▶ = Skip Step • ▲ = All Steps • Back = Exit</p>
        </div>
      </div>
    </div>
  );
}
