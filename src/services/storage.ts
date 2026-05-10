export async function saveToStorage(key: string, data: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: JSON.stringify(data) }, resolve)
  })
}

export async function getFromStorage(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key] ? JSON.parse(result[key]) : null)
    })
  })
}

export async function removeFromStorage(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.remove([key], resolve)
  })
}

export async function getAllStorage(): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (items) => {
      resolve(items)
    })
  })
}
