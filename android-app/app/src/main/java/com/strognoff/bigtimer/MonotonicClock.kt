package com.strognoff.bigtimer

import android.os.SystemClock

/** Monotonic clock to avoid wall-clock jumps. */
fun nowElapsedRealtimeMs(): Long = SystemClock.elapsedRealtime()
