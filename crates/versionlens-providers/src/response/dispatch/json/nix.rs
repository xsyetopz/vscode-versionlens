use semver::Version;
use serde_json::Value;

use crate::response::dispatch::ResponseRequest;

pub(super) fn latest_nix_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    value
        .as_array()?
        .iter()
        .filter_map(|entry| {
            entry
                .as_str()
                .or_else(|| entry.get("name").and_then(|value| value.as_str()))
        })
        .filter_map(normalized_nix_tag)
        .filter_map(|tag| comparable_nix_version(tag, request).map(|version| (version, tag)))
        .max_by(|left, right| left.0.cmp(&right.0))
        .map(|(_, tag)| tag.to_owned())
}

fn normalized_nix_tag(tag: &str) -> Option<&str> {
    tag.strip_prefix("nixos-")
        .or_else(|| tag.strip_prefix("release-"))
        .or(Some(tag))
}

fn comparable_nix_version(tag: &str, request: &ResponseRequest<'_>) -> Option<Version> {
    if !request.include_prereleases && tag.contains('-') {
        return None;
    }
    if !request.prerelease_tags.is_empty()
        && tag.contains('-')
        && !request
            .prerelease_tags
            .iter()
            .any(|allowed| tag.contains(allowed))
    {
        return None;
    }
    let core = tag.split_once('-').map_or(tag, |(core, _)| core);
    let parts = core
        .split('.')
        .map(|part| {
            let trimmed = part.trim_start_matches('0');
            if trimmed.is_empty() { "0" } else { trimmed }
        })
        .collect::<Vec<_>>();
    let normalized = match parts.as_slice() {
        [major] => format!("{major}.0.0"),
        [major, minor] => format!("{major}.{minor}.0"),
        _ => parts.join("."),
    };
    crate::parse_semver(&normalized).ok()
}
