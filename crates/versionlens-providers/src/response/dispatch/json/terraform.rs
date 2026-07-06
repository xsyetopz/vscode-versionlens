use serde_json::Value;
use versionlens_versions::latest_version_with_prerelease_tags;

use crate::response::dispatch::ResponseRequest;

pub(super) fn latest_terraform_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    let versions = value
        .get("versions")?
        .as_array()?
        .iter()
        .filter_map(|entry| entry.get("version").and_then(|value| value.as_str()));
    latest_version_with_prerelease_tags(
        versions,
        request.include_prereleases,
        request.prerelease_tags,
    )
}
