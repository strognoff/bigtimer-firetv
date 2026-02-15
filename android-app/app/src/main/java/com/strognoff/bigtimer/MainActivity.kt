package com.strognoff.bigtimer

import android.os.Bundle
import android.media.SoundPool
import android.media.AudioAttributes
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
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
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
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent { BigTimerApp() }
  }
}

@Composable
fun BigTimerApp() {
  val context = LocalContext.current
  val settingsStore = remember { TimerSettingsStore(context) }
  val persisted by settingsStore.settingsFlow.collectAsState(initial = TimerPersistedSettings())

  // IAP Manager for Pro unlock
  val iapManager = remember { IapManager(context) }
  val isPro by iapManager.isProUnlocked.collectAsState()
  val purchaseState by iapManager.purchaseState.collectAsState()

  // Keep VM stable across recompositions (TV focus changes can recompose often).
  val vm = remember { TimerViewModel() }
  val ui = vm.state

  // Sound pool for cues
  val soundPool = remember {
    SoundPool.Builder()
      .setMaxStreams(2)
      .setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_MEDIA)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
      )
      .build()
  }

  // Wire sound events
  LaunchedEffect(Unit) {
    vm.onSoundEvent = { event ->
      // Simple beep sounds using system FX
      val fxType = when (event) {
        TimerViewModel.SoundEvent.START -> android.media.AudioManager.FX_FOCUS_NAVIGATION_UP
        TimerViewModel.SoundEvent.FINISH -> android.media.AudioManager.FX_KEY_CLICK
        TimerViewModel.SoundEvent.HALFWAY -> android.media.AudioManager.FX_FOCUS_NAVIGATION_DOWN
        TimerViewModel.SoundEvent.LAST_TEN -> android.media.AudioManager.FX_KEYPRESS_STANDARD
      }
      soundPool.play(soundPool.load(context, fxType, 1), 1.0f, 1.0f, 1, 0, 1.0f)
    }
  }

  // (Spec) Compose TV + navigation: keep it simple (presets → running).
  val nav = rememberNavController()

  LaunchedEffect(persisted) {
    vm.applyPersistedSettings(
      focusLockEnabled = persisted.focusLockEnabled,
      style = persisted.style,
      lastCustomMinutes = persisted.lastCustomMinutes,
      soundEnabled = persisted.soundEnabled,
      soundHalfway = persisted.soundHalfway,
      soundLastTen = persisted.soundLastTen,
    )
  }

  LaunchedEffect(ui.focusLockEnabled, ui.style, ui.lastCustomMinutes, ui.soundEnabled, ui.soundHalfway, ui.soundLastTen) {
    settingsStore.save(
      TimerPersistedSettings(
        focusLockEnabled = ui.focusLockEnabled,
        style = ui.style,
        lastCustomMinutes = ui.lastCustomMinutes,
        soundEnabled = ui.soundEnabled,
        soundHalfway = ui.soundHalfway,
        soundLastTen = ui.soundLastTen,
      )
    )
  }

  LaunchedEffect(ui.phase, ui.totalSeconds) {
    while (ui.phase == TimerPhase.Running) {
      vm.tick()
      delay(250)
    }
  }

  NavHost(
    navController = nav,
    startDestination = "presets",
  ) {
    composable("presets") {
      PresetsScreen(
        ui = ui,
        isPro = isPro,
        purchaseState = purchaseState,
        onStartPreset = {
          vm.startPreset(it)
          nav.navigate("running")
        },
        onOpenCustom = { nav.navigate("custom") },
        onPurchasePro = { iapManager.purchaseProUnlock() },
      )
    }

    composable("custom") {
      CustomDurationScreen(
        initialMinutes = ui.lastCustomMinutes,
        onMinutesChange = vm::setLastCustomMinutes,
        onStart = { minutes ->
          vm.startPreset(minutes)
          nav.navigate("running")
        },
        onBack = { nav.popBackStack() },
      )
    }

    composable("running") {
      RunningScreen(
        ui = ui,
        onPause = vm::pause,
        onResume = vm::resume,
        onReset = {
          vm.reset()
          nav.popBackStack("presets", inclusive = false)
        },
        onToggleLock = vm::toggleFocusLock,
        onCycleStyle = vm::cycleStyle,
        onToggleSound = { vm.toggleSound() },
        onToggleHalfway = { vm.toggleHalfway() },
        onToggleLastTen = { vm.toggleLastTen() },
      )
    }
  }
}

