// Background Service Worker for DevHub
// Handles alarms and badge notifications

chrome.runtime.onInstalled.addListener(() => {
  console.log('DevHub extension installed!')
  chrome.alarms.create('checkDeployments', { periodInMinutes: 5 })

  // Set up rules to strip Origin header to bypass CORS
  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'origin', operation: 'remove' },
          { header: 'referer', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: '|https://api.render.com/*',
        resourceTypes: ['xmlhttprequest']
      }
    },
    {
      id: 2,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'origin', operation: 'remove' },
          { header: 'referer', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: '|https://api.vercel.com/*',
        resourceTypes: ['xmlhttprequest']
      }
    },
    {
      id: 3,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'origin', operation: 'remove' },
          { header: 'referer', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: '|https://api.netlify.com/*',
        resourceTypes: ['xmlhttprequest']
      }
    }
  ]

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3],
    addRules: rules as any
  })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkDeployments') {
    checkAllDeployments()
  }
})

async function checkAllDeployments() {
  // This would ideally fetch tokens from storage and poll APIs.
  // For security, we only poll if the master password is provided by the user.
  // For now, we'll implement a listener that the UI can trigger to set badges.
  console.log('Checking deployments in background...')
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_BADGE') {
    chrome.action.setBadgeText({ text: message.text })
    chrome.action.setBadgeBackgroundColor({ color: message.color || '#EF4444' })
  }
  
  if (message.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '' })
  }

  if (message.type === 'FETCH_DEPLOYMENTS') {
    const { url, token, authType = 'Bearer' } = message
    
    fetch(url, {
      headers: {
        'Authorization': `${authType} ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DevHub-Extension'
      }
    })
    .then(async res => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`)
      sendResponse({ success: true, data })
    })
    .catch(err => {
      sendResponse({ success: false, error: err.message })
    })
    return true
  }
  
  return true
})
