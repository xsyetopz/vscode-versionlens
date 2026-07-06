use crate::registry::urls::encoding::encode_component;
use crate::registry::urls::trim_end_slash;

pub(in crate::registry::urls) fn bazel_registry_url(name: &str) -> String {
    format!(
        "https://raw.githubusercontent.com/bazelbuild/bazel-central-registry/main/modules/{}/metadata.json",
        encode_component(name)
    )
}

pub(in crate::registry::urls) fn bazel_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    format!(
        "{}/modules/{}/metadata.json",
        trim_end_slash(base_url),
        encode_component(name)
    )
}
