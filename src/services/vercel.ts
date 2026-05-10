import { Deployment } from '../types'

export async function fetchVercelDeployments(token: string): Promise<Deployment[]> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: 'FETCH_DEPLOYMENTS',
      url: 'https://api.vercel.com/v6/deployments?limit=5',
      token,
      authType: 'Bearer'
    }, (response) => {
      if (response.success) {
        resolve(response.data.deployments.map((d: any) => ({
          id: d.uid,
          name: d.name,
          state: d.state,
          url: d.url,
          createdAt: d.createdAt,
          source: 'vercel'
        })))
      } else {
        reject(new Error(response.error))
      }
    })
  })
}
