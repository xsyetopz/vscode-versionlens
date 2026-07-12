package com.versionlens.jetbrains

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.openapi.application.PathManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspServerSupportProvider
import com.intellij.platform.lsp.api.ProjectWideLspServerDescriptor
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.util.Locale

internal class VersionLensLspServerSupportProvider : LspServerSupportProvider {
    override fun fileOpened(
        project: Project,
        file: VirtualFile,
        serverStarter: LspServerSupportProvider.LspServerStarter,
    ) {
        if (VersionLensLspServerDescriptor.supports(file)) {
            serverStarter.ensureServerStarted(VersionLensLspServerDescriptor(project))
        }
    }
}

private class VersionLensLspServerDescriptor(
    private val currentProject: Project,
) : ProjectWideLspServerDescriptor(currentProject, SERVER_NAME) {
    override fun isSupportedFile(file: VirtualFile): Boolean = supports(file)

    override fun createCommandLine(): GeneralCommandLine = GeneralCommandLine(resolveServerPath())

    private fun resolveServerPath(): String {
        val propertyPath = System.getProperty("versionlens.lsp.path")
        if (!propertyPath.isNullOrBlank()) {
            return propertyPath
        }

        val environmentPath = System.getenv("VERSIONLENS_LSP")
        if (!environmentPath.isNullOrBlank()) {
            return environmentPath
        }

        bundledServerPath()?.let { return it }

        val basePath = currentProject.basePath
        if (basePath != null) {
            val repoBinary = Path.of(basePath, "target", "debug", SERVER_BINARY)
            if (Files.isRegularFile(repoBinary)) {
                return repoBinary.toString()
            }
        }

        return SERVER_BINARY
    }

    companion object {
        private const val SERVER_NAME = "VersionLens Redux"
        private val SERVER_BINARY =
            if (System.getProperty("os.name").startsWith("Windows", ignoreCase = true)) {
                "versionlens-lsp.exe"
            } else {
                "versionlens-lsp"
            }

        @Synchronized
        private fun bundledServerPath(): String? {
            val resource = VersionLensLspServerSupportProvider::class.java
                .getResourceAsStream("/bin/$SERVER_BINARY") ?: return null
            val directory = Path.of(PathManager.getSystemPath(), "versionlens-redux", "bin")
            Files.createDirectories(directory)
            val binary = directory.resolve(SERVER_BINARY)
            resource.use {
                Files.copy(it, binary, StandardCopyOption.REPLACE_EXISTING)
            }
            if (!binary.toFile().setExecutable(true)) {
                return null
            }
            return binary.toString()
        }
        private val supportedFileNames = setOf(
            "WORKSPACE",
            "MODULE.bazel",
            "BUILD.bazel",
            "BUILD",
            "Dockerfile",
            "Gemfile",
            "Podfile",
            "cpanfile",
            "Pipfile",
            "requirements.txt",
            "paket.dependencies",
            "paket.references",
            "rebar.config",
            "stack.yaml",
            "pubspec.yaml",
            "pubspec_overrides.yaml",
            "deno.json",
            "deno.jsonc",
            "import_map.json",
            "composer.json",
            "package.json",
            "package.json5",
            "package.yaml",
            "pnpm-workspace.yaml",
            "Cargo.toml",
            "Package.swift",
            "go.mod",
            "pyproject.toml",
            "gleam.toml",
            "haxelib.json",
            "dub.json",
            "dub.sdl",
            "dune-project",
            "mix.exs",
            "flake.nix",
            "opam",
            "build.sbt",
            "xmake.lua",
            "build.zig.zon",
            "vcpkg.json",
            "conanfile.txt",
            "conanfile.py",
            "CMakeLists.txt",
        )
        private val supportedExtensions = setOf(
            "csproj",
            "fsproj",
            "vbproj",
            "props",
            "targets",
            "gradle",
            "kts",
            "pom",
            "xml",
            "json",
            "json5",
            "yaml",
            "yml",
            "toml",
            "lock",
            "gemspec",
            "rockspec",
            "nimble",
            "tf",
            "tfvars",
            "wrap",
            "cabal",
        )

        fun supports(file: VirtualFile): Boolean {
            val name = file.name
            if (name in supportedFileNames) {
                return true
            }
            val lowerName = name.lowercase(Locale.ROOT)
            if (lowerName.startsWith("dockerfile")) {
                return true
            }
            return file.extension?.lowercase(Locale.ROOT) in supportedExtensions
        }
    }
}