@Composable
private fun PresetsScreen(
  ui: TimerUiState,
  isPro: Boolean,
  purchaseState: IapManager.PurchaseState,
  onStartPreset: (Int) -> Unit,
  onOpenCustom: () -> Unit,
  onPurchasePro: () -> Unit,
) {
  val firstPresetFocus = remember { FocusRequester() }

  LaunchedEffect(Unit) {
    // Explicit initial focus for TV/DPAD.
    firstPresetFocus.requestFocus()
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(20.dp),
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Text("BigTimer", style = MaterialTheme.typography.headlineLarge)
      if (isPro) {
        Text("PRO ✓", style = MaterialTheme.typography.titleMedium, color = Color(0xFF4CAF50))
      } else {
        FocusRingButton(onClick = onPurchasePro) {
          when (purchaseState) {
            is IapManager.PurchaseState.Loading -> Text("Loading...")
            is IapManager.PurchaseState.Purchasing -> Text("Processing...")
            else -> Text("Upgrade to Pro")
          }
        }
      }
    }

    if (purchaseState is IapManager.PurchaseState.Error) {
      Text("Purchase error: ${purchaseState.message}", color = Color(0xFFFF5722))
    }

    Text("Pick a preset", style = MaterialTheme.typography.titleLarge)

    PresetRow(listOf(1, 2, 5, 10), onSelect = onStartPreset, firstButtonFocus = firstPresetFocus)
    PresetRow(listOf(15, 20, 30, 45), onSelect = onStartPreset)

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
      FocusRingButton(onClick = onOpenCustom) { Text("Custom") }
    }

    Text(
      "Current: ${formatClock(ui.remainingSeconds)} · Style: ${ui.style}",
      style = MaterialTheme.typography.bodyLarge,
    )
  }
}

@Composable
private fun CustomDurationScreen(
  initialMinutes: Int,
  onMinutesChange: (Int) -> Unit,
  onStart: (Int) -> Unit,
  onBack: () -> Unit,
) {
  var minutes by remember(initialMinutes) { mutableStateOf(initialMinutes.coerceIn(1, 180)) }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(20.dp),
  ) {
    Text("Custom timer", style = MaterialTheme.typography.headlineLarge)
    Text("Minutes: $minutes", style = MaterialTheme.typography.displaySmall)

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
      FocusRingButton(onClick = {
        minutes = (minutes - 1).coerceAtLeast(1)
        onMinutesChange(minutes)
      }) { Text("-1m") }
      FocusRingButton(onClick = {
        minutes = (minutes + 1).coerceAtMost(180)
        onMinutesChange(minutes)
      }) { Text("+1m") }
      FocusRingButton(onClick = {
        minutes = (minutes + 5).coerceAtMost(180)
        onMinutesChange(minutes)
      }) { Text("+5m") }
    }

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
      FocusRingButton(onClick = { onStart(minutes) }) { Text("Start") }
      FocusRingButton(onClick = onBack) { Text("Back") }
    }
  }
}

