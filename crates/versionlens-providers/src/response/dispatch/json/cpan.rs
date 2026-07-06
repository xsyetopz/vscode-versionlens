use serde_json::Value;

use super::super::ResponseRequest;
use crate::response::cpan::latest_cpan_version;

pub(in crate::response::dispatch) fn latest_cpan_json_response(
    value: &Value,
    _: &ResponseRequest<'_>,
) -> Option<String> {
    latest_cpan_version(value)
}
