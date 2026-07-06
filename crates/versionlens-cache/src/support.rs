use std::time::{Duration as StdDuration, Instant as StdInstant};

#[cfg(test)]
use crate::MemoryCache;
#[cfg(test)]
use crate::memory;
use crate::{CacheEntry, entry};

pub(crate) fn default<T: Default>() -> T {
    <T as Default>::default()
}

pub(crate) fn now() -> StdInstant {
    StdInstant::now()
}

pub(crate) fn cache_entry<T>(value: T, ttl: StdDuration) -> CacheEntry<T> {
    entry::cache_entry(value, ttl)
}

#[cfg(test)]
pub(crate) fn memory_cache<T>(ttl: StdDuration) -> MemoryCache<T> {
    memory::memory_cache(ttl)
}

#[cfg(test)]
pub(crate) fn duration_from_mins(minutes: u64) -> StdDuration {
    StdDuration::from_mins(minutes)
}
