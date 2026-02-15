import { useEffect, useRef } from 'react';
import { useTimer, formatClock } from '../TimerContext';

export default function PresetsScreen({ onNavigate }) {
  const { state, dispatch, TIMER_STYLES } = useTimer();
  const firstButtonRef = useRef(null);

  const presetRows = [
    [1, 2, 5, 10],
    [15, 20, 30, 45],
    [60, 90, 120],
  ];

  const handlePresetClick = (minutes) => {
    dispatch({ type: 'START_PRESET', payload: { minutes } });
    onNavigate('running');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Tab') {
        // Default behavior is fine
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus first button for TV navigation
  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  const formatPresetLabel = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPresetColor = (minutes) => {
    if (minutes <= 5) return 'bg-emerald-600 hover:bg-emerald-500';
    if (minutes <= 15) return 'bg-blue-600 hover:bg-blue-500';
    if (minutes <= 30) return 'bg-purple-600 hover:bg-purple-500';
    if (minutes <= 60) return 'bg-orange-600 hover:bg-orange-500';
    return 'bg-red-600 hover:bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f17] to-[#1e293b] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4">BigTimer</h1>
          <p className="text-2xl text-gray-400">Pick a preset or create a custom timer</p>
        </div>

        {/* Preset Grid */}
        <div className="space-y-6 mb-12">
          {presetRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4 flex-wrap">
              {row.map((minutes, colIndex) => (
                <button
                  key={minutes}
                  ref={rowIndex === 0 && colIndex === 0 ? firstButtonRef : null}
                  onClick={() => handlePresetClick(minutes)}
                  className={`btn-preset min-w-[140px] text-3xl py-8 ${getPresetColor(minutes)}`}
                >
                  {formatPresetLabel(minutes)}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Custom Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => onNavigate('custom')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-3xl px-16 py-6"
          >
            ⚙️ Custom Timer
          </button>
        </div>

        {/* Settings Summary */}
        <div className="bg-gray-800/40 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex justify-center gap-8 text-xl text-gray-400 flex-wrap">
            <span className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Style: <span className="text-white font-semibold">{state.style}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-2xl">{state.focusLockEnabled ? '🔒' : '🔓'}</span>
              Lock: <span className={`font-semibold ${state.focusLockEnabled ? 'text-orange-400' : 'text-white'}`}>
                {state.focusLockEnabled ? 'ON' : 'OFF'}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-2xl">{state.soundEnabled ? '🔊' : '🔇'}</span>
              Sound: <span className={`font-semibold ${state.soundEnabled ? 'text-green-400' : 'text-white'}`}>
                {state.soundEnabled ? 'ON' : 'OFF'}
              </span>
            </span>
          </div>
          {state.soundEnabled && (state.soundHalfway || state.soundLastTen) && (
            <div className="text-center text-lg text-gray-500 mt-4">
              Cues: {state.soundHalfway ? 'Halfway ' : ''}{state.soundLastTen ? 'Last 10s' : ''}
            </div>
          )}
        </div>

        {/* Footer Help */}
        <div className="text-center text-lg text-gray-600 mt-8">
          <p>Use DPAD to navigate • Press OK to select</p>
        </div>
      </div>
    </div>
  );
}
