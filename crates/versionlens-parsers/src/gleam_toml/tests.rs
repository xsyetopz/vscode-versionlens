use super::parse_gleam_toml;

#[test]
fn parses_gleam_project_version() {
    let dependencies = parse_gleam_toml(
        r#"name = "my_package"
version = "1.2.3"

[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
"#,
    );

    assert_eq!(dependencies.len(), 2);
    assert_eq!(dependencies[0].name, "my_package");
    assert_eq!(dependencies[0].requirement, "1.2.3");
    assert_eq!(dependencies[0].group, "version");
    assert_eq!(dependencies[0].requirement_range.start.line, 1);
    assert_eq!(dependencies[0].requirement_range.start.character, 11);
    assert_eq!(dependencies[1].name, "gleam_stdlib");
}

#[test]
fn ignores_non_root_gleam_version_fields() {
    let dependencies = parse_gleam_toml(
        r#"[metadata]
name = "not_the_package"
version = "9.9.9"

[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
"#,
    );

    assert_eq!(dependencies.len(), 1);
    assert_eq!(dependencies[0].name, "gleam_stdlib");
}

#[test]
fn parses_gleam_dependency_tables() {
    let dependencies = parse_gleam_toml(
        r#"[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
local = { path = "../local" }
remote = { git = "https://github.com/example/remote", ref = "abc123" }

[dev_dependencies]
gleeunit = ">= 1.0.0 and < 2.0.0"
"#,
    );

    assert_eq!(dependencies.len(), 4);
    assert_eq!(dependencies[0].name, "gleam_stdlib");
    assert_eq!(dependencies[0].group, "dependencies");
    assert_eq!(dependencies[1].hosted_url.as_deref(), Some("path"));
    assert_eq!(dependencies[2].hosted_url.as_deref(), Some("git"));
    assert_eq!(dependencies[3].group, "dev_dependencies");
}

#[test]
fn parses_gleam_hyphenated_dev_dependencies_table() {
    let dependencies = parse_gleam_toml(
        r#"[dev-dependencies]
gleeunit = ">= 1.0.0 and < 2.0.0"
"#,
    );

    assert_eq!(dependencies.len(), 1);
    assert_eq!(dependencies[0].name, "gleeunit");
    assert_eq!(dependencies[0].requirement, ">= 1.0.0 and < 2.0.0");
    assert_eq!(dependencies[0].group, "dev-dependencies");
}

#[test]
fn parses_gleam_multiline_git_dependency() {
    let dependencies = parse_gleam_toml(
        r#"[dependencies]
my_library = {
  git = "https://github.com/my-project/my-library",
  ref = "a8b3c5d82"
}
"#,
    );

    assert_eq!(dependencies.len(), 1);
    assert_eq!(dependencies[0].name, "my_library");
    assert_eq!(
        dependencies[0].requirement,
        "https://github.com/my-project/my-library"
    );
    assert_eq!(dependencies[0].hosted_url.as_deref(), Some("git"));
}
