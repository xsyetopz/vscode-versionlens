# Development Guide

This document provides instructions for setting up the development environment, building the extension, running tests, and debugging.

## Prerequisites

*   **Node.js:** version 22 or higher is recommended.
*   **npm:** version 10 or higher.
*   **Visual Studio Code:** for running and debugging the extension.

## Setup

1.  Clone the repository:
    ```bash
    git clone https://gitlab.com/versionlens/vscode-versionlens.git
    cd vscode-versionlens
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Task Runner

VersionLens uses `js-build-tasks` for managing development tasks. You can run these tasks using `npx task <task>` or by installing the `task` package globally:

```bash
npm install -g js-build-tasks # (optional)
```

*Note: `npm run [script]` typically maps to `task [script]` e.g. `npm test, npm run compile`*

## Building

The project uses TypeScript and esbuild.

*   **Compile:** Compiles the source code using `tsc`.
    ```bash
    task compile
    ```
*   **Bundle:** Bundles the extension into `./dist` using `esbuild`.
    ```bash
    task bundle
    ```
*   **Clean:** Removes the `./dist` folder.
    ```bash
    task clean
    ```

## Running & Debugging

Open the project in VS Code and use the **Run and Debug** view (`Ctrl+Shift+D`).

Available configurations:
*   **Debug unit tests:** Runs unit tests in Node.js.
*   **Debug smoke workspace:** Launches a new VS Code window with the smoke test workspace.
*   **Debug smoke file:** Launches a new VS Code window with a specific typical `package.json` file.
*   **Debug esbuild:** Runs the bundling process in debug mode.

## Testing

### Smoke Tests (Interactive)
Smoke tests are interactive tests that run within a new VS Code instance. They **cannot** be run from the terminal and must be launched using the **Run and Debug** view (`Ctrl+Shift+D`) in VS Code.

*   **Debug smoke workspace:** Launches VS Code with the `test/smoke` folder open.
*   **Debug smoke file:** Launches VS Code with a specific `package.json` file open.

These tests allow you to manually verify the version lenses and UI interactions in a real editor environment.

### Unit Tests
Unit tests are located in `test/unit` and run in a headless environment. They can be run from the terminal:
```bash
task test
```

### Code Coverage
To generate a coverage report:
```bash
task coverage
```
The report will be available in the `.coverage` folder.

## Project Structure

*   **`src/domain`**: Contains the core logic, package providers, and ecosystem-agnostic code.
*   **`src/extension`**: Contains VS Code-specific implementations, commands, and UI logic.
*   **`test/unit`**: Unit tests for domain and extension logic.
*   **`test/smoke`**: Sample projects used for manual and automated smoke testing.
*   **`build`**: Build scripts and Dockerfiles.

## CI/CD

The project uses GitLab CI for continuous integration. The configuration is defined in `.gitlab-ci.yml` and `./build/build.gitlab-ci.yml`.
