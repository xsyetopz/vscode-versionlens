#!/usr/bin/env bun

import { chmodSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { arch, platform } from "node:process";

const executableName =
	platform === "win32" ? "versionlens-lsp.exe" : "versionlens-lsp";
const source = join("target", "release", executableName);
const packageRoot = join("packages", "zed-extension");
const bundledBinary = join(packageRoot, "bin", executableName);
const output = join(
	"dist",
	`versionlens-redux-zed-extension-${platform}-${arch}.tar.gz`,
);

mkdirSync(join(packageRoot, "bin"), { recursive: true });
mkdirSync("dist", { recursive: true });
copyFileSync(source, bundledBinary);
if (platform !== "win32") {
	chmodSync(bundledBinary, 0o755);
}

const result = Bun.spawnSync([
	"tar",
	"-czf",
	output,
	"-C",
	packageRoot,
	"Cargo.toml",
	"Cargo.lock",
	"extension.toml",
	"LICENSE",
	"README.md",
	"src",
	"bin",
]);
rmSync(join(packageRoot, "bin"), { force: true, recursive: true });
if (result.exitCode !== 0) {
	process.stderr.write(result.stderr);
	process.exit(result.exitCode);
}
console.log(`Packaged ${output}`);
