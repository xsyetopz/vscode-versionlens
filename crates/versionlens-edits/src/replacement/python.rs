use versionlens_versions::requirement_satisfies_latest;

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
        _ => format!("{operator}{latest}"),
    }
}

fn replace_python_multi_constraint(requirement: &str, latest: &str) -> String {
    let parts = requirement
        .split(',')
        .map(|value| value.trim())
        .collect::<Vec<_>>();
    let has_upper_bound = parts.iter().any(|part| part.starts_with('<'));
    let has_lower_bound = parts.iter().any(|part| part.starts_with('>'));
    let update_upper_bound =
        has_upper_bound && (!has_lower_bound || !requirement_satisfies_latest(requirement, latest));

    parts
        .into_iter()
        .map(|part| {
            if part.starts_with('>') {
                format!(">={latest}")
            } else if update_upper_bound && part.starts_with('<') {
                format!("<={latest}")
            } else {
                part.to_owned()
            }
        })
        .collect::<Vec<_>>()
        .join(", ")
}

fn leading_python_operator(version: &str) -> Option<&'static str> {
    const OPERATORS: [&str; 8] = ["===", "==", "!=", "<=", ">=", "<", ">", "~="];

    OPERATORS
        .iter()
        .copied()
        .find(|operator| version.starts_with(operator))
}
