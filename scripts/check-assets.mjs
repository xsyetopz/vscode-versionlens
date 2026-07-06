#!/usr/bin/env bun

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const sourceRoot = "assets/versionlens";
const vscodeRoot = "packages/vscode-extension/images";
const offenders = [];

function files(root) {
	if (!fs.existsSync(root)) {
		return [];
	}
	const entries = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const entryPath = path.join(root, entry.name);
		if (entry.isDirectory()) {
			entries.push(...files(entryPath));
			continue;
		}
		if (entry.isFile()) {
			entries.push(path.relative(root, entryPath));
		}
	}
	return entries.sort();
}

function digest(filePath) {
	return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

if (!fs.existsSync(sourceRoot)) {
	offenders.push(`${sourceRoot} is missing`);
}
if (!fs.existsSync(vscodeRoot)) {
	offenders.push(`${vscodeRoot} is missing`);
}

const sourceFiles = files(sourceRoot);
const vscodeFiles = files(vscodeRoot);
if (JSON.stringify(sourceFiles) !== JSON.stringify(vscodeFiles)) {
	offenders.push(`${vscodeRoot} must mirror ${sourceRoot}`);
}

for (const file of sourceFiles) {
	const sourcePath = path.join(sourceRoot, file);
	const vscodePath = path.join(vscodeRoot, file);
	if (!fs.existsSync(vscodePath)) {
		continue;
	}
	if (digest(sourcePath) !== digest(vscodePath)) {
		offenders.push(`${vscodePath} differs from ${sourcePath}`);
	}
}

if (offenders.length > 0) {
	console.error(offenders.join("\n"));
	process.exit(1);
}
