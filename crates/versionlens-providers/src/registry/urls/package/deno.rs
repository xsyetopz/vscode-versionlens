use super::super::trim_end_slash;

pub(in crate::registry::urls) fn deno_registry_url(name: &str) -> String {
    format!("https://jsr.io/{name}/meta.json")
}

pub(in crate::registry::urls) fn deno_registry_url_with_base(base_url: &str, name: &str) -> String {
    format!("{}/{name}/meta.json", trim_end_slash(base_url))
}
