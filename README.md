# BigTimer (Fire TV)

TV-first visual countdown timer for kids' routines. Huge visuals, fast presets, optional sound cues, and focus lock to prevent kids from accidentally stopping the timer.

## Features

### MVP Features
- **Preset timers**: 1/2/5/10/15/20/30/45/60/90/120 minutes
- **Custom timer**: with +/- 1min and 5min adjustments
- **Visual styles**: Numbers, Pie chart, Progress bar
- **Sound cues**: completion, halfway point, last 10 seconds
- **Controls**: Pause/Resume/Reset
- **Focus lock**: prevent accidental exit (long-press required)
- **TV-optimized UI**: Large buttons, DPAD navigation, high contrast
- **Capacitor**: Ready for Fire TV Android deployment

### Post-MVP Features
- 🎨 **8 Themes**: Default, Space, Underwater, Forest, Sunset, Candy, Night Mode, High Contrast
- 📋 **Routine Mode**: Create sequences like "5m tidy → 2m teeth → 10m reading"
- 👤 **Multiple Profiles**: Each kid gets their own presets, routines, and theme
- ♿ **Accessibility**: High contrast mode, reduced motion, large text, volume control

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** - Fast dev server and build
- **Tailwind CSS 4** - Utility-first styling
- **Capacitor 8** - Android/Fire TV deployment

## Development

```bash
cd web-app
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
cd web-app
npm run build
```

Production build in `web-app/dist/`

## Fire TV / Android Build

```bash
cd web-app
npm run build
npx cap sync android
npx cap open android
```

Then build APK in Android Studio.

## Project Structure

```
web-app/
├── src/
│   ├── App.jsx                 # Main app with screen routing
│   ├── TimerContext.jsx        # Timer state machine
│   ├── RoutineContext.jsx      # Routine execution state
│   ├── SettingsContext.jsx     # Profiles, themes, accessibility
│   ├── themes.js               # 8 theme definitions
│   ├── components/
│   │   ├── PresetsScreen.jsx   # Home screen with preset buttons
│   │   ├── CustomScreen.jsx    # Custom timer setup
│   │   ├── RunningScreen.jsx   # Timer display and controls
│   │   ├── RoutineBuilderScreen.jsx  # Create/edit routines
│   │   ├── RunningRoutineScreen.jsx  # Routine playback
│   │   ├── ProfileSwitcher.jsx # Profile selection modal
│   │   └── SettingsScreen.jsx  # Settings panel with tabs
│   └── index.css               # Tailwind + theme styles
└── package.json
```

## TV Navigation

| Key | Action |
|-----|--------|
| ↑/↓/←/→ | Navigate between buttons |
| Enter/OK | Select / Start timer |
| Back/Escape | Go back / Stop timer |
| Left (during timer) | Pause/Resume |
| Right (during timer) | Reset |
| Long-press OK | Exit when focus lock enabled |

## Target Platform

- **Primary**: Amazon Fire TV (Android)
- **Secondary**: Any modern browser

## License

MIT
