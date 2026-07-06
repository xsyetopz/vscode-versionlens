use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn cocoapods_registry_url(name: &str) -> String {
    cocoapods_registry_url_with_base("https://trunk.cocoapods.org/api/v1/pods", name)
}

pub(in crate::registry::urls) fn cocoapods_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let root_name = name.split('/').next().unwrap_or(name);
    format!(
        "{}/{}",
        trim_end_slash(base_url),
        encode_component(root_name)
    )
}
