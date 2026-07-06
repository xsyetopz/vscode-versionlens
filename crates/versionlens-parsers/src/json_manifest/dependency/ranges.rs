use jsonc_parser::ast::ObjectProp;
use jsonc_parser::ast::ObjectPropName::{String as ObjectPropString, Word as ObjectPropWord};

pub(in crate::json_manifest) fn string_content_start(start: usize, end: usize) -> usize {
    start + usize::from(end > start)
}

pub(in crate::json_manifest) fn string_content_end(start: usize, end: usize) -> usize {
    end.saturating_sub(usize::from(end > start))
}

pub(in crate::json_manifest) fn property_name_range(prop: &ObjectProp<'_>) -> (usize, usize) {
    match &prop.name {
        ObjectPropString(lit) => (
            string_content_start(lit.range.start, lit.range.end),
            string_content_end(lit.range.start, lit.range.end),
        ),
        ObjectPropWord(lit) => (lit.range.start, lit.range.end),
    }
}
