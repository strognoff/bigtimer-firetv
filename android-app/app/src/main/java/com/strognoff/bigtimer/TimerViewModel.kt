package com.strognoff.bigtimer

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class TimerViewModel {
  var state by mutableStateOf(TimerUiState())
    private set

  var onSoundEvent: ((SoundEvent) -> Unit)? = null

  enum class SoundEvent {
    START,
    FINISH,
    HALFWAY,
    LAST_TEN
  }

  private var startedAtMs: Long? = null
  private var pausedAtMs: Long? = null
  private var pausedTotalMs: Long = 0
  private var halfwayPlayed: Boolean = false
  private var lastTenPlayed: Boolean = false

  fun startPreset(minutes: Int) {
    val safeMinutes = minutes.coerceAtLeast(0)
    val total = (safeMinutes * 60).coerceAtLeast(0)
    val now = nowElapsedRealtimeMs()

    startedAtMs = now
    pausedAtMs = null
    pausedTotalMs = 0
    halfwayPlayed = false
    lastTenPlayed = false

    state = state.copy(
      phase = if (total == 0) TimerPhase.Finished else TimerPhase.Running,
      totalSeconds = total,
      remainingSeconds = total,
      lastCustomMinutes = safeMinutes.coerceIn(1, 180),
    )

    // Play start sound if enabled
    if (state.soundEnabled && total > 0) {
      onSoundEvent?.invoke(SoundEvent.START)
    }
  }

  fun pause() {
    if (state.phase == TimerPhase.Running) {
      pausedAtMs = nowElapsedRealtimeMs()
      state = state.copy(phase = TimerPhase.Paused)
    }
  }

  fun resume() {
    if (state.phase == TimerPhase.Paused) {
      val now = nowElapsedRealtimeMs()
      val pausedAt = pausedAtMs
      if (pausedAt != null) {
        pausedTotalMs += (now - pausedAt).coerceAtLeast(0)
      }
      pausedAtMs = null
      state = state.copy(phase = TimerPhase.Running)
    }
  }

  fun toggleFocusLock() {
    state = state.copy(focusLockEnabled = !state.focusLockEnabled)
  }

  fun cycleStyle() {
    val next = when (state.style) {
      TimerStyle.Numbers -> TimerStyle.Pie
      TimerStyle.Pie -> TimerStyle.Bar
      TimerStyle.Bar -> TimerStyle.Numbers
    }
    state = state.copy(style = next)
  }

  fun setLastCustomMinutes(minutes: Int) {
    state = state.copy(lastCustomMinutes = minutes.coerceIn(1, 180))
  }

  fun toggleSound() {
    state = state.copy(soundEnabled = !state.soundEnabled)
  }

  fun toggleHalfway() {
    state = state.copy(soundHalfway = !state.soundHalfway)
  }

  fun toggleLastTen() {
    state = state.copy(soundLastTen = !state.soundLastTen)
  }

  fun applyPersistedSettings(focusLockEnabled: Boolean, style: TimerStyle, lastCustomMinutes: Int, soundEnabled: Boolean = true, soundHalfway: Boolean = false, soundLastTen: Boolean = false) {
    state = state.copy(
      focusLockEnabled = focusLockEnabled,
      style = style,
      lastCustomMinutes = lastCustomMinutes.coerceIn(1, 180),
      soundEnabled = soundEnabled,
      soundHalfway = soundHalfway,
      soundLastTen = soundLastTen,
    )
  }

  fun reset() {
    startedAtMs = null
    pausedAtMs = null
    pausedTotalMs = 0
    state = TimerUiState(
      focusLockEnabled = state.focusLockEnabled,
      style = state.style,
    )
  }

  /**
   * Call periodically while Running to compute remaining time based on monotonic elapsed time.
   */
  fun tick() {
    if (state.phase != TimerPhase.Running) return
    val start = startedAtMs ?: return
    val now = nowElapsedRealtimeMs()

    val elapsedMs = (now - start - pausedTotalMs).coerceAtLeast(0)
    val elapsedSeconds = (elapsedMs / 1000L).toInt()

    val remaining = (state.totalSeconds - elapsedSeconds).coerceAtLeast(0)
    val nextPhase = if (remaining == 0) TimerPhase.Finished else TimerPhase.Running

    if (remaining != state.remainingSeconds || nextPhase != state.phase) {
      state = state.copy(remainingSeconds = remaining, phase = nextPhase)
    }

    // Sound cues
    if (state.soundEnabled) {
      // Halfway point
      if (state.soundHalfway && !halfwayPlayed && state.totalSeconds > 0) {
        val halfwaySeconds = state.totalSeconds / 2
        if (remaining <= halfwaySeconds && remaining > 0) {
          halfwayPlayed = true
          onSoundEvent?.invoke(SoundEvent.HALFWAY)
        }
      }

      // Last 10 seconds
      if (state.soundLastTen && !lastTenPlayed && remaining <= 10 && remaining > 0) {
        lastTenPlayed = true
        onSoundEvent?.invoke(SoundEvent.LAST_TEN)
      }

      // Finish
      if (remaining == 0 && nextPhase == TimerPhase.Finished) {
        onSoundEvent?.invoke(SoundEvent.FINISH)
      }
    }
  }
}
