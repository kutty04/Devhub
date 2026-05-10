import { Deployment } from '../types'

export async function fetchNetlifyDeployments(token: string): Promise<Deployment[]> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: 'FETCH_DEPLOYMENTS',
      url: 'https://api.netlify.com/api/v1/deploys?per_page=5',
      token,
      authType: 'Bearer'
    }, (response) => {
      if (response.success) {
        resolve(response.data.map((d: any) => ({
          id: d.id,
          name: d.name || 'Netlify Site',
          state: d.state === 'ready' ? 'READY' : d.state === 'error' ? 'ERROR' : 'BUILDING',
          url: d.ssl_url || d.url,
          createdAt: new Date(d.created_at).getTime(),
          source: 'netlify'
        })))
      } else {
        reject(new Error(response.error))
      }
    })
  })
}
