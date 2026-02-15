import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getTheme, getAllThemes } from './themes';

const SettingsContext = createContext();

// Accessibility defaults
const defaultAccessibility = {
  highContrastMode: false,
  reducedMotion: false,
  audioVolume: 0.5, // 0-1
  largeText: false,
};

// Default profile template
const createDefaultProfile = (id, name, emoji = '👤') => ({
  id,
  name,
  emoji,
  presets: [1, 2, 5, 10, 15, 20, 30, 45, 60, 90, 120],
  routines: [],
  theme: 'default',
  customSettings: {
    soundEnabled: true,
    soundHalfway: false,
    soundLastTen: false,
    focusLockEnabled: false,
    timerStyle: 'NUMBERS',
  },
  createdAt: Date.now(),
});

// Initial state
const initialState = {
  // Profiles
  profiles: [
    createDefaultProfile('default', 'Default', '⭐'),
  ],
  activeProfileId: 'default',
  
  // Accessibility
  accessibility: { ...defaultAccessibility },
  
  // App-level settings
  lastUsedProfileId: 'default',
  
  // UI State
  showProfileSwitcher: false,
  showSettingsPanel: false,
};

// Action types
const ACTIONS = {
  // Profile actions
  SET_ACTIVE_PROFILE: 'SET_ACTIVE_PROFILE',
  CREATE_PROFILE: 'CREATE_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  DELETE_PROFILE: 'DELETE_PROFILE',
  UPDATE_PROFILE_PRESETS: 'UPDATE_PROFILE_PRESETS',
  UPDATE_PROFILE_THEME: 'UPDATE_PROFILE_THEME',
  UPDATE_PROFILE_SETTINGS: 'UPDATE_PROFILE_SETTINGS',
  
  // Routine actions
  CREATE_ROUTINE: 'CREATE_ROUTINE',
  UPDATE_ROUTINE: 'UPDATE_ROUTINE',
  DELETE_ROUTINE: 'DELETE_ROUTINE',
  REORDER_ROUTINES: 'REORDER_ROUTINES',
  
  // Accessibility actions
  SET_ACCESSIBILITY: 'SET_ACCESSIBILITY',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  TOGGLE_REDUCED_MOTION: 'TOGGLE_REDUCED_MOTION',
  SET_AUDIO_VOLUME: 'SET_AUDIO_VOLUME',
  TOGGLE_LARGE_TEXT: 'TOGGLE_LARGE_TEXT',
  
  // UI actions
  TOGGLE_PROFILE_SWITCHER: 'TOGGLE_PROFILE_SWITCHER',
  TOGGLE_SETTINGS_PANEL: 'TOGGLE_SETTINGS_PANEL',
  
  // Load/Save
  LOAD_SETTINGS: 'LOAD_SETTINGS',
};

// Reducer
function settingsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ACTIVE_PROFILE: {
      return {
        ...state,
        activeProfileId: action.payload.profileId,
        lastUsedProfileId: action.payload.profileId,
        showProfileSwitcher: false,
      };
    }
    
    case ACTIONS.CREATE_PROFILE: {
      const newProfile = createDefaultProfile(
        `profile-${Date.now()}`,
        action.payload.name,
        action.payload.emoji
      );
      return {
        ...state,
        profiles: [...state.profiles, newProfile],
        activeProfileId: newProfile.id,
      };
    }
    
    case ACTIONS.UPDATE_PROFILE: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === action.payload.profileId 
            ? { ...p, ...action.payload.updates }
            : p
        ),
      };
    }
    
    case ACTIONS.DELETE_PROFILE: {
      const filteredProfiles = state.profiles.filter(p => p.id !== action.payload.profileId);
      // Don't delete if it's the last profile
      if (filteredProfiles.length === 0) return state;
      
      return {
        ...state,
        profiles: filteredProfiles,
        activeProfileId: state.activeProfileId === action.payload.profileId 
          ? filteredProfiles[0].id 
          : state.activeProfileId,
      };
    }
    
    case ACTIONS.UPDATE_PROFILE_PRESETS: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, presets: action.payload.presets }
            : p
        ),
      };
    }
    
    case ACTIONS.UPDATE_PROFILE_THEME: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, theme: action.payload.themeId }
            : p
        ),
      };
    }
    
    case ACTIONS.UPDATE_PROFILE_SETTINGS: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, customSettings: { ...p.customSettings, ...action.payload.settings } }
            : p
        ),
      };
    }
    
    case ACTIONS.CREATE_ROUTINE: {
      const newRoutine = {
        id: `routine-${Date.now()}`,
        name: action.payload.name,
        emoji: action.payload.emoji || '📋',
        steps: action.payload.steps || [],
        createdAt: Date.now(),
      };
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, routines: [...p.routines, newRoutine] }
            : p
        ),
      };
    }
    
    case ACTIONS.UPDATE_ROUTINE: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? {
                ...p,
                routines: p.routines.map(r => 
                  r.id === action.payload.routineId 
                    ? { ...r, ...action.payload.updates }
                    : r
                ),
              }
            : p
        ),
      };
    }
    
    case ACTIONS.DELETE_ROUTINE: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, routines: p.routines.filter(r => r.id !== action.payload.routineId) }
            : p
        ),
      };
    }
    
    case ACTIONS.REORDER_ROUTINES: {
      return {
        ...state,
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, routines: action.payload.routines }
            : p
        ),
      };
    }
    
    case ACTIONS.SET_ACCESSIBILITY: {
      return {
        ...state,
        accessibility: { ...state.accessibility, ...action.payload },
      };
    }
    
    case ACTIONS.TOGGLE_HIGH_CONTRAST: {
      const newValue = !state.accessibility.highContrastMode;
      return {
        ...state,
        accessibility: { 
          ...state.accessibility, 
          highContrastMode: newValue 
        },
        // Also switch to high contrast theme
        profiles: state.profiles.map(p => 
          p.id === state.activeProfileId 
            ? { ...p, theme: newValue ? 'highContrast' : 'default' }
            : p
        ),
      };
    }
    
    case ACTIONS.TOGGLE_REDUCED_MOTION: {
      return {
        ...state,
        accessibility: { 
          ...state.accessibility, 
          reducedMotion: !state.accessibility.reducedMotion 
        },
      };
    }
    
    case ACTIONS.SET_AUDIO_VOLUME: {
      return {
        ...state,
        accessibility: { 
          ...state.accessibility, 
          audioVolume: Math.max(0, Math.min(1, action.payload.volume)) 
        },
      };
    }
    
    case ACTIONS.TOGGLE_LARGE_TEXT: {
      return {
        ...state,
        accessibility: { 
          ...state.accessibility, 
          largeText: !state.accessibility.largeText 
        },
      };
    }
    
    case ACTIONS.TOGGLE_PROFILE_SWITCHER: {
      return {
        ...state,
        showProfileSwitcher: !state.showProfileSwitcher,
        showSettingsPanel: false,
      };
    }
    
    case ACTIONS.TOGGLE_SETTINGS_PANEL: {
      return {
        ...state,
        showSettingsPanel: !state.showSettingsPanel,
        showProfileSwitcher: false,
      };
    }
    
    case ACTIONS.LOAD_SETTINGS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    
    default:
      return state;
  }
}

