use quick_xml::Error as XmlError;
use quick_xml::events::Event;
use quick_xml::events::Event::{
    Empty as XmlEventEmpty, End as XmlEventEnd, Eof as XmlEventEof, Start as XmlEventStart,
    Text as XmlEventText,
};

use super::state::DotnetXmlCollector;
use crate::dotnet_xml::DotnetEventContext;

pub(super) fn dotnet_xml_event_finished(
    context: &DotnetEventContext<'_>,
    event: Result<Event<'_>, XmlError>,
    collector: &mut DotnetXmlCollector<'_>,
) -> bool {
    let Ok(event) = event else {
        return true;
    };
    if matches!(event, XmlEventEof) {
        return true;
    }

    collect_dotnet_xml_event(context, event, collector);
    false
}

fn collect_dotnet_xml_event(
    context: &DotnetEventContext<'_>,
    event: Event<'_>,
    collector: &mut DotnetXmlCollector<'_>,
) {
    if collect_dotnet_element_event(context, &event, collector) {
        return;
    }

    if let XmlEventText(event) = event {
        collector.text(&event);
    }
}

fn collect_dotnet_element_event(
    context: &DotnetEventContext<'_>,
    event: &Event<'_>,
    collector: &mut DotnetXmlCollector<'_>,
) -> bool {
    if let XmlEventStart(event) = event {
        collector.start_tag(context, event);
        return true;
    }
    if let XmlEventEmpty(event) = event {
        collector.empty_tag(context, event);
        return true;
    }
    if let XmlEventEnd(event) = event {
        collector.end_tag(context.text, event.name().as_ref());
        return true;
    }

    false
}
