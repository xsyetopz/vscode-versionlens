use serde_json::Value;

use super::github::latest_github_tag;

pub(crate) fn latest_zig_version(
    value: &Value,
    include_prereleases: bool,
    prerelease_tags: &[String],
) -> Option<String> {
    latest_github_tag(value, include_prereleases, prerelease_tags)
}
