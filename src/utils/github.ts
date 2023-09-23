import * as core from '@actions/core'
import * as github from '@actions/github'

export const sendMessage = async (token: string, messageStart: string, body: string) => {
  const context = github.context
  if (context.payload.pull_request == null) {
    core.info('No pull request found.')
    return
  }

  const pull_request_number = context.payload.pull_request.number

  const octokit = github.getOctokit(token)

  const existingComments = await octokit.rest.issues.listComments({
    ...context.repo,
    issue_number: pull_request_number
  })

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