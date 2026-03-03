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
