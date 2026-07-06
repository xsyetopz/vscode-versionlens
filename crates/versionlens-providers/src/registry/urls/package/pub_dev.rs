use super::super::trim_end_slash;

pub(in crate::registry::urls) fn pub_registry_url(name: &str) -> String {
    format!("https://pub.dev/api/packages/{name}")
}

pub(in crate::registry::urls) fn pub_registry_url_with_base(base_url: &str, name: &str) -> String {
    let base_url = trim_end_slash(base_url);
    if base_url.ends_with("/api/packages") {
        return format!("{base_url}/{name}");
    }

    format!("{base_url}/api/packages/{name}")
}
