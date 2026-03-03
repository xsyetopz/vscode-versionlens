import { Document, isCollection, Pair, YAMLMap, YAMLSeq } from 'yaml';

type YamlCollection = YAMLMap<string, any> | YAMLSeq

/**
 * Represents a node found at a specific path.
 */
export type YamlFoundNode = {
  /** The actual path to the node. */
  path: string;
  /** The YAML pairs found at the path. */
  pairs: Array<Pair<string, any>>;
};

/**
 * Finds YAML pairs at a specific path within a document or collection.
 * Supports wildcard '*' in path segments.
 * @param root The root document or collection to search.
 * @param path The array of path segments.
 * @param actualPath The actual path segments found so far.
 * @returns An array of matching YAML nodes.
 */
export function findByPath(
  root: YamlCollection | Document,
  path: Array<string>,
  actualPath?: Array<string>
): Array<YamlFoundNode>;
export function findByPath(
  root: any,
  [key, ...rest]: string[],
  actualPath: string[] = []
): Array<YamlFoundNode> {
  const results: Array<YamlFoundNode> = [];
  const hasKey = key.length > 0;
  const lastKey = rest.length === 0;
  if (hasKey === false && lastKey === true) return results;

  const isStar = key === '*';
  if (isStar && !root.items)
    return results
  else if (isStar && lastKey) {
    results.push({
      path: actualPath.join('.'),
      pairs: root.items
    });
    return results;
  } else if (isStar) {
    for (const child of root.items) {
      results.push(...findByPath(child.value, rest, [...actualPath, child.key.value]));
    }
    return results;
  }

  const node = root.get(key, true);
  if (!node) return results;
  if (lastKey) {
    results.push({
      path: [...actualPath, key].join('.'),
      pairs: node.items ? node.items : [node]
    });
    return results;
  }
  if (isCollection(node)) return findByPath(node, rest, [...actualPath, key]);
  return results
}
