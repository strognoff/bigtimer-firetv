# BigTimer FireTV

A kid-friendly visual timer app for Amazon Fire TV, built with React, Vite, Tailwind CSS, and Capacitor.

## Features

### MVP Features

- **Quick Presets**: One-tap timers (1m, 2m, 5m, 10m, 15m, 20m, 30m, 45m, 60m, 90m, 120m)
- **Custom Timers**: Set any duration from 1-180 minutes
- **Visual Timer Styles**:
  - **Numbers**: Large digital clock display
  - **Pie Chart**: Circular progress indicator
  - **Progress Bar**: Horizontal bar with percentage
- **Focus Lock Mode**: Prevents accidental exits during timer
- **Sound Effects**:
  - Completion chime
  - Halfway point alert (optional)
  - Last 10 seconds countdown (optional)
- **TV-Optimized**: Full D-pad navigation support for Fire TV remote

### Post-MVP Features

#### 🎨 Themes & Color Palettes
Choose from 8 beautiful themes:
- **Default Blue** - Classic blue tones
- **Space** 🌌 - Purple cosmic vibes
- **Underwater** 🐠 - Teal ocean colors
- **Forest** 🌲 - Green nature tones
- **Sunset** 🌅 - Warm orange/red gradients
- **Candy** 🍬 - Pink and playful
- **Night Mode** 🌙 - Dark indigo for low light
- **High Contrast** 👁️ - Yellow on black for accessibility

#### 📋 Routine Mode
Create sequences of timers that play automatically:
- Build routines with multiple steps (e.g., "Bedtime": 5m tidy → 2m teeth → 10m reading)
- Name each step with custom activity labels
- Visual progress showing current step and overall routine progress
- Skip steps or jump to any step during playback
- Auto-advances between steps with completion sound

#### 👤 Multiple Profiles
Perfect for families with multiple kids:
- Create profiles with custom names and emoji avatars
- Each profile has its own:
  - Theme preference
  - Saved routines
  - Custom timer presets
- Quick profile switching from home screen

#### ♿ Accessibility Options
- **High Contrast Mode**: Bold yellow on black for better visibility
- **Reduced Motion**: Disables all animations for motion sensitivity
- **Large Text Mode**: Increases all text sizes by 20%
- **Volume Control**: Adjustable sound effect volume (0-100%)

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Capacitor** - Native Android/Fire TV wrapper

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Building for Fire TV

```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

Then build the APK from Android Studio and deploy to Fire TV.

## Project Structure

```
web-app/
├── src/
│   ├── App.jsx                 # Main app with routing
│   ├── TimerContext.jsx        # Timer state management
│   ├── SettingsContext.jsx     # Profiles, themes, accessibility
│   ├── RoutineContext.jsx      # Routine execution state
│   ├── themes.js               # Theme definitions
│   ├── components/
│   │   ├── PresetsScreen.jsx   # Home screen with presets
│   │   ├── CustomScreen.jsx    # Custom timer setup
│   │   ├── RunningScreen.jsx   # Timer in progress
│   │   ├── SettingsScreen.jsx  # Theme/accessibility settings
│   │   ├── ProfileSwitcher.jsx # Profile selection modal
│   │   ├── RoutineBuilderScreen.jsx  # Create/edit routines
│   │   └── RunningRoutineScreen.jsx  # Routine playback
│   └── index.css               # Global styles + accessibility
├── android/                    # Capacitor Android project
└── package.json
```

## Data Persistence

All user data is stored in `localStorage`:
- `bigtimer-settings-v2` - Profiles, routines, accessibility settings
- `bigtimer-timer-settings` - Timer preferences (style, sounds, lock)

## Keyboard Controls

| Key | Action |
|-----|--------|
| D-Pad | Navigate between buttons |
| OK/Enter | Select / Toggle pause |
| ← | Pause timer |
| → | Reset/Exit (when unlocked) |
| ↑ | Open sound settings |
| ↓ | Cycle timer style |
| Back/Escape | Exit / Go back |
| S | Open Settings |
| R | Open Routines |
| P | Switch Profile |

## License

MIT
