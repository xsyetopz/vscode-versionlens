# Suggestion links overview

![image](../images/docs/suggestions/suggestion-overview-diagram.svg)

> **Types of versions**
> - Fixed version e.g. `x.x.x`
> - Ranged version e.g. `x.x.*`

### Status Indication

  - What version will be installed by the package manager
  - Depending on the type of version
    - `Latest` version (shown for either fixed and ranged version types)
    - `Satisfies` the maximum version within the given ranged version
    - `Fixed` to a specific version if not the latest (Fixed version types only)

  #### Indicators

  |Prefix|Indicator|Description|
  |-|-|-|
  |🟢|Latest|Latest
  |🟡|Match|A match was found that is not the latest version.
  |⚪|No Match|No match found for the version specified
  |🔴|Error|An error occurred
  |↑|Updateable|An update action that will replace the specified version
  |≌|Change Build|An update action that will present a choice of build versions available
  |📁|Directory|The version entry is a file or folder location

  > **NOTE**
  >
  > The prefixed unicodes can be overriden in your `settings.json` file
  > by changing the `versionlens.suggestions.indicators` feature

### Suggestion links

Version links are always grouped by releases and pre-releases. <br> Each release and pre-release group is sorted from left (highest version) to right (lowest version).

The following rules only apply when a matching version is available for a package

|Name|Description|
|-|-|
|Latest|Shows latest release|
|Major|Shows the next maximum major release|
|Minor|Shows the next maximum minor release|
|Patch|Shows the next maximum patch release|
|Bump|Shows the maximum release within the given ranged version|
|Pre-release|Shows the next available pre-releases. Pre-releases are grouped by their tag name|