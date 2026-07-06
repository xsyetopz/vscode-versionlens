#!/usr/bin/env python3

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
import sys

SOURCE_ROOTS = [Path("crates"), Path("packages/vscode-extension/src"), Path("tests")]
IGNORED_DIRS = {"dist", "node_modules", "target"}
MAX_FIELDS = 10
MAX_PARAMETERS = 5
CLI_DUPLICATE_MIN_TOKENS = 30

RUST_FUNCTION_PATTERN = re.compile(r"(?:^|\n)\s*(pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(")
TS_FUNCTION_PATTERN = re.compile(r"(?:^|\n)\s*(export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(")
TS_ARROW_PATTERN = re.compile(r"(?:^|\n)\s*(export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>")
RUST_STRUCT_PATTERN = re.compile(r"(?:^|\n)\s*(?:pub(?:\([^)]*\))?\s+)?struct\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{")
TS_INTERFACE_PATTERN = re.compile(r"(?:^|\n)\s*(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)[^{}]*\{")
TS_TYPE_OBJECT_PATTERN = re.compile(r"(?:^|\n)\s*(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=\s*\{")
RUST_FIELD_PATTERN = re.compile(r"^(?:pub(?:\([^)]*\))?\s+)?[A-Za-z_][A-Za-z0-9_]*\s*:")
TS_FIELD_PATTERN = re.compile(r"^(?:readonly\s+)?[A-Za-z_$][\w$]*\??\s*:")
RUST_PARAM_PATTERN = re.compile(r"^(?:mut\s+)?([A-Za-z_][A-Za-z0-9_]*|&self|&mut\s+self|self)\s*(?::\s*(.+))?$")
TS_PARAM_PATTERN = re.compile(r"^(?:\.\.\.)?([A-Za-z_$][\w$]*)\??\s*(?::\s*(.+?))?(?:\s*=.*)?$")
IDENTIFIER_PATTERN = re.compile(r"[A-Za-z_$][\w$]*")
STRING_PATTERN = re.compile(r'"(?:\\.|[^"])*"|\'(?:\\.|[^\'])*\'|`(?:\\.|[^`])*`')
NUMBER_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\b")
TOKEN_SPLIT_PATTERN = re.compile(r"[^A-Z]+")
COMPLEX_TYPE_PATTERN = re.compile(r"(?:[A-Za-z_][\w:.$]*\s*(?:<[^;{}()]+>|\[[^\]]+\])|(?:Vec|Option|Result|HashMap|BTreeMap|Array|Promise|Record|ReadonlyArray|Map|Set)\s*<[^;{}()]+>)")
COMMON_COMPLEX_TYPE_PATTERN = re.compile(r"^(?:Option<(?:String|&str|usize|bool)>|Vec<(?:String|&str)>|Array<string>|Promise<void>)$")
SIMPLE_OPTION_TYPE_PATTERN = re.compile(r"^Option<&?(?:lifetime |'static )?(?:str|Self|[A-Za-z_][\w:.$]*(?:<lifetime>)?)>$")
SIMPLE_RESULT_TYPE_PATTERN = re.compile(r"^Result<[A-Za-z_][\w:.$]*(?:<lifetime>)?,[A-Za-z_][\w:.$]*(?:<lifetime>)?>$")
TYPE_ALIAS_PATTERN = re.compile(r"(?:^|\n)\s*(?:(?:export|pub(?:\([^)]*\))?)\s+)?type\s+([A-Za-z_][\w]*)\s*(?:<[^=]+>)?\s*=")
CONCRETE_RUST_PATTERN = re.compile(r"(?:^|\n)\s*(?:pub(?:\([^)]*\))?\s+)?(?:struct|enum)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*<[^>{}]+>)?\s*[;{]")
CONCRETE_TS_PATTERN = re.compile(r"(?:^|\n)\s*(?:export\s+)?(?:interface|class)\s+([A-Za-z_$][\w$]*)")
PASS_THROUGH_RUST_PATTERN = re.compile(r"^(?:return\s+)?([A-Za-z_][\w:]*)\s*\([^{};]*\)\??$")
PASS_THROUGH_TS_PATTERN = re.compile(r"^return\s+([A-Za-z_$][\w$.]*)\s*\([^{};]*\)$")
UPPERCASE_START_PATTERN = re.compile(r"^[A-Z]")
RUST_USE_DECLARATION_PATTERN = re.compile(r"^(?:pub(?:\([^)]*\))?\s+)?use\s")
RUST_CRATE_TYPE_QUALIFICATION_PATTERN = re.compile(r"\bcrate::([A-Z][A-Za-z0-9_]*)\b")
RUST_CRATE_MODULE_CALL_PATTERN = re.compile(r"\bcrate::([a-z_][A-Za-z0-9_]*(?:::[A-Za-z_][A-Za-z0-9_]*)+)\s*\(")
RUST_STDLIB_CALL_PATTERN = re.compile(r"\bstd::([a-z_][A-Za-z0-9_]*(?:::[A-Za-z_][A-Za-z0-9_]*)+)\s*\(")


