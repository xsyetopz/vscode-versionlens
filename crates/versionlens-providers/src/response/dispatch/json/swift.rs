use serde_json::Value;

use super::super::ResponseRequest;
use crate::response::swift::latest_swift_version;

pub(in crate::response::dispatch) fn latest_swift_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    latest_swift_version(value, request.include_prereleases, request.prerelease_tags)
}
