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
    const baseBranchDir = core.getInput('basePath') ?? '/tmp/base'
    const targetBranchDir = core.getInput('branchPath') ?? process.cwd()
    const group = core.getInput('group')
    const commands = core.getInput('commands').split('\n')
    const github_token = core.getInput('token')
    const diffOnly = core.getInput('diffOnly') as 'true' | 'false'
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
      branch: targetBranchDir,
      base: baseBranchDir
    }

    if (diffOnly === 'false') {
      await pullBranch(github_token, baseBranch, folders.base)

      await prepare(commands, folders)
    } else {
      core.info(
        'Skipping base branch pull and prepare since diffOnly is true. You are expected to produce the coverage-summary.json files yourself before this action.'
      )
    }

    const summaries = await computeCoverage(projects, folders)

    core.debug(`Computed coverage:\n${JSON.stringify(summaries)}`)

    await postMessage(github_token, summaries, group)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
