use crate::registry::urls::encoding::encode_component;
use crate::registry::urls::trim_end_slash;

pub(in crate::registry::urls) fn helm_registry_url(name: &str) -> String {
    helm_registry_url_with_base("https://charts.bitnami.com/bitnami", name)
}

pub(in crate::registry::urls) fn helm_registry_url_with_base(base_url: &str, name: &str) -> String {
    if let Some(oci) = name.strip_prefix("oci://") {
        let (registry, repository) = oci.split_once('/').unwrap_or((oci, ""));
        return format!(
            "https://{}/v2/{}/tags/list",
            trim_end_slash(registry),
            encode_oci_repository(repository)
        );
    }

    format!("{}/index.yaml", trim_end_slash(base_url))
}

fn encode_oci_repository(repository: &str) -> String {
    repository
        .split('/')
        .map(encode_component)
        .collect::<Vec<_>>()
        .join("/")
}
