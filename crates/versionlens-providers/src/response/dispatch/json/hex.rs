use serde_json::Value;

use super::super::ResponseRequest;
use crate::response::hex::latest_hex_version;

pub(super) fn latest_hex_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    latest_hex_version(value, request.include_prereleases, request.prerelease_tags)
}
