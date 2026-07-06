mod range;
mod replacement;
mod sort;
mod support;
mod update;

pub use sort::{can_sort_dependencies, sort_dependency_edits};
#[cfg(test)]
pub(crate) use support::leaked_string;
pub(crate) use support::{default, parse_semver};
pub use update::{bulk_update_edits, update_edits};
