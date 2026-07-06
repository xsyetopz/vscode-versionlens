use super::{
    assert_latest, latest_version_for_requirement, latest_version_from_response,
    latest_version_from_response_with_prereleases, latest_version_with_tags, npm_build_versions,
    release_versions_from_response,
};
use versionlens_parsers::Ecosystem::{
    AnsibleGalaxy, Bazel, Cargo, CocoaPods, Conan, Cpan, Cpp, Cran, Deno, Docker, Dotnet, Go,
    Hackage, Hex, Julia, LuaRocks, Maven, Nim, Nix, Npm, Opam, Pub, Python, Ruby, Swift, Terraform,
    Vcpkg, Zig,
};

#[test]
#[expect(
    clippy::too_many_lines,
    reason = "table-driven manifest coverage stays readable as one scenario"
)]
fn reads_latest_versions_from_json_registry_responses() {
    for (ecosystem, package, body, expected) in [
        (
            Cargo,
            "serde",
            r#"{"crate":{"max_version":"1.0.228"}}"#,
            "1.0.228",
        ),
        (
            Cargo,
            "serde",
            r#"{"crate":{"max_version":"1.0.229"},"versions":[{"num":"1.0.229","yanked":true},{"num":"1.0.228","yanked":false}]}"#,
            "1.0.228",
        ),
        (
            Npm,
            "typescript",
            r#"{"dist-tags":{"latest":"6.0.3"}}"#,
            "6.0.3",
        ),
        (
            Npm,
            "octokit/core.js",
            r#"[{"name":"v2.5.0"},{"name":"v2.0.0"}]"#,
            "v2.5.0",
        ),
        (
            Npm,
            "owner/commit",
            r#"[{"sha":"abcdef1234567890"},{"sha":"1234567890abcdef"}]"#,
            "abcdef1",
        ),
        (Npm, "owner/short-commit", r#"[{"sha":"123"}]"#, "123"),
        (
            Deno,
            "@std/assert",
            r#"{"versions":{"1.0.0":{"yanked":true},"1.1.0":{},"1.2.0-rc.1":{},"1.0.3":{}}}"#,
            "1.1.0",
        ),
        (
            Deno,
            "@std/assert",
            r#"{"latest":"1.3.0","versions":{"1.2.0":{},"1.3.0":{}}}"#,
            "1.3.0",
        ),
        (
            Dotnet,
            "Newtonsoft.Json",
            r#"{"versions":["13.0.1","14.0.0-beta.1","13.0.3"]}"#,
            "13.0.3",
        ),
        (
            Docker,
            "node",
            r#"{"results":[{"name":"20","tag_status":"active","digest":"sha256-20"},{"name":"22-beta","tag_status":"active","digest":"sha256-22"},{"name":"18","tag_status":"inactive","digest":"sha256-18"}]}"#,
            "20",
        ),
        (Python, "flask", r#"{"info":{"version":"3.0.0"}}"#, "3.0.0"),
        (
            Python,
            "flask",
            r#"{"info":{"version":"3.1.0"},"releases":{"3.0.0":[{"yanked":false}],"3.1.0":[{"yanked":true}]}}"#,
            "3.0.0",
        ),
        (
            Pub,
            "http",
            r#"{"versions":[{"version":"1.0.0"},{"version":"1.2.0","retracted":true},{"version":"1.1.0"},{"version":"2.0.0-dev.1"}]}"#,
            "1.1.0",
        ),
        (
            Ruby,
            "rails",
            r#"[{"number":"8.0.0"},{"number":"8.1.0.beta1"},{"number":"8.0.4"}]"#,
            "8.0.4",
        ),
        (
            Ruby,
            "rspec/rspec-rails",
            r#"[{"name":"v6.1.0"},{"name":"v6.0.1"}]"#,
            "v6.1.0",
        ),
        (
            Ruby,
            "rspec/rspec-core",
            r#"[{"sha":"abcdef1234567890"},{"sha":"1234567890abcdef"}]"#,
            "abcdef1",
        ),
        (
            Vcpkg,
            "fmt",
            r#"{"versions":[{"version":"11.1.4","git-tree":"a"},{"version":"11.2.0-rc.1","git-tree":"b"},{"version":"10.2.1#1","git-tree":"c"}]}"#,
            "11.1.4",
        ),
        (
            Terraform,
            "hashicorp/aws",
            r#"{"versions":[{"version":"5.0.0"},{"version":"5.1.0-beta.1"},{"version":"4.67.0"}]}"#,
            "5.0.0",
        ),
        (
            AnsibleGalaxy,
            "community.general",
            r#"{"data":[{"version":"8.0.0-beta.1"},{"version":"7.5.0"}]}"#,
            "7.5.0",
        ),
        (
            Bazel,
            "rules_cc",
            r#"{"versions":["0.0.9","0.0.10-rc1","0.0.10"],"yanked_versions":{"0.0.10":"bad release"}}"#,
            "0.0.9",
        ),
        (
            Nix,
            "NixOS/nixpkgs",
            r#"[{"name":"nixos-24.05"},{"name":"nixos-unstable"},{"name":"23.11"}]"#,
            "24.05",
        ),
        (
            CocoaPods,
            "AFNetworking",
            r#"{"versions":[{"name":"4.0.1"},{"name":"4.0.0-beta.1"},{"name":"3.2.1"}]}"#,
            "4.0.1",
        ),
    ] {
        assert_latest(ecosystem, package, body, expected);
    }
}

#[test]
fn reads_latest_versions_from_normalized_github_commit_arrays() {
    for ecosystem in [Npm, Ruby] {
        assert_latest(
            ecosystem,
            "owner/string-commit",
            r#"["abcdef1234567890","1234567890abcdef"]"#,
            "abcdef1",
        );
    }
}

#[test]
fn github_tag_responses_ignore_non_semver_names() {
    for ecosystem in [Npm, Ruby] {
        assert_latest(
            ecosystem,
            "owner/repo",
            r#"[{"name":"release-5.6.8"},{"name":"v2.0.0"},{"name":"build-9.0.0"}]"#,
            "v2.0.0",
        );
    }
}

#[test]
fn cpp_github_tag_responses_use_json_before_xmake_text_fallback() {
    assert_latest(
        Cpp,
        "fmtlib/fmt",
        r#"[{"name":"11.1.4"},{"name":"11.2.0-rc.1"},{"name":"10.2.1"}]"#,
        "11.1.4",
    );
    assert_latest(
        Cpp,
        "openssl",
        r#"add_versions("3.0.0", "sha256") add_versions("3.1.0-beta", "sha256")"#,
        "3.0.0",
    );
}

#[test]
fn reads_ruby_versions_from_normalized_string_arrays() {
    assert_latest(Ruby, "rails", r#"["1.0.0","1.1.0","2.0.0-alpha"]"#, "1.1.0");
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Ruby,
            "rails",
            r#"["1.0.0","1.1.0","2.0.0-alpha"]"#,
            true,
        ),
        Some("2.0.0-alpha".to_owned())
    );
}

#[test]
fn reads_deno_versions_from_normalized_string_arrays() {
    assert_eq!(
        latest_version_from_response(
            Deno,
            "@std/assert",
            r#"["0.215.0","0.212.0","1.0.6","0.198.0","0.196.0","1.1.0-rc.2"]"#,
        ),
        Some("1.0.6".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Deno,
            "@std/assert",
            r#"["0.215.0","0.212.0","1.0.6","0.198.0","0.196.0","1.1.0-rc.2"]"#,
            true,
        ),
        Some("1.1.0-rc.2".to_owned())
    );
}

#[test]
fn reads_cargo_versions_from_normalized_string_arrays() {
    assert_eq!(
        latest_version_from_response(
            Cargo,
            "serde",
            r#"{"versions":["1.0.20","1.0.19","1.1.0-beta.1"]}"#,
        ),
        Some("1.0.20".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Cargo,
            "serde",
            r#"["1.0.20","1.0.19","1.1.0-beta.1"]"#,
            true,
        ),
        Some("1.1.0-beta.1".to_owned())
    );
}

#[test]
fn reads_hex_versions_from_package_releases() {
    assert_eq!(
        latest_version_from_response(
            Hex,
            "plug",
            r#"{"releases":[{"version":"1.20.2"},{"version":"1.21.0-rc.1"},{"version":"1.19.4"}]}"#,
        ),
        Some("1.20.2".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Hex,
            "plug",
            r#"{"releases":[{"version":"1.20.2"},{"version":"1.21.0-rc.1"},{"version":"1.19.4"}]}"#,
            true,
        ),
        Some("1.21.0-rc.1".to_owned())
    );
}

#[test]
fn ignores_malformed_hex_package_responses() {
    assert_eq!(
        latest_version_from_response(Hex, "plug", r#"{"releases": ["#),
        None
    );
    assert_eq!(
        latest_version_from_response(Hex, "plug", r#"{"package":"plug"}"#),
        None
    );
    assert!(release_versions_from_response(Hex, r#"{"releases": ["#).is_empty());
}

#[test]
fn extracts_hex_release_versions_for_update_choices() {
    assert_eq!(
        release_versions_from_response(
            Hex,
            r#"{"releases":[{"version":"1.20.2"},{"version":"1.21.0-rc.1"},{"version":"1.19.4"}]}"#,
        ),
        [
            "1.19.4".to_owned(),
            "1.20.2".to_owned(),
            "1.21.0-rc.1".to_owned()
        ]
    );
}

#[test]
fn reads_latest_opam_version_from_package_page() {
    assert_eq!(
        latest_version_from_response(Opam, "lwt", r#"<h2>lwt version</h2><p>6.1.2 (latest)</p>"#,),
        Some("6.1.2".to_owned())
    );
}

#[test]
fn reads_latest_hackage_version_from_package_versions() {
    assert_eq!(
        latest_version_from_response(
            Hackage,
            "aeson",
            r#"{"2.1.2.1":"normal","2.2.3.0":"normal","2.2.4.0":"deprecated","2.3.0.0-rc1":"normal"}"#,
        ),
        Some("2.2.3.0".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Hackage,
            "aeson",
            r#"{"2.1.2.1":"normal","2.2.3.0":"normal","2.3.0.0-rc1":"normal"}"#,
            true,
        ),
        Some("2.3.0.0-rc1".to_owned())
    );
}

#[test]
fn reads_latest_stackage_lts_snapshot_from_snapshot_index() {
    assert_eq!(
        latest_version_from_response(
            Hackage,
            "stackage-lts",
            r#"{"snapshots":[[["nightly-2026-07-03","Stackage Nightly 2026-07-03 (ghc-9.12.4)","2 days ago"]],[["lts-24.48","LTS Haskell 24.48 (ghc-9.10.3)","5 days ago"],["lts-24.49","LTS Haskell 24.49 (ghc-9.10.3)","a day ago"]]],"totalCount":3792}"#,
        ),
        Some("24.49".to_owned())
    );
}

#[test]
fn reads_latest_stackage_nightly_snapshot_from_snapshot_index() {
    assert_eq!(
        latest_version_from_response(
            Hackage,
            "stackage-nightly",
            r#"{"snapshots":[[["nightly-2026-07-02","Stackage Nightly 2026-07-02 (ghc-9.12.4)","3 days ago"]],[["nightly-2026-07-03","Stackage Nightly 2026-07-03 (ghc-9.12.4)","2 days ago"]],[["lts-24.49","LTS Haskell 24.49 (ghc-9.10.3)","a day ago"]]],"totalCount":3792}"#,
        ),
        Some("2026-07-03".to_owned())
    );
}

#[test]
fn reads_latest_conan_version_from_search_results() {
    assert_eq!(
        latest_version_from_response(
            Conan,
            "zlib",
            r#"{"results":["zlib/1.2.13","zlib/1.3.1","zlib/1.3.0#recipe"]}"#,
        ),
        Some("1.3.1".to_owned())
    );
}

#[test]
fn reads_latest_vcpkg_version_from_versions_database_entry() {
    assert_eq!(
        latest_version_from_response(
            Vcpkg,
            "fmt",
            r#"{"versions":[{"version":"11.1.4","git-tree":"a"},{"version":"11.2.0-rc.1","git-tree":"b"},{"version":"10.2.1#1","git-tree":"c"}]}"#,
        ),
        Some("11.1.4".to_owned())
    );
}

#[test]
fn reads_latest_swift_versions_from_registry_and_github_responses() {
    assert_eq!(
        latest_version_from_response(
            Swift,
            "mona.LinkedList",
            r#"{"releases":{"1.1.0":{"url":"https://packages.example.com/mona/LinkedList/1.1.0"},"1.2.0-beta.1":{"url":"https://packages.example.com/mona/LinkedList/1.2.0-beta.1"},"1.0.0":{"problem":{"status":410}}}}"#,
        ),
        Some("1.1.0".to_owned())
    );
    assert_eq!(
        latest_version_from_response(
            Swift,
            "apple/swift-nio",
            r#"[{"name":"2.66.0"},{"name":"2.67.0-alpha.1"},{"name":"2.65.0"}]"#,
        ),
        Some("2.66.0".to_owned())
    );
}

#[test]
fn reads_latest_zig_version_from_github_tags() {
    assert_eq!(
        latest_version_from_response(
            Zig,
            "ziglibs/known-folders",
            r#"[{"name":"0.8.0"},{"name":"0.9.0-dev.1"},{"name":"0.7.0"}]"#,
        ),
        Some("0.8.0".to_owned())
    );
}

#[test]
fn reads_latest_nim_version_from_package_list_or_github_tags() {
    assert_eq!(
        latest_version_from_response(
            Nim,
            "jester",
            r#"[{"name":"jester","url":"https://github.com/dom96/jester","versions":["0.5.0","0.6.0-rc.1","0.4.3"]},{"name":"other","versions":["9.0.0"]}]"#,
        ),
        Some("0.5.0".to_owned())
    );
    assert_eq!(
        latest_version_from_response(
            Nim,
            "user/pkg",
            r#"[{"name":"2.1.0"},{"name":"2.2.0-beta.1"},{"name":"2.0.0"}]"#,
        ),
        Some("2.1.0".to_owned())
    );
}

#[test]
fn reads_latest_luarocks_versions_from_manifest() {
    assert_eq!(
        latest_version_from_response(
            LuaRocks,
            "luasocket",
            r#"repository = {
   ["luasocket"] = {
      ["3.0.0-1"] = { { arch = "rockspec" } },
      ["3.1.0-1"] = { { arch = "src" } },
      ["3.2.0-rc1"] = { { arch = "src" } }
   },
   ["other"] = {
      ["9.0.0-1"] = { { arch = "src" } }
   }
}"#,
        ),
        Some("3.1.0-1".to_owned())
    );
}

#[test]
fn reads_latest_cpan_version_from_metacpan_download_url() {
    assert_eq!(
        latest_version_from_response(
            Cpan,
            "Plack",
            r#"{"status":"latest","version":"1.0054","download_url":"https://cpan.metacpan.org/authors/id/M/MI/MIYAGAWA/Plack-1.0054.tar.gz"}"#,
        ),
        Some("1.0054".to_owned())
    );
}

#[test]
fn reads_latest_cran_version_from_packages_index() {
    let body = "Package: cli\nVersion: 3.6.2\n\nPackage: dplyr\nVersion: 1.1.3\nDepends: R (>= 3.5.0)\n\nPackage: dplyr\nVersion: 1.1.4\n";
    assert_eq!(
        latest_version_from_response(Cran, "dplyr", body),
        Some("1.1.4".to_owned())
    );
    assert_eq!(
        release_versions_from_response(Cran, body),
        vec!["3.6.2".to_owned(), "1.1.3".to_owned(), "1.1.4".to_owned()]
    );
}

#[test]
fn reads_latest_julia_version_from_registry_versions_toml() {
    assert_eq!(
        latest_version_from_response(
            Julia,
            "Example",
            r#"[0.5.3]
git-tree-sha1 = "b4d4"

[0.5.4]
git-tree-sha1 = "c5e5"

[0.6.0-rc1]
git-tree-sha1 = "d6f6"
"#,
        ),
        Some("0.5.4".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Julia,
            "Example",
            r#"[0.5.4]
git-tree-sha1 = "c5e5"

[0.6.0-rc1]
git-tree-sha1 = "d6f6"
"#,
            true,
        ),
        Some("0.6.0-rc1".to_owned())
    );
}

#[test]
fn reads_go_versions_from_normalized_version_arrays() {
    assert_eq!(
        latest_version_from_response(
            Go,
            "go.uber.org/zap",
            r#"{"versions":["v0.32.3","v0.19.10","v0.26.0","v0.23.0-alpha.3"]}"#,
        ),
        Some("v0.32.3".to_owned())
    );
    assert_eq!(
        latest_version_from_response(
            Go,
            "github.com/docker/cli",
            r#"["v26.1.3+incompatible","v27.0.0+incompatible"]"#,
        ),
        Some("v27.0.0".to_owned())
    );
}

#[test]
fn reads_go_latest_version_from_proxy_info_object() {
    assert_eq!(
        latest_version_from_response(
            Go,
            "golang.org/x/mod",
            r#"{"Version":"v0.2.0","Time":"2020-01-02T17:33:45Z"}"#,
        ),
        Some("v0.2.0".to_owned())
    );
}

#[test]
fn go_module_proxy_versions_fall_back_to_highest_prerelease_when_no_release_exists() {
    assert_eq!(
        latest_version_from_response(
            Go,
            "example.com/mod",
            r#"{"versions":["v1.0.0-beta.1","v1.0.0-beta.2"]}"#,
        ),
        Some("v1.0.0-beta.2".to_owned())
    );
}

#[test]
fn go_module_proxy_versions_fall_back_to_most_recent_pseudo_version_when_no_release_or_prerelease_exists()
 {
    assert_eq!(
        latest_version_from_response(
            Go,
            "example.com/mod",
            r#"{"versions":["v1.2.4-0.20200101000000-aaaaaaaaaaaa","v1.2.3-0.20240202000000-bbbbbbbbbbbb"]}"#,
        ),
        Some("v1.2.3-0.20240202000000-bbbbbbbbbbbb".to_owned())
    );
}

#[test]
fn go_json_metadata_filters_retracted_and_deprecated_versions_when_available() {
    assert_eq!(
        latest_version_from_response(
            Go,
            "example.com/mod",
            r#"{"versions":[{"Version":"v1.0.0"},{"Version":"v1.1.0","Retracted":["bad release"]},{"Version":"v1.2.0-beta.1","Deprecated":"use example.com/mod/v2"}]}"#,
        ),
        Some("v1.0.0".to_owned())
    );
    assert_eq!(
        latest_version_from_response(
            Go,
            "example.com/mod",
            r#"{"versions":[{"Version":"v1.0.0"},{"Version":"v1.1.0","Deprecated":"use example.com/mod/v2"}]}"#,
        ),
        Some("v1.0.0".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Go,
            "example.com/mod",
            r#"[{"Version":"v1.0.0"},{"Version":"v1.1.0-beta.1","Retracted":[]},{"Version":"v1.2.0-beta.1","Retracted":null}]"#,
            true,
        ),
        Some("v1.0.0".to_owned())
    );
}

#[test]
fn reads_python_versions_from_normalized_string_arrays() {
    assert_eq!(
        latest_version_from_response(Python, "pip", r#"["25.0.1","25.0","24.3.1","24.3","24.2"]"#,),
        Some("25.0.1".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Python,
            "pip",
            r#"{"versions":["25.0.1","25.0","26.0.0rc1"]}"#,
            true,
        ),
        Some("26.0.0rc1".to_owned())
    );
}

#[test]
fn extracts_python_and_ruby_versions_for_update_choices() {
    assert_eq!(
        release_versions_from_response(Python, r#"{"versions":["24.3.1","25.0.0","26.0.0rc1"]}"#,),
        [
            "24.3.1".to_owned(),
            "25.0.0".to_owned(),
            "26.0.0-rc.1".to_owned()
        ]
    );
    assert_eq!(
        release_versions_from_response(Ruby, r#"["1.0.0","1.1.0-pre.1","1.0.1"]"#,),
        [
            "1.0.0".to_owned(),
            "1.0.1".to_owned(),
            "1.1.0-pre.1".to_owned()
        ]
    );
}

#[test]
fn reads_maven_versions_from_normalized_string_arrays() {
    assert_eq!(
        latest_version_from_response(
            Maven,
            "junit:junit",
            r#"["4.13-rc-1","4.13-rc-2","4.13","4.13.1","4.13.2"]"#,
        ),
        Some("4.13.2".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Maven,
            "junit:junit",
            r#"["4.13-rc-1","4.13-rc-2","4.13","4.13.1","4.13.2","4.14.0-rc.1"]"#,
            true,
        ),
        Some("4.14.0-rc.1".to_owned())
    );
}

#[test]
fn reads_maven_release_versions_for_update_choices() {
    assert_eq!(
        release_versions_from_response(
            Maven,
            r#"<metadata><versioning><versions><version>1.0.0</version><version>2.0.0-M1</version><version>1.0.1</version><version>ignored</version></versions></versioning></metadata>"#
        ),
        [
            "1.0.0".to_owned(),
            "1.0.1".to_owned(),
            "2.0.0-M1".to_owned()
        ]
    );
}

#[test]
fn reads_npm_release_versions_in_upstream_compare_build_order() {
    assert_eq!(
        release_versions_from_response(
            Npm,
            r#"{"versions":{"2.0.0":{},"1.0.0+build.10":{},"1.0.0+build.2":{},"1.0.0":{}}}"#,
        ),
        [
            "1.0.0".to_owned(),
            "1.0.0+build.2".to_owned(),
            "1.0.0+build.10".to_owned(),
            "2.0.0".to_owned()
        ]
    );
}

#[test]
fn reads_npm_versions_from_normalized_string_arrays() {
    assert_eq!(
        latest_version_from_response(
            Npm,
            "npm-package-arg",
            r#"{"dist-tags":{"latest":"7.0.0"},"versions":["6.0.0","6.1.0","7.0.0","8.0.0","8.0.1"]}"#,
        ),
        Some("7.0.0".to_owned())
    );
    assert_eq!(
        latest_version_from_response_with_prereleases(
            Npm,
            "pacote",
            r#"{"dist-tags":{"latest":"11.1.9"},"versions":["11.1.9","12.0.0-beta.1"]}"#,
            true,
        ),
        Some("11.1.9".to_owned())
    );
}

#[test]
fn reads_npm_build_versions_for_matching_release() {
    assert_eq!(
        npm_build_versions(
            r#"{"versions":{"1.0.0":{},"1.0.0+build.1":{},"1.0.0+build.2":{},"1.1.0+build.1":{}}}"#,
            "1.0.0+build.1",
        ),
        [
            "1.0.0".to_owned(),
            "1.0.0+build.1".to_owned(),
            "1.0.0+build.2".to_owned()
        ]
    );
}

#[test]
fn reads_npm_build_versions_from_normalized_string_arrays() {
    assert_eq!(
        npm_build_versions(
            r#"{"versions":["1.0.0","1.0.0+build.1","1.0.0+build.2","1.1.0+build.1"]}"#,
            "1.0.0+build.1",
        ),
        [
            "1.0.0".to_owned(),
            "1.0.0+build.1".to_owned(),
            "1.0.0+build.2".to_owned()
        ]
    );
}

include!("latest_more.rs");
