use self::ElementTextEvent::{
    End as ElementTextEnd, Finished as ElementTextFinished, Ignored as ElementTextIgnored,
    Start as ElementTextStart, Text as ElementTextText,
};
use quick_xml::events::Event;
use quick_xml::events::Event::{
    End as XmlEventEnd, Eof as XmlEventEof, Start as XmlEventStart, Text as XmlEventText,
};

pub(super) enum ElementTextEvent {
    Start,
    Text(String),
    End,
    Finished,
    Ignored,
}

pub(super) fn element_text_event(
    event: Event<'_>,
    in_element: bool,
    element_name: &[u8],
) -> Option<ElementTextEvent> {
    match event {
        XmlEventStart(event) if event.name().as_ref() == element_name => Some(ElementTextStart),
        XmlEventText(event) if in_element => {
            Some(ElementTextText(event.decode().ok()?.into_owned()))
        }
        XmlEventEnd(event) if event.name().as_ref() == element_name => Some(ElementTextEnd),
        XmlEventEof => Some(ElementTextFinished),
        _ => Some(ElementTextIgnored),
    }
}
