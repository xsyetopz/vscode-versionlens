use super::super::RegistryErrorStatus;
use crate::response::RegistryErrorStatus::{
    Error as RegistryStatusError, Invalid as RegistryStatusInvalid,
    InvalidWithLatest as RegistryStatusInvalidWithLatest,
    NotSupported as RegistryStatusNotSupported,
};

type RegistryErrorBuilder = fn(String) -> RegistryErrorStatus;
type NpmErrorStatusSpec = (&'static str, RegistryErrorBuilder, &'static str);

const NPM_ERROR_STATUSES: &[NpmErrorStatusSpec] = &[
    ("ECONNREFUSED", RegistryStatusError, "connection refused"),
    ("ECONNRESET", RegistryStatusError, "connection reset"),
    ("EUNSUPPORTEDPROTOCOL", not_supported, "not supported"),
    (
        "EINVALIDTAGNAME",
        RegistryStatusInvalidWithLatest,
        "invalid version",
    ),
    (
        "EINVALIDPACKAGENAME",
        RegistryStatusInvalid,
        "invalid version",
    ),
];

fn not_supported(_: String) -> RegistryErrorStatus {
    RegistryStatusNotSupported
}

pub(super) fn npm_known_error_status(status: &str) -> Option<RegistryErrorStatus> {
    NPM_ERROR_STATUSES
        .iter()
        .find_map(|(code, build, message)| (*code == status).then(|| build((*message).to_owned())))
}
