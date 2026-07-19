use std::cmp::Ordering;

use versionlens_versions::{compare_versions, requirement_satisfies_latest};

pub(super) fn python_replacement(requirement: &str, latest: &str) -> String {
    if requirement.contains(',') {
        return replace_python_multi_constraint(requirement, latest);
    }

    leading_python_operator(requirement.trim_start()).map_or_else(
        || latest.to_owned(),
        |operator| python_operator_replacement(operator, latest),
    )
}

fn python_operator_replacement(operator: &str, latest: &str) -> String {
    match operator {
        "<" | "<=" => format!("<={latest}"),
        ">" | ">=" => format!(">={latest}"),
        "!=" => format!("=={latest}"),
        _ => format!("{operator}{latest}"),
    }
}

fn replace_python_multi_constraint(requirement: &str, latest: &str) -> String {
    let mut parts = requirement
        .split(',')
        .map(|value| value.trim())
        .filter(|part| !python_exclusion_conflicts_with_latest(part, latest))
        .collect::<Vec<_>>();
    let has_upper_bound = parts.iter().any(|part| part.starts_with('<'));
    let has_lower_bound = parts.iter().any(|part| part.starts_with('>'));
    let positive_bounds = parts
        .iter()
        .copied()
        .filter(|part| !part.starts_with("!="))
        .collect::<Vec<_>>()
        .join(", ");
    let update_upper_bound = has_upper_bound
        && (!has_lower_bound || !requirement_satisfies_latest(&positive_bounds, latest));

    let has_positive_selector = parts
        .iter()
        .any(|part| leading_python_operator(part).is_some_and(|operator| operator != "!="));
    if !has_positive_selector {
        parts.push("");
    }

    parts
        .into_iter()
        .map(|part| {
            if part.starts_with('>') {
                format!(">={latest}")
            } else if update_upper_bound && part.starts_with('<') {
                format!("<={latest}")
            } else if let Some(operator @ ("===" | "==" | "~=")) = leading_python_operator(part) {
                format!("{operator}{latest}")
            } else if part.is_empty() {
                format!("=={latest}")
            } else {
                part.to_owned()
            }
        })
        .collect::<Vec<_>>()
        .join(", ")
}

fn python_exclusion_conflicts_with_latest(part: &str, latest: &str) -> bool {
    let Some(excluded) = part.strip_prefix("!=").map(str::trim) else {
        return false;
    };

    excluded == latest
        || excluded.strip_suffix(".*").is_some_and(|prefix| {
            latest == prefix
                || latest
                    .strip_prefix(prefix)
                    .is_some_and(|suffix| suffix.starts_with('.'))
        })
        || compare_versions(excluded, latest) == Some(Ordering::Equal)
}

fn leading_python_operator(version: &str) -> Option<&'static str> {
    const OPERATORS: [&str; 8] = ["===", "==", "!=", "<=", ">=", "<", ">", "~="];

    OPERATORS
        .iter()
        .copied()
        .find(|operator| version.starts_with(operator))
}

#[cfg(test)]
mod tests {
    use super::{python_exclusion_conflicts_with_latest, python_replacement};

    #[test]
    fn standalone_exclusion_becomes_an_exact_target() {
        assert_eq!(python_replacement("!=1.0.0", "2.0.0"), "==2.0.0");
    }

    #[test]
    fn advances_explicit_composite_python_selectors() {
        for (requirement, expected) in [
            ("~=1.0.0, !=1.1.0", "~=2.0.0, !=1.1.0"),
            ("==1.0.0, !=1.1.0", "==2.0.0, !=1.1.0"),
            ("===1.0.0, !=1.1.0", "===2.0.0, !=1.1.0"),
        ] {
            assert_eq!(python_replacement(requirement, "2.0.0"), expected);
        }
    }

    #[test]
    fn removes_only_exclusions_that_reject_the_selected_latest() {
        assert_eq!(
            python_replacement(">=1, <3, !=2, !=1.5", "2.0.0"),
            ">=2.0.0, <3, !=1.5"
        );
        assert_eq!(
            python_replacement(">=1, <3, !=2.*, !=3.*", "2.0.0"),
            ">=2.0.0, <3, !=3.*"
        );
        assert!(python_exclusion_conflicts_with_latest(
            "!=1!2.0.0",
            "1!2.0.0"
        ));
    }

    #[test]
    fn preserves_bounded_range_replacement_behavior() {
        for (requirement, expected) in [
            (">=1.0.0, <3.0.0", ">=2.0.0, <3.0.0"),
            (">=1.0.0, <3.0.0, !=1.5.0", ">=2.0.0, <3.0.0, !=1.5.0"),
            (">=1.0.0, <2.0.0", ">=2.0.0, <=2.0.0"),
            ("<3.0.0, !=1.5.0", "<=2.0.0, !=1.5.0"),
        ] {
            assert_eq!(python_replacement(requirement, "2.0.0"), expected);
        }
    }

    #[test]
    fn targets_latest_when_composite_contains_only_exclusions() {
        assert_eq!(
            python_replacement("!=1.0.0, !=1.5.0", "2.0.0"),
            "!=1.0.0, !=1.5.0, ==2.0.0"
        );
    }
}
