#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";

const roots = ["crates"];
const ignoredDirs = new Set(["target"]);
const allowedManualTraitImpls = new Set([
	"crates/versionlens-napi/src/api.rs:Task",
	"crates/versionlens-http/src/config.rs:From<HttpConfigInput>",
	"crates/versionlens-napi/src/model/config/suggestions.rs:From<NativeSuggestionIndicators>",
	"crates/versionlens-napi/src/model/config/providers/settings.rs:From<NativeProviderSettings>",
	"crates/versionlens-napi/src/model/config/http.rs:From<NativeHttpConfig>",
	"crates/versionlens-napi/src/model/output/text_edit.rs:From<TextEdit>",
	"crates/versionlens-napi/src/model/output/resolve.rs:Default",
	"crates/versionlens-napi/src/model/output/resolve.rs:From<ResolveDocumentOutput>",
	"crates/versionlens-napi/src/model/output/resolve.rs:From<AuthorizationRequestPayload>",
	"crates/versionlens-napi/src/model/output/suggestion.rs:From<SuggestionPayload>",
	"crates/versionlens-napi/src/model/output/status.rs:Default",
	"crates/versionlens-napi/src/model/output/status.rs:From<StatusPayload>",
	"crates/versionlens-napi/src/model/output/analyze.rs:Default",
	"crates/versionlens-napi/src/model/output/analyze.rs:From<AnalyzeDocumentOutput>",
	"crates/versionlens-napi/src/model/output/dependency.rs:From<DependencyPayload>",
	"crates/versionlens-napi/src/model/output/diagnostic.rs:From<DiagnosticPayload>",
	"crates/versionlens-napi/src/model/output/codelens.rs:From<CodeLensPayload>",
	"crates/versionlens-napi/src/model/position.rs:From<Position>",
	"crates/versionlens-core/src/config/session.rs:From<SessionConfigInput>",
	"crates/versionlens-core/src/config/session.rs:From<ProviderSettingsInput>",
	"crates/versionlens-core/src/config/session.rs:From<SuggestionIndicatorsInput>",
	"crates/versionlens-core/src/config/providers.rs:TryFrom<RegistryUrlConfigInput>",
	"crates/versionlens-core/src/config/providers.rs:TryFrom<PrereleaseTagConfigInput>",
	"crates/versionlens-core/src/config/providers.rs:TryFrom<ProviderHttpConfigInput>",
	"crates/versionlens-core/src/config/providers.rs:TryFrom<DependencyPropertyConfigInput>",
	"crates/versionlens-core/src/config/providers.rs:TryFrom<FilePatternConfigInput>",
]);
const allowedProductionCallSites = new Set([
	"crates/versionlens-http/src/client/agent.rs:31:production .cloned() call",
	"crates/versionlens-http/src/client/agent.rs:40:production .clone() call",
	"crates/versionlens-napi/src/support.rs:15:production .clone() call",
	"crates/versionlens-core/src/support.rs:64:production .clone() call",
	"crates/versionlens-versions/src/support.rs:11:production .expect() call",
	"crates/versionlens-versions/src/support.rs:15:production .expect() call",
]);
const productionForbiddenPatterns = [
	{ name: "production .clone() call", pattern: /\.clone\s*\(/g },
	{ name: "production .cloned() call", pattern: /\.cloned\s*\(/g },
	{ name: "production .unwrap() call", pattern: /\.unwrap\s*\(/g },
	{ name: "production .expect() call", pattern: /\.expect\s*\(/g },
	{ name: "production panic! macro", pattern: /\bpanic\s*!/g },
	{ name: "production std::panic use", pattern: /\bstd::panic::/g },
	{ name: "production todo! macro", pattern: /\btodo\s*!/g },
	{ name: "production unimplemented! macro", pattern: /\bunimplemented\s*!/g },
	{ name: "production dbg! macro", pattern: /\bdbg\s*!/g },
	{ name: "production println! macro", pattern: /\bprintln\s*!/g },
	{ name: "production eprintln! macro", pattern: /\beprintln\s*!/g },
	{
		name: "manual trait implementation",
		pattern:
			/^\s*impl(?:\s*<[^>{}]*>)?\s+(?:unsafe\s+)?(?<trait>[A-Za-z_][\w:<>]*)(?:\s*<[^>{}]*>)?\s+for\s+/gm,
	},
];
const allRustForbiddenPatterns = [
	{
		name: "user-defined Rust macro",
		pattern: /macro_rules!|#\s*\[\s*macro_export\s*\]/g,
	},
];
const offenders = [];
let checked = 0;

function isTestFile(filePath) {
	const parts = filePath.split(path.sep);
	const fileName = parts.at(-1) ?? "";
	return (
		parts.includes("tests") ||
		fileName === "tests.rs" ||
		fileName.endsWith("_tests.rs")
	);
}

function lineNumber(source, index) {
	return source.slice(0, index).split("\n").length;
}

function recordMatches(filePath, source, patterns) {
	for (const { name, pattern } of patterns) {
		for (const match of source.matchAll(pattern)) {
			const line = lineNumber(source, match.index);
			if (
				name === "manual trait implementation" &&
				allowedManualTraitImpls.has(`${filePath}:${match.groups?.trait ?? ""}`)
			) {
				continue;
			}
			if (allowedProductionCallSites.has(`${filePath}:${line}:${name}`)) {
				continue;
			}
			offenders.push({ filePath, line, name });
		}
	}
}

function walk(dir) {
	if (!fs.existsSync(dir)) {
		return;
	}

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (ignoredDirs.has(entry.name)) {
			continue;
		}

		const filePath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(filePath);
			continue;
		}

		if (path.extname(entry.name) !== ".rs") {
			continue;
		}

		checked += 1;
		const source = fs.readFileSync(filePath, "utf8");
		recordMatches(filePath, source, allRustForbiddenPatterns);
		if (!isTestFile(filePath)) {
			recordMatches(filePath, source, productionForbiddenPatterns);
		}
	}
}

for (const root of roots) {
	walk(root);
}

if (checked === 0) {
	console.error("no Rust files checked");
	process.exit(1);
}

if (offenders.length > 0) {
	for (const offender of offenders) {
		console.error(`${offender.filePath}:${offender.line} has ${offender.name}`);
	}
	process.exit(1);
}
