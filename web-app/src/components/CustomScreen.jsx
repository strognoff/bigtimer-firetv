import { useState, useEffect, useRef } from 'react';
import { useTimer } from '../TimerContext';
import { useSettings } from '../SettingsContext';

export default function CustomScreen({ onNavigate }) {
  const { state, dispatch } = useTimer();
  const { getActiveTheme } = useSettings();
  const [minutes, setMinutes] = useState(state.lastCustomMinutes || 5);
  const startButtonRef = useRef(null);
  const currentTheme = getActiveTheme();

  const handleStart = () => {
    dispatch({ type: 'SET_CUSTOM_MINUTES', payload: { minutes } });
    dispatch({ type: 'START_PRESET', payload: { minutes } });
    onNavigate('running');
  };

  const adjustMinutes = (delta) => {
    setMinutes((prev) => Math.max(1, Math.min(180, prev + delta)));
  };

  const setQuickValue = (value) => {
    setMinutes(Math.max(1, Math.min(180, value)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          adjustMinutes(1);
          break;
        case 'ArrowDown':
          adjustMinutes(-1);
          break;
        case 'ArrowRight':
          adjustMinutes(5);
          break;
        case 'ArrowLeft':
          adjustMinutes(-5);
          break;
        case 'Enter':
        case ' ':
          handleStart();
          break;
        case 'Escape':
        case 'Backspace':
          onNavigate('presets');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minutes]);

  // Auto-focus start button
  useEffect(() => {
    if (startButtonRef.current) {
      startButtonRef.current.focus();
    }
  }, []);

  const formatTime = (totalMinutes) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins} minute${mins !== 1 ? 's' : ''}`;
    if (mins === 0) return `${hrs} hour${hrs !== 1 ? 's' : ''}`;
    return `${hrs}h ${mins}m`;
  };

  const quickValues = [3, 5, 7, 10, 15, 20, 25, 30, 45, 60, 90, 120];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: currentTheme.gradients.running }}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-white mb-4">Custom Timer</h1>
          <p className="text-xl text-gray-400">Set your desired duration</p>
        </div>

        {/* Time Display */}
        <div className="text-center mb-10">
          <div 
            className="rounded-2xl py-10 px-8 inline-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <p 
              className="text-9xl font-mono font-bold mb-4"
              style={{ color: currentTheme.colors.primary }}
            >
              {Math.floor(minutes / 60) > 0 && (
                <span>{Math.floor(minutes / 60)}:</span>
              )}
              <span>{(minutes % 60).toString().padStart(2, '0')}</span>
            </p>
            <p className="text-3xl text-gray-400">{formatTime(minutes)}</p>
          </div>
        </div>

        {/* Adjustment Buttons */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          <button
            onClick={() => adjustMinutes(-1)}
            className="btn-preset bg-red-600 hover:bg-red-500 text-2xl px-8"
          >
            -1m
          </button>
          <button
            onClick={() => adjustMinutes(-5)}
            className="btn-preset bg-red-700 hover:bg-red-600 text-2xl px-8"
          >
            -5m
          </button>
          <button
            onClick={() => adjustMinutes(5)}
            className="btn-preset bg-green-700 hover:bg-green-600 text-2xl px-8"
          >
            +5m
          </button>
          <button
            onClick={() => adjustMinutes(1)}
            className="btn-preset bg-green-600 hover:bg-green-500 text-2xl px-8"
          >
            +1m
          </button>
        </div>

        {/* Quick Values */}
        <div className="mb-10">
          <p className="text-center text-lg text-gray-500 mb-4">Quick select:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {quickValues.map((val) => (
              <button
                key={val}
                onClick={() => setQuickValue(val)}
                className={`px-4 py-2 rounded-lg text-lg transition-all ${
                  minutes === val 
                    ? 'text-white font-bold' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                style={minutes === val ? { 
                  backgroundColor: currentTheme.colors.primary 
                } : undefined}
              >
                {val < 60 ? `${val}m` : `${val / 60}h`}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8">
          <button
            ref={startButtonRef}
            onClick={handleStart}
            className="btn-preset bg-green-600 hover:bg-green-500 text-3xl px-16 py-8"
          >
            ▶ Start
          </button>
          <button
            onClick={() => onNavigate('presets')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-3xl px-12 py-8"
          >
            ← Back
          </button>
        </div>

        {/* Controls Help */}
        <div className="text-center text-lg text-gray-500 mt-10">
          <p>↑↓ ±1 minute • ←→ ±5 minutes • Enter = Start • Back = Return</p>
        </div>
      </div>
    </div>
  );
}
