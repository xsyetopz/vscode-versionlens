use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SuggestionIndicators {
    pub latest: String,
    pub satisfies_latest: String,
    pub directory: String,
    pub error: String,
    pub no_match: String,
    pub matched: String,
    pub updateable: String,
    pub updateable_vulnerable: String,
    pub build: String,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub struct SuggestionIndicatorsInput {
    pub latest: Option<String>,
    pub satisfies_latest: Option<String>,
    pub directory: Option<String>,
    pub error: Option<String>,
    pub no_match: Option<String>,
    pub matched: Option<String>,
    pub updateable: Option<String>,
    pub updateable_vulnerable: Option<String>,
    pub build: Option<String>,
}

impl SuggestionIndicators {
    pub fn standard() -> Self {
        standard_suggestion_indicators()
    }

    pub fn from_input(input: SuggestionIndicatorsInput) -> Self {
        let defaults = Self::standard();
        Self {
            latest: indicator_or_default(input.latest, defaults.latest),
            satisfies_latest: indicator_or_default(
                input.satisfies_latest,
                defaults.satisfies_latest,
            ),
            directory: indicator_or_default(input.directory, defaults.directory),
            error: indicator_or_default(input.error, defaults.error),
            no_match: indicator_or_default(input.no_match, defaults.no_match),
            matched: indicator_or_default(input.matched, defaults.matched),
            updateable: indicator_or_default(input.updateable, defaults.updateable),
            updateable_vulnerable: indicator_or_default(
                input.updateable_vulnerable,
                defaults.updateable_vulnerable,
            ),
            build: indicator_or_default(input.build, defaults.build),
        }
    }
}

fn indicator_or_default(value: Option<String>, default: String) -> String {
    value
        .filter(|indicator| !indicator.trim().is_empty())
        .unwrap_or(default)
}

pub fn standard_suggestion_indicators() -> SuggestionIndicators {
    SuggestionIndicators {
        latest: "\u{1F7E2}".to_owned(),
        satisfies_latest: "\u{1F7E2}".to_owned(),
        directory: "\u{1F4C1}".to_owned(),
        error: "\u{1F534}".to_owned(),
        no_match: "\u{26AA}".to_owned(),
        matched: "\u{1F7E1}".to_owned(),
        updateable: "\u{2191} ".to_owned(),
        updateable_vulnerable: "\u{26A0}\u{FE0F}".to_owned(),
        build: "\u{224C} ".to_owned(),
    }
}
