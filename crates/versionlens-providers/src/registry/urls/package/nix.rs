use crate::registry::urls::encoding::encode_component;

pub(in crate::registry::urls) fn nix_registry_url(name: &str) -> String {
    let (owner, repo) = name.split_once('/').unwrap_or(("NixOS", name));
    format!(
        "https://api.github.com/repos/{}/{}/tags",
        encode_component(owner),
        encode_component(repo)
    )
}

pub(in crate::registry::urls) fn nix_registry_url_with_base(base_url: &str, name: &str) -> String {
    if base_url.starts_with("https://api.github.com/repos") {
        return nix_registry_url(name);
    }
    nix_registry_url(name)
}
