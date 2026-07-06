use marked_yaml::types::MarkedMappingNode;
use marked_yaml::types::Node::{
    Mapping as YamlMapping, Scalar as YamlScalar, Sequence as YamlSequence,
};

pub(super) fn hosted_url(map: &MarkedMappingNode) -> Option<String> {
    match map.get_node("hosted")? {
        YamlScalar(value) => Some(value.as_str().to_owned()),
        YamlMapping(hosted) => hosted
            .get_scalar("url")
            .map(|value| value.as_str().to_owned()),
        YamlSequence(_) => None,
    }
    .filter(|url| !url.is_empty())
}

pub(super) fn hosted_name(map: &MarkedMappingNode) -> Option<String> {
    match map.get_node("hosted")? {
        YamlMapping(hosted) => hosted
            .get_scalar("name")
            .map(|value| value.as_str().to_owned()),
        YamlScalar(_) | YamlSequence(_) => None,
    }
    .filter(|name| !name.is_empty())
}
