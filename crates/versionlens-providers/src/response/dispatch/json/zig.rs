use serde_json::Value;

use super::super::ResponseRequest;
use crate::response::zig::latest_zig_version;

pub(in crate::response::dispatch) fn latest_zig_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    latest_zig_version(value, request.include_prereleases, request.prerelease_tags)
}
