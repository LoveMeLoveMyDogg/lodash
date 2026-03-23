// 对 uni-app 本地缓存做统一封装，避免页面里散落重复代码。
export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key);
    return value === '' || value === undefined ? defaultValue : value;
  } catch (error) {
    console.warn(`读取缓存失败: ${key}`, error);
    return defaultValue;
  }
}

export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value);
    return true;
  } catch (error) {
    console.warn(`写入缓存失败: ${key}`, error);
    return false;
  }
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(key);
    return true;
  } catch (error) {
    console.warn(`删除缓存失败: ${key}`, error);
    return false;
  }
}
