export type TParsedVersion = {
  isFixedVersion: boolean
  isRangeVersion: boolean
  isPreRelease: boolean
  isLatest: boolean
  isLatestPreRelease: boolean
  hasInvalidRange: boolean
  hasRangeUpdate: boolean
  minVersion: string
  satisfiesVersion: string
  latestRelease: string
  latestPreRelease: string
}