mod github;
mod selector;
mod specifier;

pub(super) use github::github_dependency;
pub(super) use selector::{terminal_resolution_selector, trim_package_descriptor, trim_selector};
pub(super) use specifier::{alias_dependency, parse_package_manager, string_requirement};