@dataclass
class SourceFile:
    path: str
    language: str
    source: str


@dataclass
class FunctionInfo:
    path: str
    language: str
    name: str
    is_public: bool
    start_line: int
    end_line: int
    is_test_only: bool
    parameters: list[tuple[str, str]]
    return_type: str
    body: str
    source: str


def line_number(source: str, index: int) -> int:
    return source[:index].count("\n") + 1


def is_quote(char: str, single_quote: bool = True) -> bool:
    return char == '"' or char == "`" or (single_quote and char == "'")


def rust_char_literal_end(source: str, start: int) -> int:
    if start >= len(source) or source[start] != "'":
        return -1
    if start + 1 < len(source) and source[start + 1] == "\\":
        return start + 3 if start + 3 < len(source) and source[start + 3] == "'" else -1
    return start + 2 if start + 2 < len(source) and source[start + 2] == "'" else -1


def matching_index(source: str, open_index: int, open_char: str, close_char: str, single_quote: bool = True) -> int:
    depth = 0
    quote = ""
    index = open_index
    while index < len(source):
        char = source[index]
        previous = source[index - 1] if index > 0 else ""
        if quote:
            if char == quote and previous != "\\":
                quote = ""
            index += 1
            continue
        if not single_quote and char == "'":
            char_end = rust_char_literal_end(source, index)
            if char_end > index:
                index = char_end + 1
                continue
        if is_quote(char, single_quote):
            quote = char
            index += 1
            continue
        if char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return -1


def split_top_level(source: str, separator: str, single_quote: bool = True) -> list[str]:
    parts: list[str] = []
    start = 0
    angle_depth = brace_depth = bracket_depth = paren_depth = 0
    quote = ""
    index = 0
    while index < len(source):
        char = source[index]
        previous = source[index - 1] if index > 0 else ""
        if quote:
            if char == quote and previous != "\\":
                quote = ""
            index += 1
            continue
        if not single_quote and char == "'":
            char_end = rust_char_literal_end(source, index)
            if char_end > index:
                index = char_end + 1
                continue
        if is_quote(char, single_quote):
            quote = char
            index += 1
            continue
        if char == "<":
            angle_depth += 1
        elif char == ">" and angle_depth > 0:
            angle_depth -= 1
        elif char == "{":
            brace_depth += 1
        elif char == "}" and brace_depth > 0:
            brace_depth -= 1
        elif char == "[":
            bracket_depth += 1
        elif char == "]" and bracket_depth > 0:
            bracket_depth -= 1
        elif char == "(":
            paren_depth += 1
        elif char == ")" and paren_depth > 0:
            paren_depth -= 1
        if char == separator and angle_depth == brace_depth == bracket_depth == paren_depth == 0:
            parts.append(source[start:index])
            start = index + 1
        index += 1
    parts.append(source[start:])
    return parts


def strip_comments(source: str) -> str:
    output: list[str] = []
    quote = ""
    block_comment = False
    line_comment = False
    index = 0
    while index < len(source):
        char = source[index]
        next_char = source[index + 1] if index + 1 < len(source) else ""
        previous = source[index - 1] if index > 0 else ""
        if line_comment:
            if char == "\n":
                line_comment = False
                output.append(char)
            index += 1
            continue
        if block_comment:
            if char == "\n":
                output.append(char)
            if char == "*" and next_char == "/":
                block_comment = False
                index += 2
                continue
            index += 1
            continue
        if quote:
            output.append(char)
            if char == quote and previous != "\\":
                quote = ""
            index += 1
            continue
        if char == "/" and next_char == "/":
            line_comment = True
            index += 2
            continue
        if char == "/" and next_char == "*":
            block_comment = True
            index += 2
            continue
        if is_quote(char):
            quote = char
        output.append(char)
        index += 1
    return "".join(output)


