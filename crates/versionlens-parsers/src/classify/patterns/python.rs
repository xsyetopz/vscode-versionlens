use super::super::uri::{file_name, has_extension};

pub(super) fn is_requirements_txt_uri(uri: &str) -> bool {
    matches!(
        file_name(uri),
        Some(name) if is_python_requirements_or_constraints_name(name) && has_extension(name, ["txt"])
    )
}

pub(super) fn is_pipfile_uri(uri: &str) -> bool {
    matches!(file_name(uri), Some(name) if name.eq_ignore_ascii_case("Pipfile"))
}

pub(super) fn is_pyproject_toml_uri(uri: &str) -> bool {
    matches!(file_name(uri), Some(name) if name.eq_ignore_ascii_case("pyproject.toml"))
}

fn is_python_requirements_or_constraints_name(name: &str) -> bool {
    let name = name.to_lowercase();
    name.contains("requirements") || name.contains("constraints")
}
