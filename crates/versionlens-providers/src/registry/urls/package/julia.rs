use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn julia_registry_url(name: &str) -> String {
    julia_registry_url_with_base(
        "https://raw.githubusercontent.com/JuliaRegistries/General/master",
        name,
    )
}

pub(in crate::registry::urls) fn julia_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    let prefix = name
        .chars()
        .next()
        .map(|char| char.to_uppercase().to_string())
        .unwrap_or_default();
    format!(
        "{base_url}/{}/{}/Versions.toml",
        encode_component(&prefix),
        encode_component(name)
    )
}
