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

## Execution Plan (ordered)
1) App skeleton (Compose TV + nav)
2) Theme + focus ring
3) Timer engine (monotonic clock)
4) Preset grid + custom picker
5) Running screen (3 styles)
6) DPAD action mapping
7) Sound cues + settings
8) DataStore persistence
9) Focus lock
10) QA evidence pack

## Evidence Required for Demo
- Screen recording: <=3 click start, custom timer, lock mode
- Device test matrix: Fire Stick + Fire TV
- Drift note from timed run
- Commit list + APK path
