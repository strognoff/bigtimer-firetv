package com.strognoff.bigtimer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.delay
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent { BigTimerApp() }
  }
}

@Composable
fun BigTimerApp() {
  val vm = TimerViewModel()
  val ui = vm.state

  LaunchedEffect(ui.phase, ui.totalSeconds) {
    while (ui.phase == TimerPhase.Running) {
      vm.tick()
      delay(250)
    }
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(20.dp),
  ) {
    Text("BigTimer", style = MaterialTheme.typography.headlineLarge)
    Text("Phase: ${ui.phase}")
    Text("Time: ${formatClock(ui.remainingSeconds)}", style = MaterialTheme.typography.displaySmall)

    Text("Presets")
    PresetRow(listOf(1, 2, 5, 10), onSelect = vm::startPreset)
    PresetRow(listOf(15, 20, 30, 45), onSelect = vm::startPreset)

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
      Button(onClick = vm::pause, enabled = ui.phase == TimerPhase.Running) { Text("Pause") }
      Button(onClick = vm::resume, enabled = ui.phase == TimerPhase.Paused) { Text("Resume") }
      Button(onClick = vm::reset) { Text("Reset") }
    }

    Text(
      "MVP shell: timer ticking + DPAD focus behaviors next.",
      style = MaterialTheme.typography.bodyLarge,
    )
  }
}

@Composable
private fun PresetRow(minutes: List<Int>, onSelect: (Int) -> Unit) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(10.dp),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    minutes.forEach { min ->
      Button(onClick = { onSelect(min) }) {
        Text("${min}m")
      }
    }
  }
}
