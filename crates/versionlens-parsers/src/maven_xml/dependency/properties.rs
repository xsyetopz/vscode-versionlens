use std::collections::HashMap;

use super::XmlNode;

type MavenPropertyIndexes = HashMap<String, usize>;

pub(super) fn collect_properties(nodes: &[XmlNode]) -> MavenPropertyIndexes {
    let mut properties: MavenPropertyIndexes = crate::default();
    for (index, node) in nodes.iter().enumerate() {
        if node.path.starts_with("project.properties.")
            && !properties.contains_key(node.name.as_str())
        {
            properties.insert(node.name.as_str().to_owned(), index);
        }
    }
    collect_project_model_properties(nodes, &mut properties);
    properties
}

fn collect_project_model_properties(nodes: &[XmlNode], properties: &mut MavenPropertyIndexes) {
    insert_node_property(
        properties,
        "project.parent.groupId",
        node_at_path(nodes, "project.parent.groupId"),
    );
    insert_node_property(
        properties,
        "project.parent.artifactId",
        node_at_path(nodes, "project.parent.artifactId"),
    );
    insert_node_property(
        properties,
        "project.parent.version",
        node_at_path(nodes, "project.parent.version"),
    );
    insert_node_property(
        properties,
        "project.artifactId",
        node_at_path(nodes, "project.artifactId"),
    );
    insert_node_property(
        properties,
        "project.groupId",
        node_at_path(nodes, "project.groupId")
            .or_else(|| node_at_path(nodes, "project.parent.groupId")),
    );
    insert_node_property(
        properties,
        "project.version",
        node_at_path(nodes, "project.version")
            .or_else(|| node_at_path(nodes, "project.parent.version")),
    );
}

fn insert_node_property(
    properties: &mut MavenPropertyIndexes,
    name: &str,
    node_index: Option<usize>,
) {
    if let Some(index) = node_index {
        properties.entry(name.to_owned()).or_insert(index);
    }
}

fn node_at_path(nodes: &[XmlNode], path: &str) -> Option<usize> {
    nodes.iter().position(|node| node.path == path)
}

pub(super) fn resolve_property<'a>(
    node: &'a XmlNode,
    nodes: &'a [XmlNode],
    properties: &MavenPropertyIndexes,
) -> &'a XmlNode {
    node.text
        .strip_prefix("${")
        .and_then(|value| value.strip_suffix('}'))
        .and_then(|name| properties.get(name))
        .and_then(|index| nodes.get(*index))
        .unwrap_or(node)
}
