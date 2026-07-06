use std::path::Path;
use zed::settings::LspSettings;
use zed_extension_api::{self as zed, LanguageServerId, Result, Worktree};

const SERVER_BINARY: &str = "versionlens-lsp";

struct VersionLensExtension;

impl VersionLensExtension {
    fn repo_binary(worktree: &Worktree) -> Option<String> {
        let root = worktree.root_path();
        let binary = Path::new(&root).join("target/debug/versionlens-lsp");
        std::fs::metadata(&binary)
            .is_ok_and(|metadata| metadata.is_file())
            .then(|| binary.to_string_lossy().to_string())
    }

    fn server_path(language_server_id: &LanguageServerId, worktree: &Worktree) -> Result<String> {
        let settings = LspSettings::for_worktree(language_server_id.as_ref(), worktree)?;
        if let Some(binary) = settings.binary.and_then(|binary| binary.path) {
            return Ok(binary);
        }
        if let Some(path) = worktree.which(SERVER_BINARY) {
            return Ok(path);
        }
        if let Some(path) = Self::repo_binary(worktree) {
            return Ok(path);
        }
        Err(format!(
            "could not find '{SERVER_BINARY}'. Build it with `cargo build -p versionlens-lsp` or set lsp.versionlens.binary.path in Zed settings."
        ))
    }
}

impl zed::Extension for VersionLensExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<zed::Command> {
        Ok(zed::Command {
            command: Self::server_path(language_server_id, worktree)?,
            args: Vec::new(),
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(VersionLensExtension);
