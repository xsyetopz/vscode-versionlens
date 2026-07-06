import { describe, expect, test } from "bun:test";

import { analyzeSources, formatFindings } from "./check-code-quality.mjs";

const rustConfig = `
struct BuildRequest {
	pub package_name: String,
	pub package_version: String,
	pub registry_url: String,
	pub source_path: String,
	pub target_path: String,
	pub checksum: String,
	pub cache_key: String,
	pub retry_count: usize,
	pub timeout_ms: u64,
	pub user_agent: String,
	pub auth_token: Option<String>,
}

fn fetch_one(package_name: String, versions: Vec<ResolvedDependency>) -> Result<Vec<ResolvedDependency>, FetchError> {
	provider.fetch(package_name, versions)
}

fn fetch_two(package_name: String, versions: Vec<ResolvedDependency>) -> Result<Vec<ResolvedDependency>, FetchError> {
	provider.fetch(package_name, versions)
}

fn pass_through(package_name: String) -> Result<String, FetchError> {
	fetch_name(package_name)
}

fn suppressed(_package_name: String, version: String) -> String {
	version
}
`;

const typeScriptConfig = `
interface ExtensionViewModel {
	name: string;
	version: string;
	ecosystem: string;
	current: string;
	latest: string;
	stable: string;
	wanted: string;
	range: string;
	registry: string;
	filePath: string;
	line: number;
}

function renderOne(packageName: string, versions: Array<ResolvedDependency>): Promise<Array<ResolvedDependency>> {
	return renderer.render(packageName, versions);
}

function renderTwo(packageName: string, versions: Array<ResolvedDependency>): Promise<Array<ResolvedDependency>> {
	return renderer.render(packageName, versions);
}

function adapter(packageName: string): string {
	return renderName(packageName);
}

function ignored(_packageName: string, version: string): string {
	return version;
}
`;

