use crate::registry::urls::encoding::encode_component;
use crate::registry::urls::trim_end_slash;

pub(in crate::registry::urls) fn ansible_registry_url(name: &str) -> String {
    ansible_registry_url_with_base("https://galaxy.ansible.com", name)
}

pub(in crate::registry::urls) fn ansible_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    let (namespace, package) = name.split_once('.').unwrap_or(("", name));
    format!(
        "{}/api/v3/plugin/ansible/content/published/collections/index/{}/{}/versions/",
        trim_end_slash(base_url),
        encode_component(namespace),
        encode_component(package)
    )
}

pub fn ansible_role_registry_url_with_base(base_url: &str, name: &str) -> String {
    let (namespace, role) = name.split_once('.').unwrap_or(("", name));
    format!(
        "{}/api/v1/roles/?owner__username={}&name={}",
        trim_end_slash(base_url),
        encode_component(namespace),
        encode_component(role)
    )
}
