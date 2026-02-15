import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../SettingsContext';

export default function ProfileSwitcher({ onClose }) {
  const { 
    state, 
    getActiveTheme,
    setActiveProfile, 
    createProfile, 
    deleteProfile,
  } = useSettings();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmoji, setNewProfileEmoji] = useState('⭐');
  const firstButtonRef = useRef(null);
  const currentTheme = getActiveTheme();
  
  const emojis = ['⭐', '🦸', '🧙', '🧚', '🦊', '🐱', '🐶', '🦋', '🌈', '🎨', '🎮', '📚', '🎵', '⚽', '🏀', '🌟', '💫', '🚀'];

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectProfile = (profileId) => {
    setActiveProfile(profileId);
    onClose();
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim(), newProfileEmoji);
      setShowCreateForm(false);
      setNewProfileName('');
      setNewProfileEmoji('⭐');
    }
  };

  const handleDeleteProfile = (e, profileId) => {
    e.stopPropagation();
    if (state.profiles.length > 1) {
      deleteProfile(profileId);
    }
  };

  if (showCreateForm) {
    return (
      <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}
      >
        <div 
          className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 animate-fade-in"
          style={{ background: currentTheme.gradients.running }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">New Profile</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-lg text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full text-2xl p-4 rounded-xl bg-gray-900/50 text-white border-2 border-gray-600 focus:border-white outline-none"
                placeholder="Enter name..."
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-lg text-gray-400 mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewProfileEmoji(emoji)}
                    className={`text-3xl p-3 rounded-lg transition-all ${
                      newProfileEmoji === emoji 
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
          
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleCreateProfile}
              disabled={!newProfileName.trim()}
              className="btn-preset bg-green-600 hover:bg-green-500 text-xl px-8 py-4 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="rounded-2xl p-8 max-w-2xl w-full mx-4 animate-fade-in"
        style={{ background: currentTheme.gradients.running }}
      >
        <h2 className="text-4xl font-bold text-white mb-6 text-center">Switch Profile</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {state.profiles.map((profile, index) => (
            <button
              key={profile.id}
              ref={index === 0 ? firstButtonRef : null}
              onClick={() => handleSelectProfile(profile.id)}
              className={`relative p-6 rounded-xl transition-all text-center ${
                state.activeProfileId === profile.id
                  ? 'ring-4 ring-white scale-105'
                  : 'hover:bg-gray-700/50'
              }`}
              style={state.activeProfileId === profile.id ? {
                background: 'rgba(255,255,255,0.2)',
              } : undefined}
            >
              <div className="text-5xl mb-2">{profile.emoji}</div>
              <div className="text-xl font-bold text-white">{profile.name}</div>
              {state.activeProfileId === profile.id && (
                <div className="text-sm text-green-400 mt-2">✓ Active</div>
              )}
              
              {/* Delete button (only if more than one profile) */}
              {state.profiles.length > 1 && profile.id !== 'default' && (
                <button
                  onClick={(e) => handleDeleteProfile(e, profile.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/50 hover:bg-red-500 text-white text-lg flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </button>
          ))}
          
          {/* Add new profile button */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-6 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all text-center border-2 border-dashed border-gray-600"
          >
            <div className="text-5xl mb-2 text-gray-400">+</div>
            <div className="text-xl text-gray-400">Add Profile</div>
          </button>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            ref={state.profiles.length === 0 ? firstButtonRef : null}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
