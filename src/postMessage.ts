import * as core from '@actions/core'

import { ProjectSummary } from './coverage'
import { formatChangedCoverage, formatCoverageDetails } from './utils/format'
import { sendMessage } from './utils/github'

const messageStart = ':ramen: Noodly Coverage! :ramen:\n'

export async function postMessage(token: string, summaries: ProjectSummary[]) {
  core.info('Formatting message')
  try {
    const body = `${messageStart}

  ${formatChangedCoverage(summaries)}
  
  ${formatCoverageDetails(summaries)}`

    core.info('Posting message to branch')
    await sendMessage(token, messageStart, body)
  } catch (error: any) {
    core.error(error.messge + '\n' + JSON.stringify(error.stack))
  }
}
