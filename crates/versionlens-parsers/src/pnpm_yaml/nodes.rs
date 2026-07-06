use marked_yaml::types::MarkedMappingNode;
use marked_yaml::types::Node;
use marked_yaml::types::Node::Mapping as YamlMapping;

pub(super) fn mapping_node(node: &Node) -> Option<&MarkedMappingNode> {
    let YamlMapping(mapping) = node else {
        return None;
    };
    Some(mapping)
}
