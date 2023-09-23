import * as core from '@actions/core'
import * as github from '@actions/github'

import { Align, getMarkdownTable } from 'markdown-table-ts'

import { ProjectSummary } from './coverage'
import { formatCoverageNumber } from './markdown/format'

const messageStart = 'Noodly Coverage!\n'

export async function postMessage(token: string, summaries: ProjectSummary[]) {
  const context = github.context
  if (context.payload.pull_request == null) {
    core.setFailed('No pull request found.')
    return
  }

  const pull_request_number = context.payload.pull_request.number

  const octokit = github.getOctokit(token)

  const existingComments = await octokit.rest.issues.listComments({
    ...context.repo,
    issue_number: pull_request_number
  })

  let body = `${messageStart}
`

  const decreasedSummaries = summaries.filter(
    summary =>
      summary.coverage.total.lines.pct < 0 ||
      summary.coverage.total.branches.pct < 0 ||
      summary.coverage.total.statements.pct < 0 ||
      summary.coverage.total.functions.pct < 0
  )

  if (decreasedSummaries.length > 0) {
    const decreasedTable = getMarkdownTable({
      alignColumns: true,
      alignment: [
        Align.Left,
        Align.Right,
        Align.Right,
        Align.Right,
        Align.Right
      ],
      table: {
        head: ['Project', 'Lines', 'Statements', 'Functions', 'Branches'],
        body: decreasedSummaries.map(summary => {
          const { total } = summary.coverage

          return [
            summary.name,
            formatCoverageNumber(total.lines),
            formatCoverageNumber(total.statements),
            formatCoverageNumber(total.functions),
            formatCoverageNumber(total.branches)
          ]
        })
      }
    })

    body += `
:warning: These projects have a decreasing coverage:

${decreasedTable}
    `
  }

  const increasedSummaries = summaries.filter(
    summary =>
      summary.coverage.total.lines.pct > 0 ||
      summary.coverage.total.branches.pct > 0 ||
      summary.coverage.total.statements.pct > 0 ||
      summary.coverage.total.functions.pct > 0
  )

  if (increasedSummaries.length > 0) {
    const increasedTable = getMarkdownTable({
      alignColumns: true,
      alignment: [
        Align.Left,
        Align.Right,
        Align.Right,
        Align.Right,
        Align.Right
      ],
      table: {
        head: ['Project', 'Lines', 'Statements', 'Functions', 'Branches'],

        body: decreasedSummaries.map(summary => {
          const { total } = summary.coverage
          return [
            summary.name,
            formatCoverageNumber(total.lines),
            formatCoverageNumber(total.statements),
            formatCoverageNumber(total.functions),
            formatCoverageNumber(total.branches)
          ]
        })
      }
    })

    body += `
:fire: These projects have an increasing coverage:

${increasedTable}
    `
  }

  if (decreasedSummaries.length === 0 && increasedSummaries.length === 0) {
    body += `
:+1: All projects have a stable coverage!

<details>
  <summary>Coverage diff details</summary>

  ${summaries.map(summary => {
    return `
## ${summary.name}
${getMarkdownTable({
  alignColumns: true,
  alignment: [Align.Left, Align.Right, Align.Right, Align.Right, Align.Right],
  table: {
    head: ['File', 'Lines', 'Statements', 'Functions', 'Branches'],
    body: Object.keys(summary.coverage)
      .map(key => {
        if (key === 'total') return []

        const info = summary.coverage[key as keyof typeof summary.coverage]

        if (!info) return []

        return [
          key.replace(`/${summary.path}`, ''),
          formatCoverageNumber(info.lines),
          formatCoverageNumber(info.statements),
          formatCoverageNumber(info.functions),
          formatCoverageNumber(info.branches)
        ]
      })
      .filter(s => s.length > 0)
  }
})}
`
  })}
</details>`
  }

  core.info('Posting message to branch')
  const existingComment = existingComments.data.find(
    comment => comment.body?.startsWith(messageStart)
  )

  if (existingComment) {
    await octokit.rest.issues.updateComment({
      ...context.repo,
      comment_id: existingComment.id,
      body
    })

    return
  }

  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_request_number,
    body
  })
}
