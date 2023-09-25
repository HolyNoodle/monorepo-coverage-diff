import * as core from '@actions/core'
import { pullBranch } from './pull_branch'
import { prepare } from './prepare'
import { Project, computeCoverage } from './coverage'
import { postMessage } from './postMessage'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const baseBranch = core.getInput('base') || 'main'
    const group = core.getInput('group')
    const commands = core.getInput('commands').split('\n')
    const github_token = core.getInput('token')
    const projects = core
      .getInput('projects')
      .split('\n')
      .map(
        projectStr =>
          ({
            name: projectStr.split(':')[0],
            path: projectStr.split(':')[1]
          }) as Project
      )

    const folders = {
      branch: process.cwd(),
      base: '/tmp/base'
    }

    await pullBranch(github_token, baseBranch, folders.base)

    await prepare(commands, folders)

    const summaries = await computeCoverage(projects, folders)

    core.debug(`Computed coverage:\n${JSON.stringify(summaries)}`)

    await postMessage(github_token, summaries, group)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
