use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn conan_registry_url(name: &str) -> String {
    conan_registry_url_with_base("https://center2.conan.io", name)
}

pub(in crate::registry::urls) fn conan_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    format!("{base_url}/v2/conans/search?q={}/*", encode_component(name))
}
