use super::super::encoding::encode_component;
use super::super::trim_end_slash;

pub(in crate::registry::urls) fn opam_registry_url(name: &str) -> String {
    format!(
        "https://opam.ocaml.org/packages/{}/",
        encode_component(name)
    )
}

pub(in crate::registry::urls) fn opam_registry_url_with_base(base_url: &str, name: &str) -> String {
    let base_url = trim_end_slash(base_url);
    if base_url.ends_with("/packages") {
        return format!("{base_url}/{}/", encode_component(name));
    }

    format!("{base_url}/packages/{}/", encode_component(name))
}
