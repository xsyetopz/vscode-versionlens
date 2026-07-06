use serde_json::Value;

use super::super::ResponseRequest;
use crate::response::conan::latest_conan_version;

pub(in crate::response::dispatch) fn latest_conan_json_response(
    value: &Value,
    request: &ResponseRequest<'_>,
) -> Option<String> {
    latest_conan_version(value, request.package)
}
