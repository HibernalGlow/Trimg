# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

slimg is a fast image optimization tool — convert, compress, resize, crop, and extend images using modern codecs (MozJPEG, OxiPNG, WebP, AVIF, JPEG XL, QOI). It ships as a CLI, a desktop GUI (Tauri v2 + React), a Rust library crate, and language bindings for Python and Kotlin.

## Build & test commands

```bash
# Install from source
cargo install --path cli

# Build the CLI
cargo build --release -p slimg

# Run all workspace tests (excluding GUI)
cargo test --workspace

# Run tests for a single crate
cargo test -p slimg-core

# Run a single test
cargo test -p slimg-core -- format::tests::magic_jpeg

# Run benchmarks (slimg-core)
cargo bench -p slimg-core

# Build Python bindings (from bindings/python/)
cd bindings/python && pip install maturin && maturin develop

# GUI development
cd gui && bun install && bun tauri dev
# Build GUI
cd gui && bun tauri build
```

Build requirements: Rust 1.85+, C compiler, nasm, meson + ninja. Set `SYSTEM_DEPS_DAV1D_BUILD_INTERNAL=always` to build dav1d from source. The repo uses git submodules (`libjxl`), so run `git submodule update --init` after cloning.

## Workspace structure

```
Cargo.toml              # workspace root (members: slimg-core, slimg-ffi, libjxl-sys, cli)
crates/
  slimg-core/           # Core library — codec traits, pipeline, format detection
  slimg-ffi/            # UniFFI foreign bindings (cdylib + lib) — used by Python & Kotlin
  libjxl-sys/           # Minimal FFI bindings to vendored libjxl
cli/                    # CLI binary (clap, rayon, indicatif)
gui/
  src/                  # React frontend (Vite, Tailwind CSS, shadcn/ui, Radix)
  src-tauri/            # Tauri v2 Rust backend (NOT a workspace member — built separately)
bindings/
  python/               # Python package (maturin + UniFFI)
  kotlin/               # Kotlin/JVM package (Gradle + UniFFI)
ref/                    # Reference/upstream projects — not part of the build
```

## Core library architecture (`crates/slimg-core`)

**Codec system** (`src/codec/`): Each format (jpeg, png, webp, avif, jxl, qoi) implements the `Codec` trait (defined in `mod.rs`) with `decode(&[u8]) -> ImageData` and `encode(&ImageData, &EncodeOptions) -> Vec<u8>`. `get_codec(Format)` returns the right codec. `ImageData` is always RGBA8.

**Pipeline** (`src/pipeline.rs`): The core `convert()` function runs: crop → extend → resize → encode. This is the processing order — extend happens before resize.

**Format detection** (`src/format.rs`): Detect from both magic bytes and file extension. All formats support both decode and encode.

**Error type** (`src/error.rs`): Domain-specific errors (UnsupportedFormat, Decode, Encode, Resize, Crop, Extend) plus transparent wrappers for `io::Error` and `image::ImageError`.

## CLI architecture

Entry point `cli/src/main.rs` dispatches subcommands (convert/optimize/resize/crop/extend) to handler functions. Shared batch-processing logic lives in `cli/src/commands/mod.rs`: file collection, rayon thread pool config, progress bars, safe-write (temp file + rename), and thread-safe error collection.

## GUI architecture

Tauri v2 with React frontend. The Rust backend (`gui/src-tauri/src/commands.rs`) exposes five Tauri commands: `scan_directory`, `load_image`, `preview_image`, `process_image`, `process_batch`. The frontend uses shadcn/ui components with Tailwind CSS, custom hooks for state management (`useImageProcess`, `useBatchProcess`, `useSettings`), and Tauri's `invoke` API.

## Bindings

Both Python and Kotlin bindings share the same `slimg-ffi` crate which uses UniFFI to generate foreign bindings. The FFI layer wraps slimg-core types (`Format`, `ResizeMode`, `CropMode`, `ExtendMode`, `FillColor`, `PipelineOptions`) and re-exports `decode`, `encode`, `convert`, `resize`, `crop`, `extend`, `optimize` functions.

- **Python**: Built with maturin. The `slimg/_types.py` provides Pythonic wrappers (Image, Result classes) around the raw UniFFI bindings.
- **Kotlin**: Built with Gradle. UniFFI generates Kotlin bindings from the same FFI crate.

## CI

- `release.yml`: cargo-dist based release pipeline (tag-triggered, excluding `gui-v*` tags)
- `release-gui.yml`: GUI release (tag prefix `gui-v*`)
- `publish.yml`: Publishes to crates.io, Maven Central, PyPI, Homebrew
- `python-bindings.yml` / `kotlin-bindings.yml`: Language-specific binding CI
- `build-libjxl-prebuilt.yml`: Pre-built libjxl artifacts
