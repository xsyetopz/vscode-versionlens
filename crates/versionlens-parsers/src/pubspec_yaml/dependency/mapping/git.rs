use marked_yaml::types::Node::{
    Mapping as YamlMapping, Scalar as YamlScalar, Sequence as YamlSequence,
};
use marked_yaml::types::{MarkedMappingNode, MarkedScalarNode};

pub(super) fn git_value(map: &MarkedMappingNode) -> Option<&MarkedScalarNode> {
    match map.get_node("git")? {
        YamlScalar(value) => Some(value),
        YamlMapping(git) => git.get_scalar("url"),
        YamlSequence(_) => None,
    }
}
