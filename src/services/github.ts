import { Deployment } from '../types'

async function bgFetch(url: string, token: string, authType: string = 'Bearer') {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'FETCH_DEPLOYMENTS', url, token, authType }, (res) => {
      if (res.success) resolve(res.data)
      else reject(new Error(res.error))
    })
  })
}

export async function fetchGitHubRuns(token: string): Promise<Deployment[]> {
  try {
    // 1. Get recently active repos
    const repos: any = await bgFetch('https://api.github.com/user/repos?sort=pushed&direction=desc&per_page=3', token)
    
    const allRuns: Deployment[] = []

    // 2. Fetch latest runs for each repo
    for (const repo of repos) {
      try {
        const runData: any = await bgFetch(`https://api.github.com/repos/${repo.full_name}/actions/runs?per_page=1`, token)
        if (runData.workflow_runs && runData.workflow_runs.length > 0) {
          const run = runData.workflow_runs[0]
          allRuns.push({
            id: run.id.toString(),
            name: `${repo.name}: ${run.name}`,
            state: run.status === 'completed' 
              ? (run.conclusion === 'success' ? 'SUCCESS' : 'FAILURE') 
              : 'IN_PROGRESS',
            url: run.html_url,
            createdAt: new Date(run.created_at).getTime(),
            source: 'github'
          })
        }
      } catch (e) {
        console.error(`Error fetching runs for ${repo.full_name}:`, e)
      }
    }

    return allRuns.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('GitHub API error:', error)
    throw error
  }
}