def has_cfg_test_attribute(source: str, index: int) -> bool:
    for line in reversed(source[:index].split("\n")):
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("#["):
            if "cfg(test)" in stripped:
                return True
            continue
        return False
    return False


def normalize_type(type_text: str) -> str:
    value = re.sub(r"\s+", " ", type_text).strip()
    value = re.sub(r"'[A-Za-z_][A-Za-z0-9_]*", "lifetime", value)
    value = re.sub(r"\s*([<>,[\]|&])\s*", r"\1", value)
    value = re.sub(r"\s+", " ", value)
    return value


def normalize_body(body: str) -> str:
    body = STRING_PATTERN.sub("STR", body)
    body = NUMBER_PATTERN.sub("NUM", body)
    body = IDENTIFIER_PATTERN.sub("ID", body)
    body = re.sub(r"\s+", "", body)
    return body.strip()


def token_count(normalized: str) -> int:
    return len([part for part in TOKEN_SPLIT_PATTERN.split(normalized) if part])


def parse_parameters(parameter_text: str, language: str) -> list[tuple[str, str]]:
    splittable = re.sub(r"'[A-Za-z_][A-Za-z0-9_]*", "lifetime", parameter_text) if language == "rust" else parameter_text
    params: list[tuple[str, str]] = []
    for parameter in split_top_level(splittable, ",", single_quote=language != "rust"):
        parameter = parameter.strip()
        if not parameter:
            continue
        if language == "rust":
            match = RUST_PARAM_PATTERN.match(parameter)
            params.append((match.group(1).replace("&mut self", "&mut self"), normalize_type(match.group(2) or "")) if match else (parameter, ""))
        else:
            match = TS_PARAM_PATTERN.match(parameter)
            params.append((match.group(1), normalize_type(match.group(2) or "")) if match else (parameter, ""))
    return params


def return_type_after(source: str, close_index: int, language: str) -> str:
    body_open = source.find("{", close_index)
    between = source[close_index + 1: body_open]
    if language == "rust":
        match = re.search(r"->\s*([^{}]+)$", between)
    else:
        match = re.search(r"^\s*:\s*([^={]+)$", between)
    return normalize_type(match.group(1)) if match else ""


def function_match_is_public(match_text: str, language: str) -> bool:
    trimmed = match_text.lstrip()
    if language == "rust":
        return trimmed.startswith(("pub ", "pub(", "pub(crate)", "pub(super)"))
    return trimmed.startswith("export ")


def extract_functions(file: SourceFile) -> list[FunctionInfo]:
    patterns = [RUST_FUNCTION_PATTERN] if file.language == "rust" else [TS_FUNCTION_PATTERN, TS_ARROW_PATTERN]
    functions: list[FunctionInfo] = []
    for pattern in patterns:
        for match in pattern.finditer(file.source):
            name = match.group(2)
            name_index = file.source.find(name, match.start())
            open_index = file.source.find("(", name_index + len(name))
            close_index = matching_index(file.source, open_index, "(", ")", single_quote=file.language != "rust")
            if open_index < 0 or close_index < 0:
                continue
            body_open = file.source.find("{", close_index)
            if body_open < 0:
                continue
            body_close = matching_index(file.source, body_open, "{", "}", single_quote=file.language != "rust")
            if body_close < 0:
                continue
            functions.append(FunctionInfo(
                path=file.path,
                language=file.language,
                name=name,
                is_public=function_match_is_public(match.group(0), file.language),
                start_line=line_number(file.source, match.start()),
                end_line=line_number(file.source, body_close),
                is_test_only=has_cfg_test_attribute(file.source, match.start()),
                parameters=parse_parameters(file.source[open_index + 1:close_index], file.language),
                return_type=return_type_after(file.source, close_index, file.language),
                body=file.source[body_open + 1:body_close],
                source=file.source[match.start():body_close + 1],
            ))
    return sorted(functions, key=lambda item: item.start_line)


