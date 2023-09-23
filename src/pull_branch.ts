import * as core from '@actions/core'
import Git from 'simple-git'
import * as github from '@actions/github'

const git = Git()

export async function pullBranch(
  token: string,
  branchName: string,
  folder: string
) {
  try {
    const context = github.context

    const url = `https://oauth2:${token}@github.com/${context.repo.owner}/${context.repo.repo}.git`

    core.info(`Cloning ${branchName} in ${folder}`)
    await git.clone(url, folder, {
      '--branch': branchName
    })
    core.info(`${branchName} cloned`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
