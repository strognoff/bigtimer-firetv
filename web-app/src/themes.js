// Theme definitions for BigTimer
// Each theme has a name, background gradient, and color palette

export const THEMES = {
  default: {
    id: 'default',
    name: 'Default Blue',
    emoji: '💙',
    colors: {
      primary: '#7AA2FF',
      secondary: '#2A3D75',
      accent: '#4CAF50',
      background: ['#0b0f17', '#1e293b'],
      text: '#ffffff',
      muted: '#9ca3af',
    },
    gradients: {
      running: 'linear-gradient(135deg, #1e293b 0%, #0b0f17 50%, #1a1f2e 100%)',
      paused: 'linear-gradient(135deg, #2d2a1f 0%, #1a1a17 50%, #2a251a 100%)',
      finished: 'linear-gradient(135deg, #1f3d1f 0%, #0f1f0f 50%, #1a2f1a 100%)',
    },
    presetColors: {
      short: 'bg-emerald-600 hover:bg-emerald-500',    // 1-5 min
      medium: 'bg-blue-600 hover:bg-blue-500',         // 6-15 min
      mediumLong: 'bg-purple-600 hover:bg-purple-500', // 16-30 min
      long: 'bg-orange-600 hover:bg-orange-500',       // 31-60 min
      veryLong: 'bg-red-600 hover:bg-red-500',         // 60+ min
    }
  },
  
  space: {
    id: 'space',
    name: 'Space',
    emoji: '🌌',
    colors: {
      primary: '#a855f7',
      secondary: '#6b21a8',
      accent: '#22d3ee',
      background: ['#0c0a1a', '#1a0a2e'],
      text: '#ffffff',
      muted: '#a78bfa',
    },
    gradients: {
      running: 'linear-gradient(135deg, #1a0a2e 0%, #0c0a1a 50%, #16082a 100%)',
      paused: 'linear-gradient(135deg, #2a1a3e 0%, #1a0a2a 50%, #2a103a 100%)',
      finished: 'linear-gradient(135deg, #0a2a3e 0%, #0a1a2e 50%, #103040 100%)',
    },
    presetColors: {
      short: 'bg-violet-600 hover:bg-violet-500',
      medium: 'bg-indigo-600 hover:bg-indigo-500',
      mediumLong: 'bg-purple-600 hover:bg-purple-500',
      long: 'bg-fuchsia-600 hover:bg-fuchsia-500',
      veryLong: 'bg-pink-600 hover:bg-pink-500',
    }
  },
  
  underwater: {
    id: 'underwater',
    name: 'Underwater',
    emoji: '🐠',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#10b981',
      background: ['#042f2e', '#0c4a4a'],
      text: '#ffffff',
      muted: '#67e8f9',
    },
    gradients: {
      running: 'linear-gradient(135deg, #0c4a4a 0%, #042f2e 50%, #0a3d3d 100%)',
      paused: 'linear-gradient(135deg, #1a4a4a 0%, #0a3a3a 50%, #1a5050 100%)',
      finished: 'linear-gradient(135deg, #0a4a3a 0%, #042a2a 50%, #0a4035 100%)',
    },
    presetColors: {
      short: 'bg-teal-500 hover:bg-teal-400',
      medium: 'bg-cyan-600 hover:bg-cyan-500',
      mediumLong: 'bg-sky-600 hover:bg-sky-500',
      long: 'bg-blue-600 hover:bg-blue-500',
      veryLong: 'bg-indigo-600 hover:bg-indigo-500',
    }
  },
  
  forest: {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    colors: {
      primary: '#22c55e',
      secondary: '#15803d',
      accent: '#eab308',
      background: ['#052e16', '#14532d'],
      text: '#ffffff',
      muted: '#86efac',
    },
    gradients: {
      running: 'linear-gradient(135deg, #14532d 0%, #052e16 50%, #0f3d1f 100%)',
      paused: 'linear-gradient(135deg, #2d5a3a 0%, #1a3d2a 50%, #2a5035 100%)',
      finished: 'linear-gradient(135deg, #3d5a2d 0%, #1a3d1a 50%, #305020 100%)',
    },
    presetColors: {
      short: 'bg-green-500 hover:bg-green-400',
      medium: 'bg-emerald-600 hover:bg-emerald-500',
      mediumLong: 'bg-lime-600 hover:bg-lime-500',
      long: 'bg-yellow-600 hover:bg-yellow-500',
      veryLong: 'bg-amber-600 hover:bg-amber-500',
    }
  },
  
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#ec4899',
      background: ['#431407', '#7c2d12'],
      text: '#ffffff',
      muted: '#fdba74',
    },
    gradients: {
      running: 'linear-gradient(135deg, #7c2d12 0%, #431407 50%, #6b240a 100%)',
      paused: 'linear-gradient(135deg, #5c3d20 0%, #3a2010 50%, #5a3020 100%)',
      finished: 'linear-gradient(135deg, #4a3d20 0%, #2a2010 50%, #403015 100%)',
    },
    presetColors: {
      short: 'bg-orange-500 hover:bg-orange-400',
      medium: 'bg-amber-600 hover:bg-amber-500',
      mediumLong: 'bg-yellow-600 hover:bg-yellow-500',
      long: 'bg-red-500 hover:bg-red-400',
      veryLong: 'bg-rose-600 hover:bg-rose-500',
    }
  },
  
  candy: {
    id: 'candy',
    name: 'Candy',
    emoji: '🍬',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#8b5cf6',
      background: ['#500724', '#831843'],
      text: '#ffffff',
      muted: '#f9a8d4',
    },
    gradients: {
      running: 'linear-gradient(135deg, #831843 0%, #500724 50%, #701a40 100%)',
      paused: 'linear-gradient(135deg, #6a3050 0%, #401030 50%, #602040 100%)',
      finished: 'linear-gradient(135deg, #503050 0%, #301030 50%, #452045 100%)',
    },
    presetColors: {
      short: 'bg-pink-500 hover:bg-pink-400',
      medium: 'bg-rose-500 hover:bg-rose-400',
      mediumLong: 'bg-fuchsia-500 hover:bg-fuchsia-400',
      long: 'bg-purple-500 hover:bg-purple-400',
      veryLong: 'bg-violet-500 hover:bg-violet-400',
    }
  },
  
  night: {
    id: 'night',
    name: 'Night Mode',
    emoji: '🌙',
    colors: {
      primary: '#6366f1',
      secondary: '#4338ca',
      accent: '#a855f7',
      background: ['#0f0f23', '#1a1a2e'],
      text: '#e0e0ff',
      muted: '#818cf8',
    },
    gradients: {
      running: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 50%, #161630 100%)',
      paused: 'linear-gradient(135deg, #252540 0%, #151528 50%, #202038 100%)',
      finished: 'linear-gradient(135deg, #1a2540 0%, #0f1528 50%, #152035 100%)',
    },
    presetColors: {
      short: 'bg-indigo-500 hover:bg-indigo-400',
      medium: 'bg-blue-700 hover:bg-blue-600',
      mediumLong: 'bg-violet-700 hover:bg-violet-600',
      long: 'bg-purple-700 hover:bg-purple-600',
      veryLong: 'bg-slate-600 hover:bg-slate-500',
    }
  },

  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    emoji: '👁️',
    colors: {
      primary: '#ffff00',
      secondary: '#000000',
      accent: '#00ff00',
      background: ['#000000', '#000000'],
      text: '#ffffff',
      muted: '#ffffff',
    },
    gradients: {
      running: 'linear-gradient(135deg, #000000 0%, #000000 100%)',
      paused: 'linear-gradient(135deg, #1a1a00 0%, #000000 100%)',
      finished: 'linear-gradient(135deg, #001a00 0%, #000000 100%)',
    },
    presetColors: {
      short: 'bg-yellow-400 hover:bg-yellow-300 text-black',
      medium: 'bg-yellow-500 hover:bg-yellow-400 text-black',
      mediumLong: 'bg-yellow-600 hover:bg-yellow-500 text-black',
      long: 'bg-yellow-400 hover:bg-yellow-300 text-black',
      veryLong: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    }
  }
};

// Get theme by ID, fallback to default
export function getTheme(themeId) {
  return THEMES[themeId] || THEMES.default;
}

// Get all themes as array
export function getAllThemes() {
  return Object.values(THEMES);
}

// Get preset color class based on minutes and theme
export function getPresetColorClass(minutes, themeId) {
  const theme = getTheme(themeId);
  if (minutes <= 5) return theme.presetColors.short;
  if (minutes <= 15) return theme.presetColors.medium;
  if (minutes <= 30) return theme.presetColors.mediumLong;
  if (minutes <= 60) return theme.presetColors.long;
  return theme.presetColors.veryLong;
}
