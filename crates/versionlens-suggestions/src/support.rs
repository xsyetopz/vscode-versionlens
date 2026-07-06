use semver::{Error as SemverError, Version as SemverVersion};

pub(crate) fn parse_semver(value: &str) -> Result<SemverVersion, SemverError> {
    value.parse()
}