describe("check-code-quality", () => {
	test("reports requested repository quality shapes", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/lib.rs",
				language: "rust",
				source: rustConfig,
			},
			{
				path: "packages/vscode-extension/src/example.ts",
				language: "typescript",
				source: typeScriptConfig,
			},
		]);

		expect(result.duplicateLogic).toContainEqual(
			expect.objectContaining({
				firstPath: "crates/example/src/lib.rs",
				secondPath: "crates/example/src/lib.rs",
				firstName: "fetch_one",
				secondName: "fetch_two",
			}),
		);
		expect(result.repeatedComplexTypes).toContainEqual(
			expect.objectContaining({
				typeText: "Vec<ResolvedDependency>",
				count: 2,
			}),
		);
		expect(result.repeatedComplexTypes).toContainEqual(
			expect.objectContaining({
				typeText: "Array<ResolvedDependency>",
				count: 2,
			}),
		);
		expect(result.oversizedShapes).toContainEqual(
			expect.objectContaining({
				path: "crates/example/src/lib.rs",
				name: "BuildRequest",
				fieldCount: 11,
			}),
		);
		expect(result.oversizedShapes).toContainEqual(
			expect.objectContaining({
				path: "packages/vscode-extension/src/example.ts",
				name: "ExtensionViewModel",
				fieldCount: 11,
			}),
		);
		expect(result.suppressedParameters).toContainEqual(
			expect.objectContaining({
				path: "crates/example/src/lib.rs",
				functionName: "suppressed",
				parameterName: "_package_name",
			}),
		);
		expect(result.suppressedParameters).toContainEqual(
			expect.objectContaining({
				path: "packages/vscode-extension/src/example.ts",
				functionName: "ignored",
				parameterName: "_packageName",
			}),
		);
		expect(result.passThroughWrappers).toContainEqual(
			expect.objectContaining({
				path: "crates/example/src/lib.rs",
				name: "pass_through",
				callee: "fetch_name",
			}),
		);
		expect(result.passThroughWrappers).toContainEqual(
			expect.objectContaining({
				path: "packages/vscode-extension/src/example.ts",
				name: "adapter",
				callee: "renderName",
			}),
		);
	});

	test("parses multiline Rust parameters without body spillover", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/multiline.rs",
				language: "rust",
				source: `
fn collect_value(
    context: &JsonManifestContext<'_>,
    parents: &[&str],
    out: &mut Vec<Dependency>,
) {
    use_value(context, parents, out);
}

fn collect_other(
    context: &JsonManifestContext<'_>,
    parents: &[&str],
    out: &mut Vec<Dependency>,
) {
    use_value(context, parents, out);
}
`,
			},
		]);

		expect(result.repeatedComplexTypes).toContainEqual(
			expect.objectContaining({
				typeText: "&mut Vec<Dependency>",
				count: 2,
			}),
		);
		expect(result.unusedParameters).toEqual([]);
		expect(result.suppressedParameters).toEqual([]);
	});

	test("does not report repeated aliased complex type usages", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/aliased.rs",
				language: "rust",
				source: `
type XmlEvent<'a> = BytesStart<'a>;

fn read_one(event: &XmlEvent<'_>) {
    read_event(event);
}

fn read_two(event: &XmlEvent<'_>) {
    read_event(event);
}
`,
			},
		]);

		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({
				typeText: "&XmlEvent<lifetime>",
			}),
		);
	});

	test("does not report repeated aliased complex type usages declared in another file", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/request.rs",
				language: "rust",
				source: `
pub(super) type ResolutionRequest<'a> = Request<'a>;
`,
			},
			{
				path: "crates/example/src/parallel.rs",
				language: "rust",
				source: `
fn resolve_one(request: ResolutionRequest<'_>) {
    resolve(request);
}

fn resolve_two(request: ResolutionRequest<'_>) {
    resolve(request);
}
`,
			},
		]);

		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({
				typeText: "ResolutionRequest<lifetime>",
			}),
		);
	});

	test("does not report repeated direct local concrete type references", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/context.rs",
				language: "rust",
				source: `
struct EventContext<'a> {
    value: &'a str,
}

fn read_one(context: &EventContext<'_>, values: Vec<EventContext<'_>>) {
    read_context(context, values);
}

fn read_two(context: &EventContext<'_>, values: Vec<EventContext<'_>>) {
    read_context(context, values);
}
`,
			},
		]);

		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({
				typeText: "&EventContext<lifetime>",
			}),
		);
		expect(result.repeatedComplexTypes).toContainEqual(
			expect.objectContaining({
				typeText: "Vec<EventContext<lifetime>>",
				count: 2,
			}),
		);
		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({
				typeText: "EventContext<lifetime>",
			}),
		);
	});

	test("does not report direct concrete type references declared in another file", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/context.rs",
				language: "rust",
				source: `
pub(crate) struct SharedContext<'a> {
    value: &'a str,
}
`,
			},
			{
				path: "crates/example/src/state.rs",
				language: "rust",
				source: `
fn read_one(context: &SharedContext<'_>) {
    read_context(context);
}

fn read_two(context: &SharedContext<'_>) {
    read_context(context);
}
`,
			},
		]);

		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({
				typeText: "&SharedContext<lifetime>",
			}),
		);
	});

	test("ignores low-signal simple Option and Result wrappers in repository mode", () => {
		const result = analyzeSources(
			[
				{
					path: "crates/example/src/simple.rs",
					language: "rust",
					source: `
fn one(value: &str) -> Option<ManifestKind> {
    classify(value)
}

fn two(value: &str) -> Option<ManifestKind> {
    classify(value)
}

fn agent_one() -> Result<Agent, HttpError> {
    build_agent()
}

fn agent_two() -> Result<Agent, HttpError> {
    build_agent()
}

fn complex_one() -> Option<Vec<ManifestKind>> {
    classify_all()
}

fn complex_two() -> Option<Vec<ManifestKind>> {
    classify_all()
}
`,
				},
			],
			{ ignoreCommonComplexTypes: true },
		);

		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({ typeText: "Option<ManifestKind>" }),
		);
		expect(result.repeatedComplexTypes).not.toContainEqual(
			expect.objectContaining({ typeText: "Result<Agent,HttpError>" }),
		);
		expect(result.repeatedComplexTypes).toContainEqual(
			expect.objectContaining({
				typeText: "Option<Vec<ManifestKind>>",
				count: 2,
			}),
		);
	});

	test("treats Rust format string captures as parameter usage", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/format.rs",
				language: "rust",
				source: `
fn cache_key(provider: &str, package: &str) -> String {
    format!("{provider}:{package}")
}
`,
			},
		]);

		expect(result.unusedParameters).toEqual([]);
	});

	test("preserves string contents while stripping comments for usage checks", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/string_comments.rs",
				language: "rust",
				source: `
fn match_registry(entry: &Entry, url: &str) -> Option<usize> {
    auth_registry_match_len(entry.registry.strip_prefix("//")?, url)
}
`,
			},
		]);

		expect(result.unusedParameters).toEqual([]);
	});

	test("does not report enum and type constructors as pass-through function wrappers", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/constructors.rs",
				language: "rust",
				source: `
fn read_value(response: Response) -> Result<String, Error> {
    Ok(response.into_string()?)
}
`,
			},
		]);

		expect(result.passThroughWrappers).toEqual([]);
	});

	test("does not report chained expressions as pass-through wrappers", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/chained.rs",
				language: "rust",
				source: `
fn package_stanzas(text: &str) -> Vec<Stanza> {
    top_level_stanzas(text)
        .into_iter()
        .filter(|stanza| stanza.open > 0)
        .collect()
}
`,
			},
		]);

		expect(result.passThroughWrappers).toEqual([]);
	});

	test("parses TypeScript default parameters and ignores non-arrow const expressions", () => {
		const result = analyzeSources([
			{
				path: "packages/vscode-extension/src/example.ts",
				language: "typescript",
				source: `
function label(state: ExtensionState, document = vscode.window.activeTextEditor?.document) {
	return document ? render(state, document) : undefined;
}

async function runTask(label: string) {
	const task = (await vscode.tasks.fetchTasks()).find((item) => item.name === label);
	return task;
}
`,
			},
		]);

		expect(result.unusedParameters).toEqual([]);
	});

	test("parses Rust function bodies containing char literals", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/chars.rs",
				language: "rust",
				source: `
fn parse_source(text: &str, source: &str, source_offset: usize) -> Range {
    let tuple_end = source.find('}').map(|index| source_offset + index).unwrap_or(source.len());
    offset_range(text, source_offset, tuple_end)
}
`,
			},
		]);

		expect(result.unusedParameters).toEqual([]);
	});

	test("can ignore cfg-test-only Rust pass-through helpers", () => {
		const result = analyzeSources(
			[
				{
					path: "crates/example/src/lib.rs",
					language: "rust",
					source: `
#[cfg(test)]
fn helper(value: &Config) -> bool {
    cache_key(value)
}

fn adapter(value: &Config) -> bool {
    cache_key(value)
}
`,
				},
			],
			{ ignoreTestFilesForPassThrough: true },
		);

		expect(result.passThroughWrappers).toContainEqual(
			expect.objectContaining({ name: "adapter" }),
		);
		expect(result.passThroughWrappers).not.toContainEqual(
			expect.objectContaining({ name: "helper" }),
		);
	});

	test("can ignore public API type spellings and public adapter wrappers", () => {
		const result = analyzeSources(
			[
				{
					path: "crates/example/src/api.rs",
					language: "rust",
					source: `
pub fn parse_one(text: &str) -> Vec<Dependency> {
    parse_with_paths(text, &[])
}

pub(crate) fn parse_two(text: &str) -> Vec<Dependency> {
    parse_with_paths(text, &[])
}

fn private_one(text: &str) -> Vec<Dependency> {
    parse_with_paths(text, &[])
}

fn private_two(text: &str) -> Vec<Dependency> {
    parse_with_paths(text, &[])
}
`,
				},
			],
			{
				ignorePublicApiTypes: true,
				ignorePublicPassThroughWrappers: true,
			},
		);

		expect(result.repeatedComplexTypes).toContainEqual(
			expect.objectContaining({
				typeText: "Vec<Dependency>",
				count: 2,
			}),
		);
		expect(result.passThroughWrappers).not.toContainEqual(
			expect.objectContaining({ name: "parse_one" }),
		);
		expect(result.passThroughWrappers).not.toContainEqual(
			expect.objectContaining({ name: "parse_two" }),
		);
		expect(result.passThroughWrappers).toContainEqual(
			expect.objectContaining({ name: "private_one" }),
		);
	});

	test("formats paths, ranges, counts, and diffs", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/lib.rs",
				language: "rust",
				source: rustConfig,
			},
		]);

		const output = formatFindings(result, {
			diffCommand: "diff",
			color: false,
		});

		expect(output).toContain("duplicate logic");
		expect(output).toContain("crates/example/src/lib.rs:");
		expect(output).toContain("fetch_one");
		expect(output).toContain("fetch_two");
		expect(output).toContain("@@");
		expect(output).toContain("repeated complex types");
		expect(output).toContain("Vec<ResolvedDependency> count=2");
		expect(output).toContain("oversized shapes");
		expect(output).toContain("BuildRequest fields=11");
	});
	test("reports overqualified Rust crate and std paths", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/support.rs",
				language: "rust",
				source: `
use crate::MemoryCache;
use std::fs;

fn create() -> crate::MemoryCache<String> {
    crate::memory::memory_cache(std::time::Duration::from_secs(1))
}
`,
			},
		]);

		expect(result.overqualifiedPaths).toContainEqual(
			expect.objectContaining({
				path: "crates/example/src/support.rs",
				line: 5,
				kind: "crate-type",
				qualified: "crate::MemoryCache",
				suggested: "MemoryCache",
			}),
		);
		expect(result.overqualifiedPaths).toContainEqual(
			expect.objectContaining({
				path: "crates/example/src/support.rs",
				line: 6,
				kind: "crate-module-call",
				qualified: "crate::memory::memory_cache",
				suggested: "memory::memory_cache()",
			}),
		);
		expect(result.overqualifiedPaths).toContainEqual(
			expect.objectContaining({
				path: "crates/example/src/support.rs",
				line: 6,
				kind: "std-module-call",
				qualified: "std::time::Duration::from_secs",
				suggested: "time::Duration::from_secs()",
			}),
		);
	});

	test("does not report overqualified paths in Rust use declarations", () => {
		const result = analyzeSources([
			{
				path: "crates/example/src/lib.rs",
				language: "rust",
				source: `
use crate::MemoryCache;
pub use crate::ProviderSettings;
pub(crate) use crate::support::default;
`,
			},
		]);

		expect(result.overqualifiedPaths).toEqual([]);
	});
});
