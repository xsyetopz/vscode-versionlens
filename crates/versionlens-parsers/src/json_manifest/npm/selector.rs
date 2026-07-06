pub(in crate::json_manifest) fn trim_selector(name: &str) -> &str {
    selector_trim_index(name).map_or(name, |index| &name[..index])
}

pub(in crate::json_manifest) fn terminal_resolution_selector(selector: &str) -> &str {
    let terminal = terminal_resolution_package(selector);
    trim_package_descriptor(terminal)
}

fn terminal_resolution_package(selector: &str) -> &str {
    let segments = selector.split('/').collect::<Vec<_>>();
    if segments.len() >= 2 && segments[segments.len() - 2].starts_with('@') {
        let start = selector.len()
            - segments[segments.len() - 2].len()
            - 1
            - segments[segments.len() - 1].len();
        return &selector[start..];
    }
    segments.last().copied().unwrap_or(selector)
}

pub(in crate::json_manifest) fn trim_package_descriptor(name: &str) -> &str {
    if let Some(remainder) = name.strip_prefix('@') {
        if let Some(slash) = remainder.find('/') {
            let package_start = slash + 2;
            if let Some(index) = name[package_start..].find('@') {
                return &name[..package_start + index];
            }
        }
        return name;
    }
    trim_selector(name)
}

fn selector_trim_index(name: &str) -> Option<usize> {
    let index = name.find('@')?;
    (index > 0).then_some(index)
}
