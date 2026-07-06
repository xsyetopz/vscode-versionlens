use quick_xml::Reader as XmlReader;
use std::path::Path as StdPath;
use toml_edit::{Document as TomlDocument, TomlError};

#[cfg(test)]
pub(crate) fn leaked_string(contents: String) -> &'static str {
    <Box<str>>::leak(contents.into_boxed_str())
}

pub(crate) fn default<T: Default>() -> T {
    <T as Default>::default()
}

pub(crate) fn path(value: &str) -> &StdPath {
    value.as_ref()
}

pub(crate) fn xml_reader(text: &str) -> XmlReader<&[u8]> {
    quick_xml::Reader::from_str(text)
}

pub(crate) fn is_whitespace(value: char) -> bool {
    value.is_whitespace()
}

pub(crate) fn parse_toml_document(text: &str) -> Result<TomlDocument<String>, TomlError> {
    text.parse()
}

pub(crate) fn string_from_utf8_lossy(bytes: &[u8]) -> String {
    <String>::from_utf8_lossy(bytes).into_owned()
}
