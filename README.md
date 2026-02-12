# BigTimer (Fire TV)

TV-first visual countdown timer for kids routines.

## Status
In active implementation from SuperNova issue: https://github.com/strognoff/strognoff/issues/6

## MVP Goals
- Start preset timer in <=3 clicks
- Accurate timer drift (<= +/-1s over 60m)
- Full DPAD navigation with visible focus
- Focus lock for stop/reset
- Presets/settings persist across restart

## Planned Stack
- Kotlin
- Jetpack Compose for TV
- DataStore

## Initial Project Structure
- `specs/` product and technical specs
- `android-app/` Android project scaffold (to be added)
- `qa/` test checklists and demo evidence

## Build Baseline (current)
Android scaffold is in `android-app/`.

Bootstrap + build:
```bash
cd android-app
./bootstrap.sh
./gradlew assembleDebug
```

Current status:
- ✅ Gradle wrapper generated and committed
- ✅ `./gradlew assembleDebug` successful on host
- Debug APK generated at:
  - `android-app/app/build/outputs/apk/debug/app-debug.apk`

Detailed setup: `docs/SETUP.md`

## Next Steps
1. Implement timer engine/state machine
2. Build preset grid and running screen
3. Add DPAD focus behaviors + lock mode
