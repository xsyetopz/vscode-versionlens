import {
  type YamlParserOptions,
  type YamlTypeDescriptorHandler,
  createNameDescFromYamlNode,
  createPackageGroupDesc,
  createTextRange,
  findByPath,
  getPackageProjectVersionDesc,
  isNodeQuoted,
  PackageDescriptor
} from '#domain/parsers';
import type { KeyDictionary } from '#domain/utils';
import {
  type Document,
  type Pair,
  type ParsedNode,
  type YAMLMap,
  isMap,
  isScalar,
  parseDocument,
  Node
} from 'yaml';
import { findPair } from 'yaml/util';

/**
 * Parses package descriptors from a YAML string.
 * @param yaml The YAML content to parse.
 * @param options Parser options.
 * @returns An array of Identified package descriptors.
 */
export function parsePackagesYaml(
  yaml: string,
  options: YamlParserOptions
): Array<PackageDescriptor> {
  const yamlDoc = parseDocument(yaml);
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  return parsePackageNodes(yaml, yamlDoc, options);
}

/**
 * Parses package nodes from a root YAML document.
 * @param yaml The full YAML string.
 * @param rootNode The root YAML document.
 * @param options Parser options.
 * @returns An array of Identified package descriptors.
 */
function parsePackageNodes(
  yaml: string,
  rootNode: Document.Parsed<ParsedNode>,
  options: YamlParserOptions
): PackageDescriptor[] {
  const matchedDependencies: Array<PackageDescriptor> = [];
  const { includePropNames, complexTypeHandlers } = options;

  for (const incPropName of includePropNames) {
    const segments = incPropName.split(".");
    const foundNodes = findByPath(rootNode, segments);
    if (foundNodes.length === 0) continue;

    if (incPropName === 'version') {
      const versionDesc = getPackageProjectVersionDesc(rootNode.contents as YAMLMap)
      versionDesc && matchedDependencies.push(versionDesc);
      continue;
    }

    for (const foundNode of foundNodes) {
      const children = descendChildNodes(yaml, foundNode.path, foundNode.pairs, complexTypeHandlers);
      matchedDependencies.push.apply(matchedDependencies, children);
    }
  }

  return matchedDependencies;
}

/**
 * Descends into child nodes to extract package descriptors.
 * @param yaml The full YAML string.
 * @param path The current path in the YAML tree.
 * @param pairs The pairs to process.
 * @param complexTypeHandlers Map of complex type handlers.
 * @returns An array of Identified package descriptors.
 */
function descendChildNodes(
  yaml: string,
  path: string,
  pairs: Array<Pair<any, any>>,
  complexTypeHandlers: KeyDictionary<YamlTypeDescriptorHandler>
): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];
  const createVersionDescFromYamlNode = complexTypeHandlers['version'];

  for (const pair of pairs) {
    const { key: keyNode, value: valueNode } = pair;
    const isScalarValue = isScalar(valueNode);
    const isQuotedType = isScalarValue && isNodeQuoted(valueNode);

    const key = keyNode as Node;
    const value = valueNode as Node;

    // parse string properties
    if (isScalarValue) {
      // create the name descriptor
      const nameDesc = createNameDescFromYamlNode(keyNode);
      // create the version descriptor
      const versionDesc = createVersionDescFromYamlNode(valueNode, isQuotedType);
      if (!versionDesc) continue;

      // create the group descriptor
      const groupDesc = createYamlGroupDesc(
        yaml,
        path,
        key.range![0],
        value.range![1]
      );

      // create the package descriptor
      const packageDesc = new PackageDescriptor([nameDesc, versionDesc, groupDesc]);
      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);
      continue;
    }

    // parse complex properties
    if (isMap(valueNode)) {
      const map = valueNode as YAMLMap;

      // create the package descriptor
      const packageDesc = new PackageDescriptor([]);

      for (const typeName in complexTypeHandlers) {
        if (map.has(typeName) === false) continue;

        const pair = findPair(map.items, typeName);
        if (!pair) continue;

        // get the type desc
        const handler = complexTypeHandlers[typeName];

        // add the handled type to the package desc
        const isScalarValue = isScalar(pair.value)
        const isQuotedType = isScalarValue && isNodeQuoted(pair.value);
        const typeDesc = handler(pair.value, isQuotedType);
        if (!typeDesc) continue;

        packageDesc.addType(typeDesc);
      }

      // skip when no types were added
      if (packageDesc.typeCount === 0) continue;

      // add the name descriptor
      const nameDesc = createNameDescFromYamlNode(keyNode);
      packageDesc.addType(nameDesc);

      // add the group descriptor
      packageDesc.addType(
        createYamlGroupDesc(
          yaml,
          path,
          key.range![0],
          value.range![1]
        )
      );

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);
    }
  }

  return matchedDependencies;
}

/**
 * Creates a YAML group descriptor and adjusts the range.
 * @param yaml The full YAML string.
 * @param path The group path.
 * @param start The start offset.
 * @param end The end offset.
 * @returns A group descriptor.
 */
function createYamlGroupDesc(
  yaml: string,
  path: string,
  start: number,
  end: number
) {
  // trim trailing whitespace and newlines
  while (end > start && (yaml[end - 1] === ' ' || yaml[end - 1] === '\t' || yaml[end - 1] === '\n' || yaml[end - 1] === '\r')) {
    end--;
  }

  // expand end to include trailing inline comments
  end = expandEndToIncludeInlineComments(yaml, end);

  // expand start to include leading indentation and comments
  start = expandStartToIncludeComments(yaml, start);

  return createPackageGroupDesc(
    path,
    createTextRange(start, end)
  );
}

/**
 * Expands the end offset to include trailing inline comments on the same line.
 * @param yaml The full YAML string.
 * @param end The initial end offset.
 * @returns The expanded end offset.
 */
function expandEndToIncludeInlineComments(yaml: string, end: number): number {
  let current = end;
  const length = yaml.length;

  // Move forward to find a '#' or end of line
  while (current < length && yaml[current] !== '\n' && yaml[current] !== '\r') {
    if (yaml[current] === '#') {
      // found a comment, include until end of line
      while (current < length && yaml[current] !== '\n' && yaml[current] !== '\r') {
        current++;
      }
      return current;
    }
    current++;
  }

  return end;
}

/**
 * Expands the start offset to include leading indentation and preceding comments.
 * @param yaml The full YAML string.
 * @param start The initial start offset.
 * @returns The expanded start offset.
 */
function expandStartToIncludeComments(yaml: string, start: number): number {
  let current = start;

  // Move back to start of line (skip spaces/tabs)
  while (current > 0 && (yaml[current - 1] === ' ' || yaml[current - 1] === '\t')) {
    current--;
  }

  // Check preceding lines for comments
  let lastGoodStart = current;
  while (current > 0) {
    let cursor = current;

    // skip newline(s)
    if (yaml[cursor - 1] === '\n') cursor--;
    if (cursor > 0 && yaml[cursor - 1] === '\r') cursor--;

    // find start of previous line
    let lineEnd = cursor;
    let lineStart = cursor;
    while (lineStart > 0 && yaml[lineStart - 1] !== '\n' && yaml[lineStart - 1] !== '\r') {
      lineStart--;
    }

    const lineText = yaml.substring(lineStart, lineEnd);
    const trimmedLine = lineText.trim();

    if (trimmedLine.startsWith('#')) {
      // it's a comment line, so include it and keep looking back
      current = lineStart;
      lastGoodStart = current;
    } else {
      // not a comment line, stop here
      break;
    }
  }

  return lastGoodStart;
}
