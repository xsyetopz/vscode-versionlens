use super::{line_range, offset_range};
use std::fs::read_to_string;
use std::path::PathBuf;

#[test]
fn offset_ranges_count_utf16_code_units_like_vscode_position_at() {
    let text =
        package_file_fixture("offset-ranges-count-utf16-code-units-like-vscode-position-at.txt");
    let name_start = text.find("left-pad").expect("dependency name");
    let range = offset_range(text, name_start, name_start + "left-pad".len());

    assert_eq!(range.start.line, 0);
    assert_eq!(range.start.character, 20);
    assert_eq!(range.end.character, 28);
}

#[test]
fn line_ranges_count_utf16_code_units_like_vscode_position_at() {
    let line = "😀 FROM node:20";
    let name_start = line.find("node").expect("image name");
    let range = line_range(0, line, name_start, name_start + "node".len());

    assert_eq!(range.start.line, 0);
    assert_eq!(range.start.character, 8);
    assert_eq!(range.end.character, 12);
}

fn package_file_fixture(name: &str) -> &'static str {
    let path = repo_root()
        .join("tests/fixtures/versionlens-parsers/src/positions/tests")
        .join(name);
    let contents = read_to_string(&path).unwrap_or_else(|error| {
        panic!(
            "failed to read package-file fixture {}: {error}",
            path.display()
        )
    });
    crate::leaked_string(contents)
}

fn repo_root() -> PathBuf {
    <PathBuf as From<&str>>::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|path| path.parent())
        .expect("crate should be under crates/")
        .to_path_buf()
}
