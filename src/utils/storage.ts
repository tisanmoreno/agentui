const STORAGE_NAMESPACE = "agentui"

const toStorageKey = (key: string) => `${STORAGE_NAMESPACE}:${key}`

export const storage = {
  async get<T>(key: string, fallbackValue: T): Promise<T> {
    const namespacedKey = toStorageKey(key)
    const result = await chrome.storage.local.get(namespacedKey)

    return (result[namespacedKey] as T | undefined) ?? fallbackValue
  },

  async set<T>(key: string, value: T) {
    const namespacedKey = toStorageKey(key)

    await chrome.storage.local.set({ [namespacedKey]: value })
  },

  async remove(key: string) {
    await chrome.storage.local.remove(toStorageKey(key))
  }
}
