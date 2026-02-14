package com.strognoff.bigtimer

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import android.util.Log

class SoundCues(private val context: Context) {
  private val soundPool: SoundPool = SoundPool.Builder()
    .setMaxStreams(2)
    .setAudioAttributes(
      AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
    )
    .build()

  private val soundMap = mutableMapOf<SoundType, Int>()
  
  enum class SoundType {
    START,
    FINISH,
    HALFWAY,
    LAST_TEN
  }

  init {
    loadSounds()
  }

  private fun loadSounds() {
    // Placeholder - would load actual audio files here
    // For now, use system default sounds
    try {
      // Try to load system notification sounds as placeholders
      soundMap[SoundType.START] = soundPool.load(context, android.media.AudioManager.FX_KEY_CLICK, 1)
      soundMap[SoundType.FINISH] = soundPool.load(context, android.media.AudioManager.FX_KEY_CLICK, 1)
      soundMap[SoundType.HALFWAY] = soundPool.load(context, android.media.AudioManager.FX_KEY_CLICK, 1)
      soundMap[SoundType.LAST_TEN] = soundPool.load(context, android.media.AudioManager.FX_KEY_CLICK, 1)
    } catch (e: Exception) {
      Log.w("SoundCues", "Failed to load sounds", e)
    }
  }

  fun play(soundType: SoundType) {
    val soundId = soundMap[soundType] ?: return
    soundPool.play(soundId, 1.0f, 1.0f, 1, 0, 1.0f)
  }

  fun release() {
    soundPool.release()
  }
}
