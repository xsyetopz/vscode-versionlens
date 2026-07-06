use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn swift_registry_url(name: &str) -> String {
    swift_registry_url_with_base("https://packages.swift.org", name)
}

pub(in crate::registry::urls) fn swift_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    let (scope, package) = swift_registry_identifier(name);
    format!(
        "{base_url}/{}/{}",
        encode_component(scope),
        encode_component(package)
    )
}

fn swift_registry_identifier(name: &str) -> (&str, &str) {
    name.split_once('.')
        .or_else(|| name.split_once('/'))
        .unwrap_or(("", name))
}