// Provider component
export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bigtimer-settings-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: ACTIONS.LOAD_SETTINGS, payload: parsed });
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }, []);

  // Save to localStorage on state change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const toSave = {
          profiles: state.profiles,
          activeProfileId: state.activeProfileId,
          accessibility: state.accessibility,
          lastUsedProfileId: state.lastUsedProfileId,
        };
        localStorage.setItem('bigtimer-settings-v2', JSON.stringify(toSave));
      } catch (e) {
        console.warn('Failed to save settings:', e);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.profiles, state.activeProfileId, state.accessibility, state.lastUsedProfileId]);

  // Apply reduced motion globally
  useEffect(() => {
    if (state.accessibility.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [state.accessibility.reducedMotion]);

  // Apply large text globally
  useEffect(() => {
    if (state.accessibility.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [state.accessibility.largeText]);

  // Helper functions
  const getActiveProfile = useCallback(() => {
    return state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];
  }, [state.profiles, state.activeProfileId]);

  const getActiveTheme = useCallback(() => {
    const profile = getActiveProfile();
    return getTheme(profile?.theme || 'default');
  }, [getActiveProfile]);

  const getAccessibilityVolume = useCallback(() => {
    return state.accessibility.audioVolume;
  }, [state.accessibility.audioVolume]);

  const isReducedMotion = useCallback(() => {
    return state.accessibility.reducedMotion;
  }, [state.accessibility.reducedMotion]);

  const value = {
    state,
    dispatch,
    ACTIONS,
    
    // Helper functions
    getActiveProfile,
    getActiveTheme,
    getAccessibilityVolume,
    isReducedMotion,
    getAllThemes,
    
    // Profile helpers
    setActiveProfile: (profileId) => 
      dispatch({ type: ACTIONS.SET_ACTIVE_PROFILE, payload: { profileId } }),
    createProfile: (name, emoji) => 
      dispatch({ type: ACTIONS.CREATE_PROFILE, payload: { name, emoji } }),
    updateProfile: (profileId, updates) => 
      dispatch({ type: ACTIONS.UPDATE_PROFILE, payload: { profileId, updates } }),
    deleteProfile: (profileId) => 
      dispatch({ type: ACTIONS.DELETE_PROFILE, payload: { profileId } }),
    
    // Theme helpers
    setTheme: (themeId) => 
      dispatch({ type: ACTIONS.UPDATE_PROFILE_THEME, payload: { themeId } }),
    
    // Routine helpers
    createRoutine: (name, emoji, steps) => 
      dispatch({ type: ACTIONS.CREATE_ROUTINE, payload: { name, emoji, steps } }),
    updateRoutine: (routineId, updates) => 
      dispatch({ type: ACTIONS.UPDATE_ROUTINE, payload: { routineId, updates } }),
    deleteRoutine: (routineId) => 
      dispatch({ type: ACTIONS.DELETE_ROUTINE, payload: { routineId } }),
    
    // Accessibility helpers
    setHighContrastMode: () => 
      dispatch({ type: ACTIONS.TOGGLE_HIGH_CONTRAST }),
    setReducedMotion: () => 
      dispatch({ type: ACTIONS.TOGGLE_REDUCED_MOTION }),
    setAudioVolume: (volume) => 
      dispatch({ type: ACTIONS.SET_AUDIO_VOLUME, payload: { volume } }),
    setLargeText: () => 
      dispatch({ type: ACTIONS.TOGGLE_LARGE_TEXT }),
    
    // UI helpers
    toggleProfileSwitcher: () => 
      dispatch({ type: ACTIONS.TOGGLE_PROFILE_SWITCHER }),
    toggleSettingsPanel: () => 
      dispatch({ type: ACTIONS.TOGGLE_SETTINGS_PANEL }),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext;
