use serde_json::Value;
use versionlens_versions::latest_version_with_prerelease_tags;

pub(crate) fn latest_vcpkg_version(
    value: &Value,
    include_prereleases: bool,
    prerelease_tags: &[String],
) -> Option<String> {
    let versions = value
        .get("versions")?
        .as_array()?
        .iter()
        .filter_map(|entry| entry.get("version").and_then(|value| value.as_str()));

    latest_version_with_prerelease_tags(versions, include_prereleases, prerelease_tags)
}
