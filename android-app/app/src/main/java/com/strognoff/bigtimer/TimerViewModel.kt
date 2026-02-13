package com.strognoff.bigtimer

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class TimerViewModel {
  var state by mutableStateOf(TimerUiState())
    private set

  private var startedAtMs: Long? = null
  private var pausedAtMs: Long? = null
  private var pausedTotalMs: Long = 0

  fun startPreset(minutes: Int) {
    val total = (minutes * 60).coerceAtLeast(0)
    val now = nowElapsedRealtimeMs()

    startedAtMs = now
    pausedAtMs = null
    pausedTotalMs = 0

    state = state.copy(
      phase = if (total == 0) TimerPhase.Finished else TimerPhase.Running,
      totalSeconds = total,
      remainingSeconds = total,
    )
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
  }
}
