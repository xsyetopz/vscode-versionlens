import { PackageTextRange } from '#domain/parsers';

/**
 * Represents a text edit within a file.
 */
export type TextEdit = {
  /** The range of text to replace. */
  range: PackageTextRange;
  /** The new text to insert. */
  newText: string;
};

/**
 * Represents a single vulnerability for a package.
 */
export type PackageVulnerability = {
  /** The unique identifier for the vulnerability. */
  id: string;
  /** The range of the version within the file. */
  range: PackageTextRange;
  /** The formatted vulnerability message. */
  msg: string;
  /** The URL to the vulnerability advisory. */
  url: string;
};

/**
 * Represents the vulnerabilities found for a package dependency.
 */
export type PackageVulnerabilityResponse = {
  /** The list of vulnerabilities found. */
  vulnerabilities: Array<PackageVulnerability>;
};
