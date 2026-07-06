use super::{ecosystem_config_namespace, ecosystem_for_manifest, ecosystem_from_config_name};
use crate::model::Ecosystem::{
    Cargo, Composer, Conan, Cpan, Cran, Deno, Docker, Dotnet, Dub, Go, Hackage, Haxelib, Hex,
    Julia, LuaRocks, Maven, Nim, Npm, Opam as OpamEcosystem, Pub, Python, Ruby, Swift, Vcpkg, Zig,
};
use crate::model::ManifestKind::{
    Cabal, CabalProject, CargoToml, ClojureDepsEdn, ComposerJson, ConanfilePy, ConanfileTxt,
    Cpanfile, DenoImportMapJson, DenoJson, DockerComposeYaml, Dockerfile, DotnetProjectJson,
    DotnetXml, DubJson, DubSdl, DuneProject, Gemfile, GleamToml, GoMod, GradleBuild,
    GradleSettings, GradleVersionCatalogToml, HaxelibJson, JsrJson, JuliaManifestToml,
    JuliaProjectToml, LeiningenProjectClj, LuaRockspec, MavenPomXml, MixExs, Nimble,
    NpmPackageJson, NpmPackageJson5, NpmPackageYaml, Opam, PaketDependencies, PaketReferences,
    PnpmYaml, PubspecOverridesYaml, PubspecYaml, PythonPipfile, PythonPyprojectToml,
    PythonRequirementsTxt, RDescription, RebarConfig, RenvLock, RubyGemspec, SbtBuild, StackYaml,
    SwiftPackage, Unknown, VcpkgJson, VersionLensMultiRegistries, ZigBuildZon,
};

#[test]
fn maps_config_names_and_legacy_names_to_ecosystems() {
    let cases = [
        ("cargo", Cargo),
        ("composer", Composer),
        ("deno", Deno),
        ("dotnet", Dotnet),
        ("docker", Docker),
        ("dub", Dub),
        ("go", Go),
        ("golang", Go),
        ("maven", Maven),
        ("hex", Hex),
        ("beam", Hex),
        ("opam", OpamEcosystem),
        ("ocaml", OpamEcosystem),
        ("hackage", Hackage),
        ("haskell", Hackage),
        ("julia", Julia),
        ("cran", Cran),
        ("r", Cran),
        ("conan", Conan),
        ("vcpkg", Vcpkg),
        ("swift", Swift),
        ("zig", Zig),
        ("nim", Nim),
        ("luarocks", LuaRocks),
        ("lua", LuaRocks),
        ("cpan", Cpan),
        ("perl", Cpan),
        ("haxelib", Haxelib),
        ("haxe", Haxelib),
        ("bun", Npm),
        ("npm", Npm),
        ("pnpm", Npm),
        ("pypi", Python),
        ("python", Python),
        ("pub", Pub),
        ("ruby", Ruby),
    ];

    for (name, ecosystem) in cases {
        assert_eq!(ecosystem_from_config_name(name), Some(ecosystem));
    }
}

#[test]
fn ignores_unknown_config_names() {
    assert_eq!(ecosystem_from_config_name("unknown"), None);
}

#[test]
fn maps_ecosystems_to_config_namespaces() {
    let cases = [
        (Cargo, "cargo"),
        (Composer, "composer"),
        (Deno, "deno"),
        (Dotnet, "dotnet"),
        (Docker, "docker"),
        (Dub, "dub"),
        (Go, "golang"),
        (Maven, "maven"),
        (Hex, "hex"),
        (OpamEcosystem, "opam"),
        (Hackage, "hackage"),
        (Julia, "julia"),
        (Cran, "cran"),
        (Conan, "conan"),
        (Vcpkg, "vcpkg"),
        (Swift, "swift"),
        (Zig, "zig"),
        (Nim, "nim"),
        (LuaRocks, "luarocks"),
        (Cpan, "cpan"),
        (Haxelib, "haxelib"),
        (Npm, "npm"),
        (Python, "pypi"),
        (Pub, "pub"),
        (Ruby, "ruby"),
    ];

    for (ecosystem, namespace) in cases {
        assert_eq!(ecosystem_config_namespace(ecosystem), namespace);
    }
}

#[test]
fn maps_manifest_kinds_to_ecosystems() {
    let cases = [
        (CargoToml, Cargo),
        (ComposerJson, Composer),
        (DenoJson, Deno),
        (DenoImportMapJson, Deno),
        (JsrJson, Deno),
        (DotnetProjectJson, Dotnet),
        (DotnetXml, Dotnet),
        (PaketDependencies, Dotnet),
        (PaketReferences, Dotnet),
        (DockerComposeYaml, Docker),
        (Dockerfile, Docker),
        (DubJson, Dub),
        (DubSdl, Dub),
        (Gemfile, Ruby),
        (RubyGemspec, Ruby),
        (GoMod, Go),
        (MavenPomXml, Maven),
        (GradleBuild, Maven),
        (GradleSettings, Maven),
        (GradleVersionCatalogToml, Maven),
        (SbtBuild, Maven),
        (ClojureDepsEdn, Maven),
        (LeiningenProjectClj, Maven),
        (MixExs, Hex),
        (RebarConfig, Hex),
        (GleamToml, Hex),
        (Opam, OpamEcosystem),
        (DuneProject, OpamEcosystem),
        (Cabal, Hackage),
        (CabalProject, Hackage),
        (StackYaml, Hackage),
        (JuliaProjectToml, Julia),
        (JuliaManifestToml, Julia),
        (RDescription, Cran),
        (RenvLock, Cran),
        (ConanfileTxt, Conan),
        (ConanfilePy, Conan),
        (VcpkgJson, Vcpkg),
        (SwiftPackage, Swift),
        (ZigBuildZon, Zig),
        (Nimble, Nim),
        (LuaRockspec, LuaRocks),
        (Cpanfile, Cpan),
        (HaxelibJson, Haxelib),
        (NpmPackageJson, Npm),
        (NpmPackageJson5, Npm),
        (NpmPackageYaml, Npm),
        (PnpmYaml, Npm),
        (PythonPipfile, Python),
        (PythonPyprojectToml, Python),
        (PythonRequirementsTxt, Python),
        (PubspecOverridesYaml, Pub),
        (PubspecYaml, Pub),
    ];

    for (kind, ecosystem) in cases {
        assert_eq!(ecosystem_for_manifest(kind), Some(ecosystem));
    }
}

#[test]
fn ignores_non_dependency_manifest_kinds() {
    assert_eq!(ecosystem_for_manifest(Unknown), None);
    assert_eq!(ecosystem_for_manifest(VersionLensMultiRegistries), None);
}
