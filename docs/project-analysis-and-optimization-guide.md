# Slimg 项目分析与优化指南

> 本文档总结了 slimg 与 xl-converter 的对比分析，以及性能优化建议。
> 生成日期: 2025-05-12

---

## 目录

1. [项目概述](#1-项目概述)
2. [架构对比](#2-架构对比)
3. [性能分析](#3-性能分析)
4. [优化方案](#4-优化方案)
5. [实现细节](#5-实现细节)
6. [附录](#6-附录)

---

## 1. 项目概述

### 1.1 Slimg

**技术栈**: Rust + Tauri + React

**项目结构**:
```
slimg/
├── crates/
│   ├── slimg-core/     # 核心图像处理库 (Rust)
│   ├── slimg-ffi/      # FFI 绑定层 (uniffi)
│   └── libjxl-sys/     # JPEG XL 原生绑定
├── cli/                # 命令行工具
├── gui/                # Tauri + React 桌面应用
└── bindings/
    ├── python/         # Python 绑定
    └── kotlin/         # Kotlin 绑定
```

**支持的格式**:
| 格式 | 解码 | 编码 | 后端库 |
|------|------|------|--------|
| JPEG | ✅ | ✅ | mozjpeg |
| PNG | ✅ | ✅ | oxipng |
| WebP | ✅ | ✅ | libwebp |
| AVIF | ✅ | ✅ | ravif (rav1e) |
| JPEG XL | ✅ | ✅ | libjxl |
| QOI | ✅ | ✅ | rapid-qoi |

### 1.2 XL-Converter

**技术栈**: Python + PySide6 (Qt)

**特点**:
- 调用外部二进制工具 (cjxl, avifenc, magick 等)
- 功能丰富，支持 JPEGLI、无损 JPEG 转码等高级功能
- 并行处理 (QThreadPool)

---

## 2. 架构对比

### 2.1 核心差异

| 特性 | Slimg | XL-Converter |
|------|-------|--------------|
| **语言** | Rust | Python |
| **GUI 框架** | Tauri + React | PySide6 (Qt) |
| **编解码方式** | 原生库链接 | 外部二进制调用 |
| **进程模型** | 单进程 | 单进程 |
| **并行处理** | Rayon (文件级) | QThreadPool (文件级) |
| **分发方式** | 单一可执行文件 | 打包 Python + 二进制 |

### 2.2 优缺点分析

**Slimg 优势**:
- ✅ 启动速度快 (原生二进制)
- ✅ 内存占用低
- ✅ 部署简单 (单一文件)
- ✅ 跨语言绑定 (Python/Kotlin)
- ✅ 类型安全 (Rust)

**Slimg 劣势**:
- ❌ 缺少 JPEGLI 支持
- ❌ 缺少无损 JPEG 转码
- ❌ 批处理串行 (GUI)
- ❌ 编码器参数未优化

**XL-Converter 优势**:
- ✅ JPEGLI 编码 (35% 更好压缩)
- ✅ 无损 JPEG 转码 (可逆)
- ✅ 按目标大小缩放
- ✅ 并行批处理
- ✅ 丰富的元数据处理

**XL-Converter 劣势**:
- ❌ 启动慢 (Python)
- ❌ 内存占用高
- ❌ 依赖外部二进制

---

## 3. 性能分析

### 3.1 速度慢的原因

#### 3.1.1 编码器参数未优化

**JXL 编码器**:
```rust
// 当前实现 (slimg)
pub(crate) struct EncodeConfig {
    pub lossless: bool,
    pub distance: f32,
    // 缺少 effort 参数！
}
```

**问题**: 未设置 `effort` 参数，使用默认值（可能是最慢的设置）。

**XL-Converter 设置**:
```python
args[1] = f"-e {self.params['effort']}"  # 默认 effort=7
```

**AVIF 编码器**:
```rust
// 当前实现 (slimg)
ravif::Encoder::new()
    .with_quality(options.quality as f32)
    .with_speed(6)  // 固定 speed=6
```

**问题**: `speed` 固定为 6，未暴露给用户配置。

#### 3.1.2 批处理串行 (GUI)

```rust
// gui/src-tauri/src/commands.rs
for (index, file_path) in inputs.iter().enumerate() {
    // ❌ 逐个处理，没有并行！
    let result = tauri::async_runtime::spawn_blocking(...).await?;
}
```

**XL-Converter 并行处理**:
```python
self.threadpool.start(worker)  # 多个 worker 同时运行
```

#### 3.1.3 Tauri 架构开销

| 方面 | 影响 | 说明 |
|------|------|------|
| IPC 通信 | 中等 | JSON 序列化/反序列化 |
| Base64 传输 | 高 (预览) | 缩略图和预览图像 |
| 串行批处理 | **最高** | 最大性能瓶颈 |

### 3.2 AVIF 文件大小差异

**现象**: 同参数 (quality=60) 下，slimg 生成的 AVIF 文件更小。

**原因**:

| 因素 | Slimg (ravif) | XL-Converter (avifenc) |
|------|---------------|------------------------|
| 编码器 | rav1e | AOM AV1 / SVT-AV1 |
| 色度采样 | 自动优化 (4:2:0) | 默认 4:4:4 |
| 算法调优 | 针对静态图像优化 | 通用视频编码 |

**文件大小差异**: 30-40% (主要来自色度采样)

---

## 4. 优化方案

### 4.1 短期优化 (高优先级)

#### 4.1.1 修复编码器参数

**JXL 添加 effort 参数**:
```rust
// crates/slimg-core/src/codec/jxl/types.rs
pub(crate) struct EncodeConfig {
    pub lossless: bool,
    pub distance: f32,
    pub effort: u8,  // 新增: 1-10，默认 7
}

impl EncodeConfig {
    pub fn from_quality(quality: u8) -> Self {
        Self {
            lossless: quality >= 100,
            distance: unsafe { libjxl_sys::JxlEncoderDistanceFromQuality(quality as f32) },
            effort: 7,  // 默认值
        }
    }
}
```

**AVIF 添加 speed 参数**:
```rust
// crates/slimg-core/src/codec/avif.rs
pub struct AvifEncodeOptions {
    pub quality: u8,
    pub speed: u8,  // 新增: 1-10，默认 6-8
}
```

#### 4.1.2 并行批处理

```rust
// gui/src-tauri/src/commands.rs
use rayon::prelude::*;

#[tauri::command]
pub async fn process_batch(
    inputs: Vec<String>,
    options: ProcessOptions,
    window: tauri::Window,
) -> Result<(), String> {
    inputs.par_iter().enumerate().for_each(|(index, file_path)| {
        let result = process_single_file(file_path, &options);
        // 发送进度事件...
    });
    Ok(())
}
```

### 4.2 中期优化 (中优先级)

#### 4.2.1 添加 JPEGLI 支持

```rust
// 新增: crates/slimg-core/src/codec/jpegli.rs
pub struct JpegliCodec;

impl Codec for JpegliCodec {
    fn encode(&self, image: &ImageData, options: &EncodeOptions) -> Result<Vec<u8>> {
        // 调用 jpegli 库
    }
}
```

#### 4.2.2 无损 JPEG 转码

```rust
// crates/slimg-core/src/lossless_jpeg.rs
pub fn transcode_jpeg_to_jxl_lossless(jpeg_data: &[u8], effort: u8) -> Result<Vec<u8>> {
    jxl::encode_lossless_jpeg(jpeg_data, effort)
}
```

#### 4.2.3 优化数据传输

**方案 A: 临时文件**:
```rust
let temp_path = std::env::temp_dir().join(format!("preview_{}.png", uuid::Uuid::new_v4()));
std::fs::write(&temp_path, &png_bytes)?;
Ok(temp_path.to_string_lossy().to_string())
```

**方案 B: Tauri Asset 协议**:
```rust
// 使用 tauri://asset 协议直接访问本地文件
```

### 4.3 长期优化 (低优先级)

#### 4.3.1 功能移植

从 xl-converter 移植功能:
- 按目标大小缩放
- 智能 effort 选择
- 元数据处理 (ExifTool)
- 完成音效通知

#### 4.3.2 CLI 增强

```bash
# 新增命令
slimg transcode --input photo.jpg --output photo.jxl --effort 7
slimg downscale --input photo.jpg --target-size 100kb
```

---

## 5. 实现细节

### 5.1 编码器参数映射

#### JXL

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| quality | 0-100 | 80 | 质量 |
| effort | 1-10 | 7 | 编码努力程度 |
| distance | 0-15 | - | 视觉距离 |

#### AVIF

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| quality | 0-100 | 80 | 质量 |
| speed | 1-10 | 6 | 编码速度 |
| threads | 0-N | auto | 线程数 |

#### WebP

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| quality | 0-100 | 80 | 质量 |

### 5.2 性能基准

优化前预估:
| 场景 | 当前 | 优化后 | 提升 |
|------|------|--------|------|
| 单文件 JXL | 基准 | 基准 | - |
| 批量小文件 | 慢 2-3x | 接近 xl-converter | 2-3x |
| 批量大文件 | 慢 1.5x | 接近 xl-converter | 1.5x |

### 5.3 代码修改清单

#### 文件修改列表

1. `crates/slimg-core/src/codec/jxl/types.rs`
   - 添加 `effort` 字段到 `EncodeConfig`

2. `crates/slimg-core/src/codec/jxl/encoder.rs`
   - 在 `configure_frame` 中设置 effort

3. `crates/slimg-core/src/codec/avif.rs`
   - 添加 `speed` 参数支持
   - 暴露 `AvifEncodeOptions`

4. `crates/slimg-core/src/pipeline.rs`
   - 扩展 `PipelineOptions` 包含 effort/speed

5. `gui/src-tauri/src/commands.rs`
   - 实现并行批处理

6. `cli/src/commands/convert.rs`
   - 添加 effort/speed CLI 参数

---

## 6. 附录

### 6.1 参考链接

- [ravif 文档](https://docs.rs/ravif)
- [libjxl 文档](https://libjxl.readthedocs.io/)
- [mozjpeg 文档](https://github.com/mozilla/mozjpeg)
- [Tauri 性能优化](https://tauri.app/v1/guides/building/performance/)

### 6.2 术语表

| 术语 | 说明 |
|------|------|
| JPEGLI | Google 的新 JPEG 编码库，比传统 JPEG 小 35% |
| rav1e | Rust 编写的 AV1 编码器 |
| AOM AV1 | Alliance for Open Media 的 AV1 编码器 |
| SVT-AV1 | Intel 的可扩展视频技术 AV1 编码器 |
| 色度采样 | 4:4:4 (全色度), 4:2:0 (1/4 色度) |
| effort | 编码努力程度，越高质量越好但越慢 |
| speed | 编码速度，越高越快但文件越大 |

### 6.3 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2025-05-12 | 初始文档 |

---

*本文档由 AI 辅助生成，基于 slimg 和 xl-converter 项目的代码分析。*
