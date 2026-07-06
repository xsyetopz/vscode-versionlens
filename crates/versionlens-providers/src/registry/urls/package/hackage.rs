use super::super::encoding::encode_component;
use super::super::trim_end_slash;

const STACKAGE_SNAPSHOTS_URL: &str = "https://www.stackage.org/api/v1/snapshots";

pub(in crate::registry::urls) fn hackage_registry_url(name: &str) -> String {
    if stackage_snapshot_name(name) {
        return STACKAGE_SNAPSHOTS_URL.to_owned();
    }

    format!(
        "https://hackage.haskell.org/package/{}.json",
        encode_component(name)
    )
}

pub(in crate::registry::urls) fn hackage_registry_url_with_base(
    base_url: &str,
    name: &str,
) -> String {
    if stackage_snapshot_name(name) {
        return hackage_registry_url(name);
    }

    let base_url = trim_end_slash(base_url);
    if base_url.ends_with("/package") {
        return format!("{base_url}/{}.json", encode_component(name));
    }

    format!("{base_url}/package/{}.json", encode_component(name))
}

fn stackage_snapshot_name(name: &str) -> bool {
    matches!(name, "stackage-lts" | "stackage-nightly")
}
