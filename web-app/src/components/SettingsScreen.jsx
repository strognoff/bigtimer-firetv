import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../SettingsContext';
import { getAllThemes } from '../themes';

export default function SettingsScreen({ onNavigate }) {
  const { 
    state, 
    getActiveProfile, 
    getActiveTheme,
    setTheme,
    setHighContrastMode,
    setReducedMotion,
    setAudioVolume,
    setLargeText,
    updateProfile,
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('theme');
  const firstButtonRef = useRef(null);
  const themes = getAllThemes();
  const profile = getActiveProfile();
  const currentTheme = getActiveTheme();

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  const tabs = [
    { id: 'theme', label: '🎨 Theme', icon: '🎨' },
    { id: 'accessibility', label: '♿ Access', icon: '♿' },
    { id: 'profile', label: '👤 Profile', icon: '👤' },
  ];

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
  };

  const renderThemeTab = () => (
    <div className="space-y-6">
      <h2 className="text-4xl font-bold text-white mb-6 text-center">Choose Theme</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`p-4 rounded-xl transition-all ${
              profile?.theme === theme.id
                ? 'ring-4 ring-white bg-white/20 scale-105'
                : 'bg-gray-800/50 hover:bg-gray-700/50'
            }`}
            style={{
              background: profile?.theme === theme.id 
                ? `${theme.gradients.running}` 
                : undefined
            }}
          >
            <div className="text-4xl mb-2">{theme.emoji}</div>
            <div className="text-lg font-semibold text-white">{theme.name}</div>
            <div 
              className="w-full h-3 rounded-full mt-2"
              style={{ background: theme.gradients.running }}
            />
          </button>
        ))}
      </div>
      
      <div className="text-center text-gray-500 mt-8">
        <p>Theme changes are saved automatically</p>
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-6 text-center">Accessibility</h2>
      
      {/* High Contrast Mode */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">High Contrast Mode</h3>
            <p className="text-gray-400 mt-1">Increases visibility with bold colors</p>
          </div>
          <button
            onClick={setHighContrastMode}
            className={`px-6 py-3 rounded-xl text-xl font-bold transition-all ${
              state.accessibility.highContrastMode
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {state.accessibility.highContrastMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      
      {/* Reduced Motion */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Reduced Motion</h3>
            <p className="text-gray-400 mt-1">Minimizes animations and transitions</p>
          </div>
          <button
            onClick={setReducedMotion}
            className={`px-6 py-3 rounded-xl text-xl font-bold transition-all ${
              state.accessibility.reducedMotion
                ? 'bg-green-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {state.accessibility.reducedMotion ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      
      {/* Large Text */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Large Text</h3>
            <p className="text-gray-400 mt-1">Increases text size throughout the app</p>
          </div>
          <button
            onClick={setLargeText}
            className={`px-6 py-3 rounded-xl text-xl font-bold transition-all ${
              state.accessibility.largeText
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {state.accessibility.largeText ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      
      {/* Volume Control */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white">Sound Volume</h3>
          <p className="text-gray-400 mt-1">Adjust timer sound effects</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl">🔇</span>
          <input
            type="range"
            min="0"
            max="100"
            value={state.accessibility.audioVolume * 100}
            onChange={(e) => setAudioVolume(parseInt(e.target.value) / 100)}
            className="flex-1 h-3 rounded-full appearance-none cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, ${currentTheme.colors.primary} ${state.accessibility.audioVolume * 100}%, #374151 ${state.accessibility.audioVolume * 100}%)`
            }}
          />
          <span className="text-2xl">🔊</span>
          <span className="text-xl font-bold text-white w-16 text-right">
            {Math.round(state.accessibility.audioVolume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-6 text-center">Profile Settings</h2>
      
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{profile?.emoji || '👤'}</span>
          <div className="flex-1">
            <input
              type="text"
              value={profile?.name || ''}
              onChange={(e) => updateProfile(profile?.id, { name: e.target.value })}
              className="w-full text-2xl font-bold bg-transparent border-b-2 border-gray-600 focus:border-white text-white outline-none py-2"
              placeholder="Profile name"
            />
          </div>
        </div>
        
        {/* Emoji Picker */}
        <div className="mb-6">
          <p className="text-lg text-gray-400 mb-3">Choose emoji:</p>
          <div className="flex flex-wrap gap-2">
            {['⭐', '🦸', '🧙', '🧚', '🦊', '🐱', '🐶', '🦋', '🌈', '🎨', '🎮', '📚', '🎵', '⚽', '🏀', '🌟', '💫', '🚀'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => updateProfile(profile?.id, { emoji })}
                className={`text-3xl p-2 rounded-lg transition-all ${
                  profile?.emoji === emoji 
                    ? 'bg-white/20 scale-125' 
                    : 'hover:bg-gray-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-500 mt-8">
        <p>Profile changes are saved automatically</p>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col p-8"
      style={{ background: currentTheme.gradients.running }}
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('presets')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-6 py-3"
          >
            ← Back
          </button>
          <h1 className="text-5xl font-bold text-white">Settings</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={tab.id === activeTab ? firstButtonRef : null}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-white scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              style={activeTab === tab.id ? { 
                backgroundColor: currentTheme.colors.primary 
              } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'theme' && renderThemeTab()}
          {activeTab === 'accessibility' && renderAccessibilityTab()}
          {activeTab === 'profile' && renderProfileTab()}
        </div>
        
        {/* Footer */}
        <div className="text-center text-lg text-gray-500 mt-8">
          <p>Use DPAD to navigate • Press OK to select</p>
        </div>
      </div>
    </div>
  );
}
