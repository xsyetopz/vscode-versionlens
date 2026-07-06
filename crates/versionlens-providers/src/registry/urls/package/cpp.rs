use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn cpp_registry_url(name: &str) -> String {
    cpp_registry_url_with_base(
        "https://raw.githubusercontent.com/xmake-io/xmake-repo/master",
        name,
    )
}

pub(in crate::registry::urls) fn cpp_registry_url_with_base(base_url: &str, name: &str) -> String {
    let base_url = trim_end_slash(base_url);
    let mut chars = name.chars();
    let prefix = chars.next().unwrap_or('_').to_ascii_lowercase();
    format!(
        "{base_url}/packages/{prefix}/{}/xmake.lua",
        encode_component(name)
    )
}
