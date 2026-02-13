package com.strognoff.bigtimer

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.timerDataStore by preferencesDataStore(name = "timer_settings")

data class TimerPersistedSettings(
  val focusLockEnabled: Boolean = false,
  val style: TimerStyle = TimerStyle.Numbers,
  val lastCustomMinutes: Int = 10,
)

class TimerSettingsStore(private val context: Context) {
  private val KEY_LOCK = booleanPreferencesKey("focus_lock_enabled")
  private val KEY_STYLE = intPreferencesKey("timer_style")
  private val KEY_LAST_CUSTOM_MIN = intPreferencesKey("last_custom_minutes")

  val settingsFlow: Flow<TimerPersistedSettings> = context.timerDataStore.data.map { prefs ->
    val styleOrdinal = prefs[KEY_STYLE] ?: TimerStyle.Numbers.ordinal
    val style = TimerStyle.entries.getOrElse(styleOrdinal) { TimerStyle.Numbers }

    TimerPersistedSettings(
      focusLockEnabled = prefs[KEY_LOCK] ?: false,
      style = style,
      lastCustomMinutes = (prefs[KEY_LAST_CUSTOM_MIN] ?: 10).coerceIn(1, 180),
    )
  }

  suspend fun save(settings: TimerPersistedSettings) {
    context.timerDataStore.edit { prefs ->
      prefs[KEY_LOCK] = settings.focusLockEnabled
      prefs[KEY_STYLE] = settings.style.ordinal
      prefs[KEY_LAST_CUSTOM_MIN] = settings.lastCustomMinutes.coerceIn(1, 180)
    }
  }
}
