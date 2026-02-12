package com.strognoff.bigtimer

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class TimerViewModel {
  var state by mutableStateOf(TimerUiState())
    private set

  fun startPreset(minutes: Int) {
    val total = (minutes * 60).coerceAtLeast(0)
    state = TimerUiState(
      phase = if (total == 0) TimerPhase.Finished else TimerPhase.Running,
      totalSeconds = total,
      remainingSeconds = total,
    )
  }

  fun pause() {
    if (state.phase == TimerPhase.Running) {
      state = state.copy(phase = TimerPhase.Paused)
    }
  }

  fun resume() {
    if (state.phase == TimerPhase.Paused) {
      state = state.copy(phase = TimerPhase.Running)
    }
  }

  fun reset() {
    state = TimerUiState()
  }
}
