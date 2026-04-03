export async function getStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key)
    return result[key] !== undefined ? result[key] : defaultValue
  } catch {
    return defaultValue
  }
}

export async function setStorage(key: string, value: any): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: value })
  } catch {
    // ignore storage errors in dev
  }
}
