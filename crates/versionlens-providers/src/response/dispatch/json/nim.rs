use serde_json::Value;

use super::super::ResponseRequest;
use crate::response::nim::latest_nim_version;

pub(in crate::response::dispatch) fn latest_nim_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    latest_nim_version(
        value,
        request.package,
        request.include_prereleases,
        request.prerelease_tags,
    )
}