def extract_object_shapes(file: SourceFile) -> list[dict[str, object]]:
    patterns = [RUST_STRUCT_PATTERN] if file.language == "rust" else [TS_INTERFACE_PATTERN, TS_TYPE_OBJECT_PATTERN]
    shapes: list[dict[str, object]] = []
    for pattern in patterns:
        for match in pattern.finditer(file.source):
            open_index = file.source.find("{", match.start())
            close_index = matching_index(file.source, open_index, "{", "}", single_quote=file.language != "rust")
            if open_index < 0 or close_index < 0:
                continue
            body = strip_comments(file.source[open_index + 1:close_index])
            separator = "," if file.language == "rust" else ";"
            field_pattern = RUST_FIELD_PATTERN if file.language == "rust" else TS_FIELD_PATTERN
            fields = [field for field in (part.strip() for part in split_top_level(body, separator, single_quote=file.language != "rust")) if field and field_pattern.search(field)]
            shapes.append({
                "path": file.path,
                "name": match.group(1),
                "startLine": line_number(file.source, match.start()),
                "endLine": line_number(file.source, close_index),
                "fieldCount": len(fields),
            })
    return shapes


def is_test_path(path: str) -> bool:
    return "/tests/" in path or path.endswith("/tests.rs") or path.endswith(".test.ts")


def collect_type_names(files: list[SourceFile], pattern_for_file) -> dict[str, set[str]]:
    by_path: dict[str, set[str]] = {}
    for file in files:
        by_path[file.path] = {match.group(1) for match in pattern_for_file(file).finditer(file.source)}
    return by_path


def collect_aliased_type_names(files: list[SourceFile]) -> dict[str, set[str]]:
    by_path = collect_type_names(files, lambda _file: TYPE_ALIAS_PATTERN)
    all_names = set().union(*by_path.values()) if by_path else set()
    return {path: names | all_names for path, names in by_path.items()}


def collect_concrete_type_names(files: list[SourceFile]) -> dict[str, set[str]]:
    by_path = collect_type_names(files, lambda file: CONCRETE_RUST_PATTERN if file.language == "rust" else CONCRETE_TS_PATTERN)
    all_names = set().union(*by_path.values()) if by_path else set()
    return {path: names | all_names for path, names in by_path.items()}


def type_base_name(type_text: str) -> str:
    value = re.sub(r"^&(?:mut\s+)?", "", type_text)
    value = re.sub(r"<.*$", "", value)
    value = re.sub(r"\[.*$", "", value)
    return value


def is_named_type_reference(type_text: str, path: str, names_by_path: dict[str, set[str]]) -> bool:
    return type_base_name(type_text) in names_by_path.get(path, set())


def is_direct_named_type_reference(type_text: str, path: str, names_by_path: dict[str, set[str]]) -> bool:
    if not is_named_type_reference(type_text, path, names_by_path):
        return False
    normalized = normalize_type(type_text)
    base = type_base_name(normalized)
    return normalized == base or normalized.startswith(f"{base}<") or normalized.startswith(f"&{base}<") or normalized.startswith(f"&mut {base}<")


def collect_complex_types(functions: list[FunctionInfo], files: list[SourceFile]) -> list[dict[str, object]]:
    aliases = collect_aliased_type_names(files)
    concrete = collect_concrete_type_names(files)
    by_type: dict[str, list[dict[str, object]]] = {}
    for fn in functions:
        values = [(type_text, f"parameter {name}") for name, type_text in fn.parameters] + [(fn.return_type, "return")]
        for type_text, role in values:
            if not type_text or not COMPLEX_TYPE_PATTERN.search(type_text):
                continue
            normalized = normalize_type(type_text)
            if is_named_type_reference(normalized, fn.path, aliases):
                continue
            if is_direct_named_type_reference(normalized, fn.path, concrete):
                continue
            if COMMON_COMPLEX_TYPE_PATTERN.search(normalized) or SIMPLE_OPTION_TYPE_PATTERN.search(normalized) or SIMPLE_RESULT_TYPE_PATTERN.search(normalized):
                continue
            if fn.is_public:
                continue
            key = f"{fn.path}:{normalized}"
            by_type.setdefault(key, []).append({"path": fn.path, "line": fn.start_line, "owner": fn.name, "role": role})
    result = []
    for key, locations in by_type.items():
        if len(locations) > 1:
            result.append({"typeText": key.split(":", 1)[1], "count": len(locations), "locations": locations})
    return sorted(result, key=lambda item: (-int(item["count"]), str(item["typeText"])))


