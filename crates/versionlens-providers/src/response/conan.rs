use serde_json::Value;
use std::cmp::Ordering;
use std::cmp::Ordering::Equal as OrderingEqual;

pub(crate) fn latest_conan_version(value: &Value, package: &str) -> Option<String> {
    conan_release_versions_from_value(value, package)
        .into_iter()
        .max_by(|left, right| compare_conan_versions(left, right))
}

fn conan_release_versions_from_value(value: &Value, package: &str) -> Vec<String> {
    let Some(results) = value.get("results").and_then(|value| value.as_array()) else {
        return vec![];
    };

    let mut versions = vec![];
    for reference in results.iter().filter_map(|value| value.as_str()) {
        let Some(version) = conan_reference_version(reference, package) else {
            continue;
        };
        if !versions.iter().any(|candidate| candidate == version) {
            versions.push(version.to_owned());
        }
    }
    versions
}

fn conan_reference_version<'a>(reference: &'a str, package: &str) -> Option<&'a str> {
    let (name, rest) = reference.split_once('/')?;
    if name != package {
        return None;
    }
    let version_end = rest.find(['@', '#']).unwrap_or(rest.len());
    let version = &rest[..version_end];
    (!version.is_empty()).then_some(version)
}

fn compare_conan_versions(left: &str, right: &str) -> Ordering {
    match (crate::parse_semver(left), crate::parse_semver(right)) {
        (Ok(left), Ok(right)) => left.cmp(&right),
        _ => compare_loose_segments(left, right),
    }
}

fn compare_loose_segments(left: &str, right: &str) -> Ordering {
    let left = numeric_segments(left).collect::<Vec<_>>();
    let right = numeric_segments(right).collect::<Vec<_>>();
    let len = left.len().max(right.len());
    for index in 0..len {
        let ordering = left
            .get(index)
            .copied()
            .unwrap_or(0)
            .cmp(&right.get(index).copied().unwrap_or(0));
        if ordering != OrderingEqual {
            return ordering;
        }
    }
    left.len().cmp(&right.len())
}

fn numeric_segments(version: &str) -> impl Iterator<Item = u64> + '_ {
    version
        .split(['.', '-', '+'])
        .map(|segment| segment.parse::<u64>().unwrap_or(0))
}
