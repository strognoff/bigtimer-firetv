package com.strognoff.bigtimer

sealed interface TimerPhase {
  data object Idle : TimerPhase
  data object Running : TimerPhase
  data object Paused : TimerPhase
  data object Finished : TimerPhase
}

data class TimerUiState(
  val phase: TimerPhase = TimerPhase.Idle,
  val totalSeconds: Int = 0,
  val remainingSeconds: Int = 0,
)

fun formatClock(totalSeconds: Int): String {
  val safe = totalSeconds.coerceAtLeast(0)
  val minutes = safe / 60
  val seconds = safe % 60
  return "%02d:%02d".format(minutes, seconds)
}
