use super::super::trim_end_slash;

pub(in crate::registry::urls) fn luarocks_registry_url(name: &str) -> String {
    luarocks_registry_url_with_base("https://luarocks.org", name)
}

pub(in crate::registry::urls) fn luarocks_registry_url_with_base(
    base_url: &str,
    _: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    if base_url.ends_with("/manifest") {
        return base_url.to_owned();
    }
    format!("{base_url}/manifest")
}
