#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";

const workspacePackageFields = [
	"edition",
	"rust-version",
	"license",
	"repository",
	"keywords",
	"categories",
	"version",
];
const WORKSPACE_MEMBERS_PATTERN = /members\s*=\s*\[([\s\S]*?)\]/u;
const QUOTED_VALUE_PATTERN = /"([^"]+)"/g;
const offenders = [];

function childDirs(dir) {
	if (!fs.existsSync(dir)) {
		return [];
	}

	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

function sameList(actual, expected) {
	return (
		actual.length === expected.length &&
		actual.every((value, index) => value === expected[index])
	);
}

function expectList(label, actual, expected) {
	if (!sameList(actual, expected)) {
		offenders.push(
			`${label}: expected ${expected.join(", ")}, got ${actual.join(", ")}`,
		);
	}
}

function manifestSection(source, name) {
	const start = source.indexOf(`[${name}]`);
	if (start < 0) {
		return "";
	}

	const next = source.indexOf("\n[", start + 1);
	return next < 0 ? source.slice(start) : source.slice(start, next);
}

function workspaceMembers(cargoToml) {
	return (
		cargoToml
			.match(WORKSPACE_MEMBERS_PATTERN)?.[1]
			.match(QUOTED_VALUE_PATTERN)
			?.map((member) => member.slice(1, -1))
			.sort() ?? []
	);
}

function internalWorkspaceDependencies(source) {
	return [
		...manifestSection(source, "dependencies").matchAll(
			/^(versionlens-[\w-]+)\.workspace\s*=\s*true$/gmu,
		),
	]
		.map((match) => match[1])
		.sort();
}

if (!fs.existsSync("crates")) {
	offenders.push("crates/ is missing");
}
if (!fs.existsSync("packages")) {
	offenders.push("packages/ is missing");
}
if (fs.existsSync("src")) {
	offenders.push(
		"root src/ exists; product source must stay split under crates/ and packages/",
	);
}
if (fs.existsSync("_archive")) {
	offenders.push(
		"root _archive/ exists; do not reintroduce archived source trees",
	);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
expectList("package.json workspaces", packageJson.workspaces ?? [], [
	"packages/*",
]);

const cargoToml = fs.readFileSync("Cargo.toml", "utf8");
const members = workspaceMembers(cargoToml);
const memberSet = new Set(members);
const crateDirs = childDirs("crates");
const crateMemberNames = members
	.filter((member) => member.startsWith("crates/"))
	.map((member) => path.basename(member))
	.sort();
const crateDirSet = new Set(crateDirs);

for (const member of members) {
	if (!member.startsWith("crates/")) {
		offenders.push(
			`Cargo.toml workspace member ${member} must live under crates/`,
		);
		continue;
	}
	if (!fs.existsSync(path.join(member, "Cargo.toml"))) {
		offenders.push(
			`Cargo.toml workspace member ${member} is missing Cargo.toml`,
		);
	}
}

for (const crateName of crateDirs) {
	const manifestPath = `crates/${crateName}/Cargo.toml`;
	if (!fs.existsSync(manifestPath)) {
		offenders.push(`crates/${crateName} is missing Cargo.toml`);
		continue;
	}
	if (!memberSet.has(`crates/${crateName}`)) {
		offenders.push(
			`crates/${crateName} must be listed in Cargo.toml workspace members`,
		);
	}
}

for (const crateName of crateMemberNames) {
	if (!crateDirSet.has(crateName)) {
		continue;
	}

	const manifestPath = `crates/${crateName}/Cargo.toml`;
	const manifest = fs.readFileSync(manifestPath, "utf8");
	if (!new RegExp(`^name\\s*=\\s*"${crateName}"$`, "mu").test(manifest)) {
		offenders.push(`${manifestPath} package name must match its directory`);
	}

	for (const field of workspacePackageFields) {
		if (
			!new RegExp(`^${field}\\.workspace\\s*=\\s*true$`, "mu").test(manifest)
		) {
			offenders.push(`${manifestPath} must inherit package.${field}`);
		}
	}

	const readmePath = manifest.match(/^readme\s*=\s*"([^"]+)"$/mu)?.[1];
	if (
		readmePath &&
		!fs.existsSync(path.join("crates", crateName, readmePath))
	) {
		offenders.push(`${manifestPath} declares missing readme ${readmePath}`);
	}

	if (!/^\[lints\]\s*\nworkspace\s*=\s*true$/mu.test(manifest)) {
		offenders.push(`${manifestPath} must inherit workspace lints`);
	}

	for (const dependency of internalWorkspaceDependencies(manifest)) {
		if (!memberSet.has(`crates/${dependency}`)) {
			offenders.push(
				`${manifestPath} depends on unknown workspace crate ${dependency}`,
			);
		}
	}
}

if (offenders.length > 0) {
	console.error(offenders.join("\n"));
	process.exit(1);
}
