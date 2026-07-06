use quick_xml::Reader as XmlReader;
use semver::{Error as SemverError, Version as SemverVersion};
use serde_json::Value as JsonValue;
use std::path::Path as StdPath;
use std::string::FromUtf8Error as StringFromUtf8Error;
mod registry;
mod response;
mod vulnerability;

pub use registry::{
    ansible_role_registry_url_with_base, docker_hub_body_has_next_page, docker_hub_tags_page_url,
    dotnet_package_url_from_service_index, is_composer_platform_dependency, is_registry_dependency,
    is_registry_requirement, is_unsupported_dotnet_requirement, merge_docker_hub_response_pages,
    provider_id, python_package_json_url_template, registry_url, registry_url_with_base,
};
pub use response::{
    LatestVersionRequest, RegistryErrorStatus, build_versions_from_response, docker_tag_exists,
    http_status_message_from_code, latest_version_from_response,
    latest_version_from_response_for_request, latest_version_from_response_with_prereleases,
    npm_build_versions, npm_error_status_from_response, npm_release_versions,
    release_versions_from_response,
};
pub use vulnerability::{
    VulnerabilityAdvisory, vulnerability_advisories_from_response, vulnerability_request_body,
    vulnerability_titles_from_response, vulnerability_url, vulnerability_version_from_requirement,
};

pub(crate) fn parse_semver(value: &str) -> Result<SemverVersion, SemverError> {
    value.parse()
}

pub(crate) fn path(value: &str) -> &StdPath {
    value.as_ref()
}

pub(crate) fn default<T: Default>() -> T {
    <T as Default>::default()
}

pub(crate) fn json_bool(value: &JsonValue) -> Option<bool> {
    value.as_bool()
}

pub(crate) fn xml_reader(body: &str) -> XmlReader<&[u8]> {
    quick_xml::Reader::from_str(body)
}

pub(crate) fn string_from_utf8(value: Vec<u8>) -> Result<String, StringFromUtf8Error> {
    value.try_into()
}

pub(crate) fn json_array_mut(value: &mut JsonValue) -> Option<&mut Vec<JsonValue>> {
    value.as_array_mut()
}
