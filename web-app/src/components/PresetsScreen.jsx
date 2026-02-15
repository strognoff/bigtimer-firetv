import { useEffect, useRef } from 'react';
import { useTimer, formatClock } from '../TimerContext';
import { useSettings } from '../SettingsContext';
import { getPresetColorClass } from '../themes';

export default function PresetsScreen({ onNavigate }) {
  const { state, dispatch, TIMER_STYLES } = useTimer();
  const { getActiveProfile, getActiveTheme, toggleProfileSwitcher } = useSettings();
  
  const firstButtonRef = useRef(null);
  const profile = getActiveProfile();
  const currentTheme = getActiveTheme();

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
      switch (e.key) {
        case 's':
        case 'S':
          onNavigate('settings');
          break;
        case 'r':
        case 'R':
          onNavigate('routines');
          break;
        case 'p':
        case 'P':
          toggleProfileSwitcher();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, toggleProfileSwitcher]);

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

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: currentTheme.gradients.running }}
    >
      <div className="w-full max-w-5xl">
        {/* Header with Profile */}
        <div className="text-center mb-8">
          <button
            onClick={toggleProfileSwitcher}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all mb-4"
          >
            <span className="text-2xl">{profile?.emoji}</span>
            <span className="text-lg text-gray-300">{profile?.name}</span>
            <span className="text-gray-500">▼</span>
          </button>
          <h1 
            className="text-7xl font-bold mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            BigTimer
          </h1>
          <p className="text-2xl text-gray-400">Pick a preset or create a custom timer</p>
        </div>

        {/* Preset Grid */}
        <div className="space-y-6 mb-8">
          {presetRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4 flex-wrap">
              {row.map((minutes, colIndex) => (
                <button
                  key={minutes}
                  ref={rowIndex === 0 && colIndex === 0 ? firstButtonRef : null}
                  onClick={() => handlePresetClick(minutes)}
                  className={`btn-preset min-w-[140px] text-3xl py-8 ${getPresetColorClass(minutes, profile?.theme)}`}
                >
                  {formatPresetLabel(minutes)}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => onNavigate('custom')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
          >
            ⚙️ Custom
          </button>
          <button
            onClick={() => onNavigate('routines')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
          >
            📋 Routines
            {profile?.routines?.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-600 text-sm">
                {profile.routines.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
          >
            🎨 Settings
          </button>
        </div>

        {/* Current Settings Summary */}
        <div 
          className="rounded-xl p-6 max-w-2xl mx-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
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
        <div className="text-center text-lg text-gray-600 mt-8 space-y-1">
          <p>Use DPAD to navigate • Press OK to select</p>
          <p>S = Settings • R = Routines • P = Switch Profile</p>
        </div>
      </div>
    </div>
  );
}
