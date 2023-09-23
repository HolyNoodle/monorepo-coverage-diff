import * as core from '@actions/core'

import { ProjectSummary } from './coverage'
import { formatChangedCoverage, formatCoverageDetails } from './utils/format'
import { sendMessage } from './utils/github'

const messageStart = 'Noodly Coverage!\n'

export async function postMessage(token: string, summaries: ProjectSummary[]) {
  core.info('Formatting message')
  const body = `${messageStart}

  ${formatChangedCoverage(summaries)}
  
  ${formatCoverageDetails(summaries)}`

  core.info('Posting message to branch')
  await sendMessage(token, messageStart, body)
}
