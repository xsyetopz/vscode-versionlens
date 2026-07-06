use jsonc_parser::ast::Value::Object as JsonValueObject;
use jsonc_parser::parse_to_ast;

const PACKAGE_JSON_KEYS: &[&str] = &[
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "bundledDependencies",
    "bundleDependencies",
    "overrides",
    "packageManager",
    "jspm",
    "pnpm",
    "workspaces",
];

pub(super) fn looks_like_package_json(text: &str) -> bool {
    let Ok(parse_result) = parse_to_ast(text, &crate::default(), &crate::default()) else {
        return false;
    };
    let Some(JsonValueObject(root)) = parse_result.value else {
        return false;
    };

    PACKAGE_JSON_KEYS.iter().any(|key| root.get(key).is_some())
}
