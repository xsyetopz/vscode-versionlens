use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn cpan_registry_url(name: &str) -> String {
    cpan_registry_url_with_base("https://fastapi.metacpan.org/v1", name)
}

pub(in crate::registry::urls) fn cpan_registry_url_with_base(base_url: &str, name: &str) -> String {
    let base_url = trim_end_slash(base_url);
    format!("{base_url}/download_url/{}", encode_component(name))
}
