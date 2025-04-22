import type { PackageTextRange } from '#domain/parsers';

export function createTextRange(start: number, end: number): PackageTextRange {
  return { start, end };
}