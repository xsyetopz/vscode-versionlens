use super::super::trim_end_slash;

pub(in crate::registry::urls) fn unity_registry_url(name: &str) -> String {
    unity_registry_url_with_base("https://packages.unity.com", name)
}

pub(in crate::registry::urls) fn unity_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    format!("{}/{}", trim_end_slash(base_url), name)
}
