# versionlens-lsp

The editor-neutral Language Server Protocol adapter for VersionLens Redux. Zed and JetBrains integrations use this crate instead of the VS Code N-API boundary.

## Role

Language server for the Rust workspace in VersionLens Redux. This crate is part of the repository implementation and is not documented as an independent public API.

## Validation

```bash
cargo test -p versionlens-lsp
```

Run `bun run check` from the repository root before merging broad workspace changes.

## License

[ISC](../../LICENSE)
