use super::super::hosted::github_tags_url;

pub(in crate::registry::urls) fn ruby_registry_url(name: &str) -> String {
    github_tags_url(name)
        .unwrap_or_else(|| format!("https://rubygems.org/api/v1/versions/{name}.json"))
}

pub(in crate::registry::urls) fn ruby_registry_url_with_base(base_url: &str, name: &str) -> String {
    let base_url = base_url.trim_end_matches('/');
    if crate::path(base_url)
        .extension()
        .is_some_and(|extension| extension.eq_ignore_ascii_case("json"))
    {
        return base_url.to_owned();
    }
    if base_url.ends_with("/api/v1/versions") {
        return format!("{base_url}/{name}.json");
    }
    format!("{base_url}/api/v1/versions/{name}.json")
}
