use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn haxelib_registry_url(name: &str) -> String {
    haxelib_registry_url_with_base("https://lib.haxe.org", name)
}

pub(in crate::registry::urls) fn haxelib_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    format!("{base_url}/p/{}/versions/", encode_component(name))
}