def collect_duplicate_logic(functions: list[FunctionInfo]) -> list[dict[str, object]]:
    by_body: dict[str, list[FunctionInfo]] = {}
    for fn in functions:
        if is_test_path(fn.path) or fn.is_test_only:
            continue
        normalized = normalize_body(strip_comments(fn.body))
        if token_count(normalized) < CLI_DUPLICATE_MIN_TOKENS:
            continue
        by_body.setdefault(normalized, []).append(fn)
    duplicates: list[dict[str, object]] = []
    for matches in by_body.values():
        if len(matches) < 2:
            continue
        for i, first in enumerate(matches):
            for second in matches[i + 1:]:
                duplicates.append({
                    "firstPath": first.path, "firstName": first.name, "firstStartLine": first.start_line, "firstEndLine": first.end_line,
                    "secondPath": second.path, "secondName": second.name, "secondStartLine": second.start_line, "secondEndLine": second.end_line,
                    "similarity": 1.0,
                })
    return duplicates


def collect_suppressed_and_unused(functions: list[FunctionInfo]) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    suppressed: list[dict[str, object]] = []
    unused: list[dict[str, object]] = []
    for fn in functions:
        body = strip_comments(fn.body)
        for name, _type_text in fn.parameters:
            if not name or name in {"self", "&self", "&mut self"}:
                continue
            if name.startswith("_") and name != "_":
                suppressed.append({"path": fn.path, "line": fn.start_line, "functionName": fn.name, "parameterName": name})
            usable = re.sub(r"^_+", "", name)
            if usable and not re.search(rf"\b{re.escape(usable)}\b", body):
                unused.append({"path": fn.path, "line": fn.start_line, "functionName": fn.name, "parameterName": name})
    return suppressed, unused


def is_single_call_body(body: str, callee: str) -> bool:
    call_start = body.find(f"{callee}(")
    if call_start < 0:
        return False
    open_index = call_start + len(callee)
    close_index = matching_index(body, open_index, "(", ")", single_quote=False)
    if close_index < 0:
        return False
    tail = body[close_index + 1:].strip()
    return tail in {"", "?"}


def collect_pass_through(functions: list[FunctionInfo]) -> list[dict[str, object]]:
    wrappers: list[dict[str, object]] = []
    for fn in functions:
        if is_test_path(fn.path) or fn.is_test_only:
            continue
        body = strip_comments(fn.body).strip().rstrip(";").strip()
        match = PASS_THROUGH_RUST_PATTERN.match(body) if fn.language == "rust" else PASS_THROUGH_TS_PATTERN.match(body)
        if not match:
            continue
        callee = match.group(1)
        if UPPERCASE_START_PATTERN.search(callee) or not is_single_call_body(body, callee) or fn.is_public:
            continue
        wrappers.append({"path": fn.path, "line": fn.start_line, "name": fn.name, "callee": callee})
    return wrappers


def collect_overqualified(files: list[SourceFile]) -> list[dict[str, object]]:
    findings: list[dict[str, object]] = []
    for file in files:
        if file.language != "rust" or is_test_path(file.path):
            continue
        for line_index, line in enumerate(strip_comments(file.source).split("\n"), start=1):
            if RUST_USE_DECLARATION_PATTERN.search(line.lstrip()):
                continue
            for match in RUST_CRATE_TYPE_QUALIFICATION_PATTERN.finditer(line):
                findings.append({"path": file.path, "line": line_index, "kind": "crate-type", "qualified": match.group(0), "suggested": match.group(1)})
            for match in RUST_CRATE_MODULE_CALL_PATTERN.finditer(line):
                parts = match.group(1).split("::")
                findings.append({"path": file.path, "line": line_index, "kind": "crate-module-call", "qualified": match.group(0).strip().removesuffix("("), "suggested": f"{parts[0]}::{parts[-1]}()"})
            for match in RUST_STDLIB_CALL_PATTERN.finditer(line):
                findings.append({"path": file.path, "line": line_index, "kind": "std-module-call", "qualified": match.group(0).strip().removesuffix("("), "suggested": f"{match.group(1)}()"})
    return findings


