use super::DockerTagEntry;
use super::ranked::latest_ranked_tag;

type DockerTagEntries<'a> = &'a [DockerTagEntry<'a>];

pub(in crate::response::docker::latest) fn latest_alias_tag(
    tags: DockerTagEntries<'_>,
    include_prereleases: bool,
    prerelease_tags: &[String],
) -> Option<String> {
    let latest_digest = tags
        .iter()
        .find_map(|(tag, digest)| (*tag == "latest").then_some(*digest).flatten())?;
    latest_ranked_tag(
        tags.iter()
            .filter(|(tag, digest)| *tag != "latest" && *digest == Some(latest_digest))
            .map(|(tag, _)| *tag),
        include_prereleases,
        prerelease_tags,
    )
}
