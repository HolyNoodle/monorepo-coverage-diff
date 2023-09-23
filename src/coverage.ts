import * as core from '@actions/core'
import { glob } from 'glob'
import path from 'path'
import { Folders } from './types'
import { readFileSync } from 'fs'

export interface Project {
  name: string
  path: string
}

export interface CoverageInfo {
  total: number
  covered: number
  skipped: number
  pct: number
}
export interface ExtendedCoverageInfo extends CoverageInfo {
  branch: CoverageInfo
}
export interface Coverage {
  lines: ExtendedCoverageInfo
  functions: ExtendedCoverageInfo
  statements: ExtendedCoverageInfo
  branches: ExtendedCoverageInfo
}

export interface ProjectSummary {
  name: string
  path: string
  coverage: CoverageSummary
}

export type CoverageSummary = {
  total: Coverage
  [path: string]: Coverage
}

export async function computeCoverage(
  projects: Project[],
  folders: Folders
): Promise<ProjectSummary[]> {
  const promises = projects.map(project => {
    return new Promise<ProjectSummary>((resolve, reject) => {
      const branchPath = path.join(folders.branch, project.path)
      const basePath = path.join(folders.base, project.path)

      const [branchCoverageFile] = glob.globSync(
        `${branchPath}/**/coverage-summary.json`
      )
      const [baseCoverageFile] = glob.globSync(
        `${basePath}/**/coverage-summary.json`
      )

      if (!branchCoverageFile || !baseCoverageFile) {
        core.setFailed(
          `Could not find coverage-summary.json for ${project.name}`
        )

        reject()
        return
      }

      const base = JSON.parse(readFileSync(baseCoverageFile).toString())
      const branch = JSON.parse(readFileSync(branchCoverageFile).toString())

      const computeCoverage = (
        base: CoverageInfo,
        branch: CoverageInfo
      ): ExtendedCoverageInfo => {
        return {
          pct: branch.pct - base.pct,
          covered: branch.covered - base.covered,
          skipped: branch.skipped - base.skipped,
          total: branch.total - base.total,
          branch
        }
      }
      const compareFiles = (
        base: Coverage | undefined,
        branch: Coverage
      ): Coverage => {
        // Added file
        if (!base) {
          return {
            branches: branch.branches,
            functions: branch.functions,
            lines: branch.lines,
            statements: branch.statements
          }
        }

        return {
          branches: computeCoverage(base.branches, branch.branches),
          functions: computeCoverage(base.functions, branch.functions),
          lines: computeCoverage(base.lines, branch.lines),
          statements: computeCoverage(base.statements, branch.statements)
        }
      }

      const rootDir = process.cwd()
      const baseMap = Object.keys(base).reduce((acc, key) => {
        return {
          ...acc,
          [key.replace(folders.base, '.')]: base[key]
        }
      }, {} as CoverageSummary)
      const branchMap = Object.keys(branch).reduce((acc, key) => {
        return {
          ...acc,
          [key.replace(rootDir, '.')]: branch[key]
        }
      }, {} as CoverageSummary)

      resolve({
        name: project.name,
        path: project.path,
        coverage: Object.keys(branchMap).reduce((acc, key) => {
          return {
            ...acc,
            [key]: compareFiles(baseMap[key], branchMap[key])
          }
        }, {} as CoverageSummary)
      })
    })
  })

  return Promise.all(promises)
}
