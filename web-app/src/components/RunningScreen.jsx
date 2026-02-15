import { useState, useEffect, useRef } from 'react';
import { useTimer, formatClock } from '../TimerContext';

export default function RunningScreen({ onNavigate }) {
  const { state, dispatch, TIMER_PHASES, TIMER_STYLES } = useTimer();
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonRefs = useRef([]);

  const handlePause = () => {
    dispatch({ type: 'PAUSE' });
  };

  const handleResume = () => {
    dispatch({ type: 'RESUME' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setShowConfirmExit(false);
    onNavigate('presets');
  };

  const handleToggleLock = () => {
    dispatch({ type: 'TOGGLE_LOCK' });
  };

  const handleCycleStyle = () => {
    dispatch({ type: 'CYCLE_STYLE' });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmExit) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setShowConfirmExit(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (state.phase === TIMER_PHASES.RUNNING) {
            handlePause();
          } else if (state.phase === TIMER_PHASES.PAUSED) {
            handleResume();
          }
          break;
        case 'ArrowRight':
          if (!state.focusLockEnabled) {
            setShowConfirmExit(true);
          }
          break;
        case 'ArrowDown':
          handleCycleStyle();
          break;
        case 'ArrowUp':
          setShowSoundSettings(!showSoundSettings);
          break;
        case 'Escape':
        case 'Backspace':
          if (state.phase === TIMER_PHASES.RUNNING || state.phase === TIMER_PHASES.PAUSED) {
            setShowConfirmExit(true);
          }
          break;
        case 'Enter':
        case ' ':
          // Toggle pause/resume on Enter/Space
          if (state.phase === TIMER_PHASES.RUNNING) {
            handlePause();
          } else if (state.phase === TIMER_PHASES.PAUSED) {
            handleResume();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.focusLockEnabled, showConfirmExit, showSoundSettings]);

  // Auto-focus first button for TV navigation
  useEffect(() => {
    if (buttonRefs.current[0]) {
      buttonRefs.current[0].focus();
    }
  }, []);

  const progress = state.totalSeconds > 0 
    ? ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100 
    : 0;

  const progressColor = state.phase === TIMER_PHASES.FINISHED 
    ? '#4CAF50' 
    : state.phase === TIMER_PHASES.PAUSED 
      ? '#FFA726' 
      : '#7AA2FF';

  // Calculate stroke dash array for pie chart
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f17] to-[#1e293b] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {showConfirmExit ? (
          <div className="text-center animate-fade-in">
            <h2 className="text-6xl font-bold text-white mb-8">Exit timer?</h2>
            <p className="text-3xl text-gray-400 mb-12">Your timer will be reset.</p>
            <div className="flex justify-center gap-8">
              <button
                onClick={handleReset}
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
        ) : state.phase === TIMER_PHASES.FINISHED ? (
          // Finished state
          <div className="text-center animate-pulse-slow">
            <h1 className="text-8xl font-bold text-green-400 mb-8">Done!</h1>
            <p className="text-4xl text-gray-300 mb-12">
              {formatClock(state.totalSeconds)} completed
            </p>
            <button
              onClick={handleReset}
              className="btn-preset bg-green-600 hover:bg-green-500 text-4xl px-16 py-8"
              autoFocus
            >
              OK
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-2">BigTimer</h1>
              <p className="text-xl text-gray-500">
                {state.phase === TIMER_PHASES.PAUSED && '⏸ PAUSED'}
              </p>
            </div>

            {/* Timer Display */}
            <div className="mb-8">
              {state.style === TIMER_STYLES.NUMBERS && (
                <div className="text-center">
                  <div 
                    className="timer-display transition-all duration-300"
                    style={{ color: progressColor }}
                  >
                    {formatClock(state.remainingSeconds)}
                  </div>
                  {state.totalSeconds > 0 && (
                    <div className="mt-6">
                      <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000 rounded-full"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: progressColor 
                          }}
                        />
                      </div>
                      <p className="text-2xl text-gray-400 mt-4">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                  )}
                </div>
              )}

              {state.style === TIMER_STYLES.PIE && (
                <div className="flex justify-center items-center">
                  <div className="relative w-[450px] h-[450px]">
                    <svg 
                      className="w-full h-full transform -rotate-90" 
                      viewBox="0 0 400 400"
                    >
                      {/* Background circle */}
                      <circle
                        cx="200"
                        cy="200"
                        r={radius}
                        stroke="#1e293b"
                        strokeWidth="16"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="200"
                        cy="200"
                        r={radius}
                        stroke={progressColor}
                        strokeWidth="16"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                      {/* Inner glow effect */}
                      <circle
                        cx="200"
                        cy="200"
                        r={radius - 8}
                        stroke={progressColor}
                        strokeWidth="2"
                        fill="none"
                        opacity="0.3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p 
                          className="text-8xl font-mono font-bold"
                          style={{ color: progressColor }}
                        >
                          {formatClock(state.remainingSeconds)}
                        </p>
                        <p className="text-2xl text-gray-400 mt-2">
                          {Math.round(progress)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state.style === TIMER_STYLES.BAR && (
                <div className="text-center">
                  <div className="w-full h-24 bg-gray-800 rounded-2xl overflow-hidden mb-8 shadow-inner">
                    <div
                      className="h-full transition-all duration-1000 flex items-center justify-end pr-4"
                      style={{ 
                        width: `${Math.max(5, progress)}%`,
                        backgroundColor: progressColor 
                      }}
                    >
                      {progress > 15 && (
                        <span className="text-2xl font-bold text-white">
                          {Math.round(progress)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p 
                    className="timer-display text-7xl"
                    style={{ color: progressColor }}
                  >
                    {formatClock(state.remainingSeconds)}
                  </p>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {state.phase === TIMER_PHASES.RUNNING && (
                <button
                  ref={el => buttonRefs.current[0] = el}
                  onClick={handlePause}
                  className="btn-preset bg-yellow-600 hover:bg-yellow-500 min-w-[140px]"
                >
                  ⏸ Pause
                </button>
              )}
              {state.phase === TIMER_PHASES.PAUSED && (
                <button
                  ref={el => buttonRefs.current[0] = el}
                  onClick={handleResume}
                  className="btn-preset bg-green-600 hover:bg-green-500 min-w-[140px]"
                >
                  ▶ Resume
                </button>
              )}
              <button
                onClick={() => setShowConfirmExit(true)}
                className="btn-preset bg-red-600 hover:bg-red-500 min-w-[140px]"
              >
                ⏹ Reset
              </button>
              <button
                onClick={handleToggleLock}
                className={`btn-preset min-w-[140px] ${state.focusLockEnabled ? 'bg-orange-600 hover:bg-orange-500 ring-2 ring-orange-400' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                🔒 {state.focusLockEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowSoundSettings(!showSoundSettings)}
                className={`btn-preset min-w-[140px] ${showSoundSettings ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                🔊 Sounds
              </button>
              <button
                onClick={handleCycleStyle}
                className="btn-preset bg-gray-700 hover:bg-gray-600 min-w-[140px]"
              >
                🎨 {state.style}
              </button>
            </div>

            {/* Sound Settings Panel */}
            {showSoundSettings && (
              <div className="bg-gray-800/50 rounded-xl p-6 mb-8 animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Sound Settings</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
                    className={`btn-preset ${state.soundEnabled ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    🔔 {state.soundEnabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_HALFWAY' })}
                    className={`btn-preset ${state.soundHalfway ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    ½ Halfway
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_LAST_TEN' })}
                    className={`btn-preset ${state.soundLastTen ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    🔟 Last 10s
                  </button>
                </div>
              </div>
            )}

            {/* Controls Help */}
            <div className="text-center text-lg text-gray-500 space-y-1">
              <p>◀ Pause/Resume • ▶ Reset (when unlocked) • ▼ Change Style</p>
              <p>▲ Sound Settings • Back/Escape = Exit</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
