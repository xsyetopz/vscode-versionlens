export enum IconCommandFeatures {
  ShowError = 'versionlens.icons.showError',
  ShowPrereleaseVersions = 'versionlens.icons.showPrereleaseVersions',
  HidePrereleaseVersions = 'versionlens.icons.hidePrereleaseVersions',
  ShowVersionLenses = 'versionlens.icons.showVersionLenses',
  HideVersionLenses = 'versionlens.icons.hideVersionLenses'
}

export enum StateFeatures {
  Show = 'versionlens.show',
  ShowPrereleases = 'versionlens.showPrereleases',
  ShowOutdated = 'versionlens.showOutdated',
  ProviderActive = 'versionlens.providerActive',
  ProviderBusy = 'versionlens.providerBusy',
  ProviderError = 'versionlens.providerError',
  CodeLenReplace = 'versionlens.codeLensReplace'
}

export enum SuggestionCommandFeatures {
  OnUpdateDependencyClick = 'versionlens.suggestions.updateDependencyClick',
  OnFileLinkClick = "versionlens.suggestions.fileLinkClick",
  OnClearCache = "versionlens.suggestions.clearCache"
}

export enum SuggestionFeatures {
  ShowOnStartup = 'suggestions.showOnStartup',
  ShowPrereleasesOnStartup = 'suggestions.showPrereleasesOnStartup',
  Indicators = 'suggestions.indicators',
}