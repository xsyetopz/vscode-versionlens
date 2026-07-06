use super::super::trim_end_slash;

pub(in crate::registry::urls) fn vcpkg_registry_url(name: &str) -> String {
    vcpkg_registry_url_with_base(
        "https://raw.githubusercontent.com/microsoft/vcpkg/master",
        name,
    )
}

pub(in crate::registry::urls) fn vcpkg_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    let directory = versions_directory(name);
    format!("{base_url}/versions/{directory}/{name}.json")
}

fn versions_directory(name: &str) -> String {
    let first = name.chars().next().unwrap_or('_').to_ascii_lowercase();
    format!("{first}-")
}
