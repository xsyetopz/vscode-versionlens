use semver::{
    BuildMetadata as SemverBuildMetadata, Error as SemverError, Prerelease as SemverPrerelease,
    Version as SemverVersion, VersionReq as SemverVersionReq,
};

pub(crate) fn parse_semver(value: &str) -> Result<SemverVersion, SemverError> {
    value.parse()
}

fn empty_prerelease() -> SemverPrerelease {
    SemverPrerelease::EMPTY
}

fn empty_build_metadata() -> SemverBuildMetadata {
    SemverBuildMetadata::EMPTY
}

pub(crate) fn semver_version(major: u64, minor: u64, patch: u64) -> SemverVersion {
    SemverVersion {
        major,
        minor,
        patch,
        pre: empty_prerelease(),
        build: empty_build_metadata(),
    }
}

pub(crate) fn parse_semver_req(value: &str) -> Result<SemverVersionReq, SemverError> {
    value.parse()
}
