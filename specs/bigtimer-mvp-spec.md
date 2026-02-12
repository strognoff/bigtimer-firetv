# BigTimer MVP Spec (Issue #6)

Source issue: https://github.com/strognoff/strognoff/issues/6

## Goal
A TV-first countdown timer for kids routines with very fast start, large visuals, and reliable DPAD navigation.

## MVP Scope
- Presets: 1/2/5/10/15/20/30/45/60 + Custom
- Visual styles: Pie, Bar, Big Numbers
- Controls: pause/resume/reset
- Optional sound cues: start/halfway/last10s/finish
- Focus lock: long-press OK required to stop/reset
- Persistence: presets/settings survive restart

## Acceptance Criteria
1. Start preset timer in <=3 clicks from launch
2. Drift <= +/-1s over 60 minutes
3. Full DPAD navigation with visible focus state
4. Focus lock prevents accidental stop/reset
5. Presets/settings persist across restart

## Technical Architecture (MVP)
- Platform: Fire TV (Android), Kotlin + Jetpack Compose for TV
- App shape: single-activity app with Compose Navigation (Home, Custom, Running, Settings)
- Timer engine: monotonic clock (`SystemClock.elapsedRealtime`) with derived remaining time
- Persistence: Jetpack DataStore for settings + presets
- Audio: local short cues (start, halfway, last-10s, finish)
- Backend: none for MVP

## DPAD Interaction Matrix
- Home
  - DPAD: move focus across preset tiles
  - OK: start selected preset
  - Back: exit app
- Running
  - Left: pause/resume
  - Right: reset (or long-press when lock enabled)
  - Down: open style selector
  - Back: confirm exit when running
- Settings
  - DPAD: move through toggles/sliders
  - OK: toggle/select
  - Back: return to previous screen

## Execution Plan (ordered, estimated)
1) App skeleton (Compose TV + nav) — 3h
2) Theme + focus ring — 2h
3) Timer engine (monotonic clock) — 4h
4) Preset grid + custom picker — 3h
5) Running screen (3 styles) — 4h
6) DPAD action mapping — 2h
7) Sound cues + settings — 2h
8) DataStore persistence — 2h
9) Focus lock — 2h
10) QA evidence pack — 3h

Estimated total: 27h

## Evidence Required for Demo
- Screen recording: <=3 click start, custom timer, lock mode
- Device test matrix: Fire Stick + Fire TV
- Drift note from timed run
- Commit list + APK path
- DPAD checklist result (all screens, no lost focus)
