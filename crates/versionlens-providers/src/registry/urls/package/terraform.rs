use crate::registry::urls::encoding::encode_component;
use crate::registry::urls::trim_end_slash;

pub(in crate::registry::urls) fn terraform_registry_url(name: &str) -> String {
    terraform_registry_url_with_base("https://registry.terraform.io", name)
}

pub(in crate::registry::urls) fn terraform_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let base_url = trim_end_slash(base_url);
    let (host, namespace, provider) = terraform_source_parts(name);
    let registry_base = if host == "registry.terraform.io" {
        base_url.to_owned()
    } else {
        format!("https://{host}")
    };
    format!(
        "{registry_base}/v1/providers/{}/{}/versions",
        encode_component(namespace),
        encode_component(provider)
    )
}

fn terraform_source_parts(name: &str) -> (&str, &str, &str) {
    let parts = name.split('/').collect::<Vec<_>>();
    match parts.as_slice() {
        [namespace, provider] => ("registry.terraform.io", namespace, provider),
        [host, namespace, provider] => (host, namespace, provider),
        _ => ("registry.terraform.io", "hashicorp", name),
    }
}
