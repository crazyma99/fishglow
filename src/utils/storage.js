export function setTemp(key, data) {
  uni.setStorageSync(key, JSON.stringify(data));
}

export function getTemp(key) {
  const raw = uni.getStorageSync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function removeTemp(key) {
  uni.removeStorageSync(key);
}
