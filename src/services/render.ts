import { Deployment } from '../types'

export async function fetchRenderServices(token: string): Promise<Deployment[]> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: 'FETCH_DEPLOYMENTS',
      url: 'https://api.render.com/v1/services?limit=5',
      token,
      authType: 'Bearer'
    }, (response) => {
      if (response.success) {
        resolve(response.data.map((s: any) => ({
          id: s.service.id,
          name: s.service.name,
          state: s.service.suspended === 'not_suspended' ? 'READY' : 'CANCELED',
          url: s.service.serviceDetails.url || '',
          createdAt: new Date(s.service.createdAt).getTime(),
          source: 'render'
        })))
      } else {
        reject(new Error(response.error))
      }
    })
  })
}
