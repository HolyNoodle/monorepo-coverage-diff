import { ExtendedCoverageInfo } from 'src/coverage'

export const formatCoverageNumber = (info: ExtendedCoverageInfo) => {
  const style =
    info.pct === 0
      ? ''
      : info.pct < 0
      ? 'color:red;font-weight:bold'
      : 'color:green;font-weight:bold'

  const symbol =
    info.pct === 0 ? '' : info.pct < 0 ? '-' : '+'

  const num = Math.abs(info.pct).toFixed(2)
  return `<span style="${style}">${symbol} ${num}<span> (${info.branch.pct.toFixed(
    2
  )}%)`
}
