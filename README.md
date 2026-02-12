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

## Next Steps
1. Add Android TV app scaffold
2. Implement timer engine/state machine
3. Build preset grid and running screen
