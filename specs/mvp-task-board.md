# BigTimer MVP Task Board

## Milestones (one-task-at-a-time execution order)

1. **M1 — App Scaffold** (3h)
   - Compose for TV project bootstrapped
   - Build/install succeeds
   - Evidence: `./gradlew assembleDebug` output

2. **M2 — Focus + Navigation Foundation** (2h)
   - Focus ring + focusable components
   - DPAD movement on home screen with no focus loss
   - Evidence: screenshot + DPAD checklist

3. **M3 — Timer Engine** (4h)
   - Idle/Running/Paused/Finished state machine
   - Monotonic clock implementation
   - Evidence: unit test + timing note

4. **M4 — Presets + Custom** (3h)
   - Default presets and custom duration flow
   - <=3 click start path
   - Evidence: screen recording

5. **M5 — Running Screen Styles** (4h)
   - Pie, bar, big numbers
   - Style switcher
   - Evidence: screenshots of all 3 styles

6. **M6 — Controls + Lock Mode** (4h)
   - Pause/resume/reset via DPAD
   - Focus lock long-press handling
   - Evidence: lock-mode recording

7. **M7 — Sound + Persistence** (4h)
   - Sound cue toggles
   - DataStore for settings/presets
   - Evidence: restart persistence demo

8. **M8 — QA Evidence Pack** (3h)
   - Fire Stick + Fire TV smoke tests
   - Final demo artifacts

## Acceptance Criteria Mapping
- <=3 clicks start: M4
- Drift <= +/-1s/60m: M3
- DPAD + visible focus: M2/M6
- Lock mode: M6
- Persistence: M7
