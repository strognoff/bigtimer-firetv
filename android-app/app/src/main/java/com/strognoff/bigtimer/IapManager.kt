package com.strognoff.bigtimer

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * IAP manager for BigTimer Pro unlock.
 * 
 * Free tier:
 * - 3 favourite presets
 * - 1 theme
 * 
 * Pro unlock (one-time purchase):
 * - Unlimited presets
 * - All themes
 * - Routine mode (when shipped)
 * 
 * TODO: Implement actual Amazon IAP when ready for production
 * Currently using stub for development
 */
class IapManager(context: Context) {

  private val appContext = context.applicationContext
  
  companion object {
    const val SKU_PRO_UNLOCK = "com.strognoff.bigtimer.pro_unlock"
    const val MAX_FREE_PRESETS = 3
  }

  private val _isProUnlocked = MutableStateFlow(false)
  val isProUnlocked: StateFlow<Boolean> = _isProUnlocked.asStateFlow()

  private val _purchaseState = MutableStateFlow<PurchaseState>(PurchaseState.Idle)
  val purchaseState: StateFlow<PurchaseState> = _purchaseState.asStateFlow()

  sealed class PurchaseState {
    data object Idle : PurchaseState()
    data object Loading : PurchaseState()
    data object Purchasing : PurchaseState()
    data class Success(val sku: String) : PurchaseState()
    data class Error(val message: String) : PurchaseState()
  }

  /**
   * Check if user has Pro unlocked
   */
  fun isPro(): Boolean = _isProUnlocked.value

  /**
   * Check if user can add more presets (free tier limit)
   */
  fun canAddPreset(currentPresetCount: Int): Boolean {
    return _isProUnlocked.value || currentPresetCount < MAX_FREE_PRESETS
  }

  /**
   * Initiate Pro unlock purchase
   * TODO: Replace with actual Amazon IAP call
   */
  fun purchaseProUnlock() {
    _purchaseState.value = PurchaseState.Loading
    
    // Stub: Simulate purchase flow
    // In production, this would call PurchasingService.purchase(SKU_PRO_UNLOCK)
    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
      // For testing, auto-succeed
      _isProUnlocked.value = true
      _purchaseState.value = PurchaseState.Success(SKU_PRO_UNLOCK)
    }, 1500)
  }

  /**
   * Refresh purchase status
   * TODO: Replace with actual Amazon IAP call
   */
  fun refreshPurchases() {
    _purchaseState.value = PurchaseState.Loading
    
    // Stub: Simulate check
    // In production, this would call PurchasingService.getPurchaseUpdates(false)
    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
      _purchaseState.value = PurchaseState.Idle
    }, 500)
  }

  /**
   * Set Pro status manually (for testing)
   */
  fun setProUnlocked(unlocked: Boolean) {
    _isProUnlocked.value = unlocked
  }
}
