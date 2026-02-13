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
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
// (no AlertDialog in current deps; using inline confirm UI)
import androidx.compose.ui.unit.Dp
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
  var showExitConfirm by remember { mutableStateOf(false) }

  LaunchedEffect(ui.phase, ui.totalSeconds) {
    while (ui.phase == TimerPhase.Running) {
      vm.tick()
      delay(250)
    }
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp)
      .onKeyEvent { ev ->
        // Back should confirm exit while running/paused.
        if (ev.type == KeyEventType.KeyUp && ev.key == Key.Back) {
          if (ui.phase == TimerPhase.Running || ui.phase == TimerPhase.Paused) {
            showExitConfirm = true
            return@onKeyEvent true
          }
        }
        false
      },
    verticalArrangement = Arrangement.spacedBy(20.dp),
  ) {
    if (showExitConfirm) {
      Text("Exit timer?", style = MaterialTheme.typography.titleLarge)
      Text("Your timer will be reset.")
      Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        FocusRingButton(onClick = {
          vm.reset()
          showExitConfirm = false
        }) { Text("Exit") }
        FocusRingButton(onClick = { showExitConfirm = false }) { Text("Cancel") }
      }
    }

    Text("BigTimer", style = MaterialTheme.typography.headlineLarge)
    Text("Phase: ${ui.phase}")
    Text("Time: ${formatClock(ui.remainingSeconds)}", style = MaterialTheme.typography.displaySmall)

    Text("Presets")
    PresetRow(listOf(1, 2, 5, 10), onSelect = vm::startPreset)
    PresetRow(listOf(15, 20, 30, 45), onSelect = vm::startPreset)

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
      FocusRingButton(onClick = vm::pause, enabled = ui.phase == TimerPhase.Running) { Text("Pause") }
      FocusRingButton(onClick = vm::resume, enabled = ui.phase == TimerPhase.Paused) { Text("Resume") }
      FocusRingButton(
        onClick = vm::reset,
        enabled = true,
        requireLongPress = ui.focusLockEnabled,
        longPressLabel = "Hold OK to reset",
      ) { Text("Reset") }

      FocusRingButton(onClick = vm::toggleFocusLock) {
        Text(if (ui.focusLockEnabled) "Lock: ON" else "Lock: OFF")
      }
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
      FocusRingButton(onClick = { onSelect(min) }) {
        Text("${min}m")
      }
    }
  }
}

@Composable
private fun FocusRingButton(
  onClick: () -> Unit,
  enabled: Boolean = true,
  ringWidth: Dp = 3.dp,
  requireLongPress: Boolean = false,
  longPressMs: Long = 900,
  longPressLabel: String = "Hold OK",
  content: @Composable () -> Unit,
) {
  val interaction = remember { MutableInteractionSource() }
  var focused by remember { mutableStateOf(false) }
  var okDownAtMs by remember { mutableStateOf<Long?>(null) }

  Box(
    modifier = Modifier
      .clip(RectangleShape)
      .border(
        width = ringWidth,
        color = if (focused) Color(0xFF7AA2FF) else Color.Transparent,
        shape = RectangleShape,
      )
      .onFocusChanged {
        focused = it.isFocused
        if (!it.isFocused) okDownAtMs = null
      }
      .onKeyEvent { ev ->
        if (!requireLongPress) return@onKeyEvent false
        if (!focused) return@onKeyEvent false

        val isOk = ev.key == Key.Enter || ev.key == Key.DirectionCenter
        if (!isOk) return@onKeyEvent false

        when (ev.type) {
          KeyEventType.KeyDown -> {
            if (okDownAtMs == null) okDownAtMs = System.currentTimeMillis()
            true
          }
          KeyEventType.KeyUp -> {
            val downAt = okDownAtMs
            okDownAtMs = null
            if (downAt != null) {
              val held = System.currentTimeMillis() - downAt
              if (held >= longPressMs) {
                onClick()
              }
            }
            true
          }
          else -> false
        }
      },
  ) {
    Button(
      onClick = {
        if (!requireLongPress) onClick()
      },
      enabled = enabled,
      interactionSource = interaction,
      colors = ButtonDefaults.buttonColors(
        containerColor = if (focused) Color(0xFF2A3D75) else ButtonDefaults.buttonColors().containerColor,
      ),
    ) {
      content()
      if (requireLongPress && focused) {
        Text("  ($longPressLabel)")
      }
    }
  }
}
