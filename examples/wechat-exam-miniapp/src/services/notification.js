import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants/exam';
import { getStorage, setStorage } from '../utils/storage';

// 这里只封装消息授权逻辑，实际模板 ID 需要接入微信订阅消息后台配置。
export async function requestDailyNotification() {
  return new Promise((resolve) => {
    if (!uni.requestSubscribeMessage) {
      resolve(false);
      return;
    }

    uni.requestSubscribeMessage({
      tmplIds: ['请替换为你的订阅消息模板 ID'],
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

export function getSettings() {
  return getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(nextSettings) {
  setStorage(STORAGE_KEYS.SETTINGS, nextSettings);
}