@Composable
private fun RunningScreen(
  ui: TimerUiState,
  onPause: () -> Unit,
  onResume: () -> Unit,
  onReset: () -> Unit,
  onToggleLock: () -> Unit,
  onCycleStyle: () -> Unit,
  onToggleSound: () -> Unit,
  onToggleHalfway: () -> Unit,
  onToggleLastTen: () -> Unit,
) {
  var showExitConfirm by remember { mutableStateOf(false) }
  var showSoundSettings by remember { mutableStateOf(false) }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp)
      .onKeyEvent { ev ->
        // Back should confirm exit while running/paused.
        if (ev.type == KeyEventType.KeyUp) {
          when (ev.key) {
            Key.Back -> {
              if (ui.phase == TimerPhase.Running || ui.phase == TimerPhase.Paused) {
                showExitConfirm = true
                return@onKeyEvent true
              }
            }
            Key.DirectionLeft -> {
              if (!showExitConfirm) {
                if (ui.phase == TimerPhase.Running) onPause()
                else if (ui.phase == TimerPhase.Paused) onResume()
                return@onKeyEvent true
              }
            }
            Key.DirectionRight -> {
              if (!showExitConfirm) {
                if (!ui.focusLockEnabled) onReset()
                return@onKeyEvent true
              }
            }
            Key.DirectionDown -> {
              if (!showExitConfirm) {
                onCycleStyle()
                return@onKeyEvent true
              }
            }
            else -> {}
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
          onReset()
          showExitConfirm = false
        }) { Text("Exit") }
        FocusRingButton(onClick = { showExitConfirm = false }) { Text("Cancel") }
      }
    }

    Text("BigTimer", style = MaterialTheme.typography.headlineLarge)
    Text("Phase: ${ui.phase}")
    Text("Style: ${ui.style}")

    when (ui.style) {
      TimerStyle.Numbers -> {
        Text("Time: ${formatClock(ui.remainingSeconds)}", style = MaterialTheme.typography.displaySmall)
      }
      TimerStyle.Pie -> {
        Text("(Pie style placeholder)")
        Text("Time: ${formatClock(ui.remainingSeconds)}", style = MaterialTheme.typography.displaySmall)
      }
      TimerStyle.Bar -> {
        Text("(Bar style placeholder)")
        Text("Time: ${formatClock(ui.remainingSeconds)}", style = MaterialTheme.typography.displaySmall)
      }
    }

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
      FocusRingButton(onClick = onPause, enabled = ui.phase == TimerPhase.Running) { Text("Pause") }
      FocusRingButton(onClick = onResume, enabled = ui.phase == TimerPhase.Paused) { Text("Resume") }
      FocusRingButton(
        onClick = onReset,
        enabled = true,
        requireLongPress = ui.focusLockEnabled,
        longPressLabel = "Hold OK to reset",
      ) { Text("Reset") }

      FocusRingButton(onClick = onToggleLock) {
        Text(if (ui.focusLockEnabled) "Lock: ON" else "Lock: OFF")
      }

      FocusRingButton(onClick = { showSoundSettings = !showSoundSettings }) {
        Text("Sounds")
      }
    }

    if (showSoundSettings) {
      Text("Sound settings:", style = MaterialTheme.typography.titleMedium)
      Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        FocusRingButton(onClick = onToggleSound) {
          Text(if (ui.soundEnabled) "Sounds: ON" else "Sounds: OFF")
        }
        FocusRingButton(onClick = onToggleHalfway) {
          Text(if (ui.soundHalfway) "Halfway: ON" else "Halfway: OFF")
        }
        FocusRingButton(onClick = onToggleLastTen) {
          Text(if (ui.soundLastTen) "Last10: ON" else "Last10: OFF")
        }
      }
    }

    Text(
      "Controls: Left=Pause/Resume · Right=Reset (lock off) · Down=Style · Back=Exit confirm",
      style = MaterialTheme.typography.bodyLarge,
    )
  }
}

@Composable
private fun PresetRow(
  minutes: List<Int>,
  onSelect: (Int) -> Unit,
  firstButtonFocus: FocusRequester? = null,
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(10.dp),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    minutes.forEachIndexed { idx, min ->
      val focusMod = if (idx == 0 && firstButtonFocus != null) {
        Modifier.focusRequester(firstButtonFocus)
      } else {
        Modifier
      }

      Box(modifier = focusMod) {
        FocusRingButton(onClick = { onSelect(min) }) {
          Text("${min}m")
        }
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
