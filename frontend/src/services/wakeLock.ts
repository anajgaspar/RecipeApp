import * as KeepAwake from 'expo-keep-awake';

const PREP_MODE_TAG = 'prep-mode-wakelock';

export async function enableWakeLock(): Promise<void> {
  try {
    await KeepAwake.activateKeepAwakeAsync(PREP_MODE_TAG);
  } catch (error) {
    console.warn('Failed to enable wake lock:', error);
  }
}

export async function disableWakeLock(): Promise<void> {
  try {
    await KeepAwake.deactivateKeepAwake(PREP_MODE_TAG);
  } catch (error) {
    console.warn('Failed to disable wake lock:', error);
  }
}
