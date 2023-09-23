import * as core from '@actions/core'
import { execSync } from 'child_process'
import { Folders } from './types'

export async function prepare(commands: string[], folders: Folders) {
  for (const folder of Object.values(folders)) {
    for (const command of commands) {
      core.info(`${folder}: ${command}`)
      try {
        const buffer = execSync(command, { cwd: folder })

        core.info(buffer.toString())
      } catch (error: any) {
        if (error instanceof Error) core.setFailed(error.message)

        core.error(error.toString())
      }
    }
  }
}
