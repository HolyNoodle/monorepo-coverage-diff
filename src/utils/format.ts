import { Align, getMarkdownTable } from 'markdown-table-ts'

import {
  ExtendedCoverageInfo,
  ProjectSummary
} from 'src/coverage'

export const formatCoverageNumber = (info: ExtendedCoverageInfo) => {
  const style =
    info.pct === 0
      ? ''
      : info.pct < 0
      ? 'color:red;font-weight:bold'
      : 'color:green;font-weight:bold'

  const symbol = info.pct === 0 ? '' : info.pct < 0 ? '-' : '+'

  const num = Math.abs(info.pct).toFixed(2)
  return `<span style="${style}">${symbol} ${num}<span> (${info.branch.pct.toFixed(
    2
  )}%)`
}

export const formatCoverageDetails = (summaries: ProjectSummary[]) => {
  return `
<details>
  <summary>Coverage diff details</summary>
  ${summaries.map(summary => {
    return `## ${summary.name}
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
`})}
</details>`
}

export const formatChangedCoverage = (summaries: ProjectSummary[]) => {
  const changedSummaries = summaries
    .filter(
      summary =>
        summary.coverage.total.lines.pct !== 0 ||
        summary.coverage.total.branches.pct !== 0 ||
        summary.coverage.total.statements.pct !== 0 ||
        summary.coverage.total.functions.pct !== 0
    )
    .sort((a, b) => {
      const aTotal = a.coverage.total
      const bTotal = b.coverage.total

      const aPct =
        aTotal.lines.pct +
        aTotal.branches.pct +
        aTotal.statements.pct +
        aTotal.functions.pct
      const bPct =
        bTotal.lines.pct +
        bTotal.branches.pct +
        bTotal.statements.pct +
        bTotal.functions.pct

      return bPct - aPct
    })

  if (changedSummaries.length === 0) {
    return ":+1: All projects have a non changing coverage!"
  }

  return `These projects have a changing coverage:
${getMarkdownTable({
  alignColumns: true,
  alignment: [Align.Left, Align.Right, Align.Right, Align.Right, Align.Right],
  table: {
    head: ['Project', 'Lines', 'Statements', 'Functions', 'Branches'],
    body: changedSummaries.map(summary => {
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
})}`
}
