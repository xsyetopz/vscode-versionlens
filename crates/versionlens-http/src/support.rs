#[cfg(test)]
use std::io::{Error as IoError, ErrorKind as IoErrorKind};
use std::sync::{Mutex as StdMutex, PoisonError as SyncPoisonError};
use std::time::Duration as StdDuration;

pub(crate) fn recover_poison<T>(poisoned: SyncPoisonError<T>) -> T {
    poisoned.into_inner()
}

pub(crate) const fn duration_from_millis(milliseconds: u64) -> StdDuration {
    StdDuration::from_millis(milliseconds)
}

pub(crate) fn mutex<T>(value: T) -> StdMutex<T> {
    StdMutex::new(value)
}

#[cfg(test)]
pub(crate) fn io_error_from_kind(kind: IoErrorKind) -> IoError {
    kind.into()
}
