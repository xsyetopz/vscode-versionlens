# Authorization

## Contents

- [Automatically authenticating packages](#automatically-authenticating-packages)
- [Package registries that do not emit 401](#package-registries-that-do-not-emit-a-401-status-code)
- [Clearing authentication data](#clearing-url-authentication-data)
- [How your data is stored](#how-your-data-is-stored)

## Automatically authenticating packages

By default, when versionlens detects a 401 status code it will prompt you for authentication credentials.

> **NOTE**
>
> - Interactive authorization isn't available for Npm registries because npm uses `@npmcli/config` with npmrc files to authorize requests.
> However it can be used with `github:` prefixed packages.
> - Be aware that the github api does not emit 401 status codes for private packages. See [Package registries that do not emit a 401 status code](#package-registries-that-do-not-emit-a-401-status-code) for setting up private packages with the github api.

- **Step 1: Confirm the authorization url**

  This url is used to match package request urls and provide them with your credentials.

  Authorization urls must:
    - be in the same domain as the package request url
    - partially match the package request url e.g. `packageRequestUrl.startsWith(authorizationUrl)`

  The default value is the domain host of the package request url.

  > **NOTE**
  >
  > - The default value should work fine in a lot of cases but you will need to override this value if you need to use a registry provider that hosts multiple registries on the same domain e.g. gitlab
  >
  >   example:
  >   ```js
  >   // package request url
  >   'https://gitlab.com/api/v4/projects/some-user/some-project-id/packages/nuget/download/some.package.name/index.json'
  >
  >   // authorization url (entered in this prompt step)
  >   'https://gitlab.com/api/v4/projects/some-user/some-project-id'
  >   ```

- **Step 2: Choose an authentication scheme**

  Supported schemes are
  - Basic Auth (username and password)
  - Custom (raw authentication header value e.g. `Bearer {YOUR_API_TOKEN}`)

- **Step 3: Enter your authentication credentials**

  Depending on the scheme you have choose you will be prompted for consent and your credentials e.g. username and password

## Package registries that do not emit a 401 status code

When a package registry doesn't emit a 401 status code you can add an authorization url manually by pressing `ctrl+p` then typing `VersionLens: Add url authentication`.

- **Step 1: Confirm the authorization url**

  This url is used to match package request urls and provide them with your credentials.

  Authorization urls must:
    - be in the same domain as the package request url
    - partially match the package request url e.g. `packageRequestUrl.startsWith(authorizationUrl)`

  >   example:
  >   ```js
  >   // package request url
  >   'https://api.github.com/repos/owner-or-org/some-repo/tags'
  >
  >   // authorization url (entered in this prompt step)
  >   'https://api.github.com/repos/owner-or-org/some-repo'
  >   ```

- **Step 2: Choose an authentication scheme**

  Supported schemes are
  - Basic Auth (username and password)
  - Custom (raw authentication header value e.g. `Bearer {YOUR_API_TOKEN}`)

- **Step 3: Enter your authentication credentials**

  Depending on the scheme you have choose you will be prompted for consent and your credentials e.g. username and password

## Clearing Url Authentication Data

To clear credentials

- Press `ctrl+p` then type `Remove url authentication`.

  ![alt text](../images/docs/authorization/remove-url-authentication-data.png)

- Choose the url(s) you want to clear and press `ok`

  > **NOTE**
  >
  > If you have a project\package file opened when running this command and one of the packages needs re-authorization with the same removed url then you will be prompted to re-enter authorization. (if you dismiss this prompt then the url will be re-added to the url authentication data and marked as unconsented)

## How your data is stored

  - Credentials are stored in the [ExtensionContext.secrets](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage) storage

  - Non-sensitive authentication info (per url) is stored in the [ExtensionContext.workspaceState](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage) storage (e.g. unique per workspace).<br> Use `versionlens.authorization.removeUrlAuthentication` to clear authentication info

### What workspace data is stored

```js
{
  url: string,
  scheme: string,
  protocol: string,
  label: string,
  status: string
}
```