use serde_json::Value;

pub(crate) fn latest_cpan_version(value: &Value) -> Option<String> {
    value
        .get("version")
        .and_then(|value| value.as_str())
        .map(|value| value.to_owned())
}
