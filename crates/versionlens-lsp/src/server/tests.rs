use super::{VersionLensLspState, VersionLensTextDocument};

#[test]
fn resolves_supported_manifest_code_lenses() {
    let mut state = VersionLensLspState::standard();
    let diagnostics = state.open_document(VersionLensTextDocument {
        uri: "file:///workspace/package.json".to_owned(),
        language_id: "json".to_owned(),
        text: r#"{"dependencies":{"left-pad":"1.0.0"}}"#.to_owned(),
        workspace_root: Some("/workspace".to_owned()),
    });

    assert!(diagnostics.is_empty());
    assert!(
        !state
            .code_lenses("file:///workspace/package.json")
            .is_empty()
    );
}

#[test]
fn changes_unknown_document_without_diagnostics() {
    let mut state = VersionLensLspState::standard();
    assert!(
        state
            .change_document("file:///missing/package.json", "{}".to_owned())
            .is_empty()
    );
}
