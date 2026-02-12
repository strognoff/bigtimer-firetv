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

Local bootstrap:
```bash
make bootstrap
```

Build (after wrapper exists):
```bash
make build
```

Current environment blocker:
- `gradle` is not installed on this machine, so wrapper generation/build cannot run yet.

Once Gradle is installed:
```bash
cd android-app
gradle wrapper --gradle-version 8.7
./gradlew assembleDebug
```

Detailed setup: `docs/SETUP.md`

## Next Steps
1. Generate Gradle wrapper + first successful `assembleDebug`
2. Implement timer engine/state machine
3. Build preset grid and running screen