def walk(root: Path) -> list[SourceFile]:
    if not root.exists():
        return []
    files: list[SourceFile] = []
    for entry in root.iterdir():
        if entry.name in IGNORED_DIRS:
            continue
        if entry.is_dir():
            files.extend(walk(entry))
        elif entry.suffix in {".rs", ".ts"}:
            files.append(SourceFile(entry.as_posix(), "rust" if entry.suffix == ".rs" else "typescript", entry.read_text().replace("\r\n", "\n")))
    return files


def analyze(files: list[SourceFile]) -> dict[str, list[dict[str, object]]]:
    functions = [fn for file in files for fn in extract_functions(file)]
    shapes = [shape for file in files for shape in extract_object_shapes(file)]
    suppressed, unused = collect_suppressed_and_unused(functions)
    return {
        "duplicateLogic": collect_duplicate_logic(functions),
        "repeatedComplexTypes": collect_complex_types(functions, files),
        "oversizedShapes": [shape for shape in shapes if int(shape["fieldCount"]) > MAX_FIELDS],
        "oversizedFunctions": [{"path": fn.path, "line": fn.start_line, "name": fn.name, "parameterCount": len(fn.parameters)} for fn in functions if len(fn.parameters) > MAX_PARAMETERS],
        "unusedParameters": unused,
        "suppressedParameters": suppressed,
        "passThroughWrappers": collect_pass_through(functions),
        "overqualifiedPaths": collect_overqualified(files),
    }


def print_findings(result: dict[str, list[dict[str, object]]]) -> None:
    if result["duplicateLogic"]:
        print("duplicate logic", file=sys.stderr)
        for item in result["duplicateLogic"]:
            print(f"- {item['firstPath']}:{item['firstStartLine']}-{item['firstEndLine']} {item['firstName']}", file=sys.stderr)
            print(f"  {item['secondPath']}:{item['secondStartLine']}-{item['secondEndLine']} {item['secondName']}", file=sys.stderr)
            print(f"  similarity={float(item['similarity']):.2f}", file=sys.stderr)
    if result["repeatedComplexTypes"]:
        print("repeated complex types", file=sys.stderr)
        for item in result["repeatedComplexTypes"]:
            print(f"- {item['typeText']} count={item['count']}", file=sys.stderr)
    if result["oversizedShapes"] or result["oversizedFunctions"]:
        print("oversized shapes", file=sys.stderr)
        for item in result["oversizedShapes"]:
            print(f"- {item['path']}:{item['startLine']}-{item['endLine']} {item['name']} fields={item['fieldCount']}", file=sys.stderr)
        for item in result["oversizedFunctions"]:
            print(f"- {item['path']}:{item['line']} {item['name']} parameters={item['parameterCount']}", file=sys.stderr)
    if result["unusedParameters"]:
        print("unused parameters", file=sys.stderr)
        for item in result["unusedParameters"]:
            print(f"- {item['path']}:{item['line']} {item['functionName']} parameter={item['parameterName']}", file=sys.stderr)
    if result["suppressedParameters"]:
        print("suppressed parameters", file=sys.stderr)
        for item in result["suppressedParameters"]:
            print(f"- {item['path']}:{item['line']} {item['functionName']} parameter={item['parameterName']}", file=sys.stderr)
    if result["passThroughWrappers"]:
        print("pass-through wrappers", file=sys.stderr)
        for item in result["passThroughWrappers"]:
            print(f"- {item['path']}:{item['line']} {item['name']} -> {item['callee']}", file=sys.stderr)
    if result["overqualifiedPaths"]:
        print("overqualified paths", file=sys.stderr)
        for item in result["overqualifiedPaths"]:
            print(f"- {item['path']}:{item['line']} {item['kind']} {item['qualified']} -> {item['suggested']}", file=sys.stderr)


def main() -> int:
    files = [file for root in SOURCE_ROOTS for file in walk(root)]
    if not files:
        print("no source files checked", file=sys.stderr)
        return 1
    result = analyze(files)
    if any(result.values()):
        print_findings(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
