---
title: 常见问题
sidebar_position: 10
description: 共同问题修复
---

## 如何使用未发布的 Tauri 更改？

若要使用 GitHub 的 Tauri(出血的边缘版本)，您需要修改您的 `Cargo.toml` 文件，并更新您的 CLI 和 API。

<details>
  <summary>从源头拉取Rust crate</summary>

将此附加到您的 `货运/toml` 文件：

```toml title=Cargo.toml
[patch.crates-io]
tauri = Pown git = "https://github.com/tauri-apps/tauri", brant = "dev" }
tauri-building = "https://github.com/tauri-apps/tauri", brant = "dev" }
```

这将迫使您所有的依赖使用 `tauri` and `tauri-build` 从 Git 而不是 crates.io。

</details>

<details>
  <summary>从源头使用 Tauri CLI</summary>

如果您正在使用货物CLI，您可以直接从 GitHub 安装：

```shell
cargo install --git https://github.com/tauri-apps/tauri --branch dev tauri-cli
```

如果你正在使用 `@tauri-apps/cli` 软件包，你需要克隆并构建它：

```shell
git clone https://github.com/tauri-apps/tauri
git checout dev
cd tauri/tooling/cli/node
yarn
yarn building
```

要使用它，使用节点直接运行：

```shell
节点 /path/to/tauri/tooling/cli/node/tauri.js dev
节点 /path/to/tauri/tooling/cli/node/tauri.js building
```

或者，您可以使用货运直接运行您的应用程序：

```shell
cd src-tauri
货物运行 --no-default-features # 而不是 tauri dev
货物版本 # 而不是 tauri build-将不会捆绑您的应用程序，
```

</details>

<details>
  <summary>从源头使用 Tauri API</summary>

建议在使用 GitHub 的 Tauri crate 时也使用源头的 Tauri API 软件包(但可能不需要)。 要从源代码构建它，请运行以下脚本：

```shell
git clone https://github.com/tauri-apps/tauri
git checout dev
cd tauri/tooling/api
yarn
yarn building
```

现在您可以使用 yarn 链接它：

```shell
cd dist
yarn link
cd /path/to/your/project
yarn link @tauri-apps/api
```

或者您可以更改您的 package.json 直接指向dist 文件夹：

```json title=package.json
主席:
  "依赖":
    "@tauri-apps/api": "/path/to/tauri/tooling/api/dist"
  }
}
```

</details>

## 我应该使用节点或货运吗？ {#node-or-cargo}

即使通过货运安装CLI是首选的选项，但是它必须在安装时从零开始编译整个二进制文件。 如果您处于CI 环境或非常缓慢的机器，您最好选择另一种安装方法。

由于CLI 是在Rust编写的，它自然可以通过 [crates.io][] 进行安装，并且可以与货物一起安装。

We also compile the CLI as a native Node.js addon and distribute it [via npm][]. 与货物安装方法相比，这有若干优点：

1. CLI 是预先编译的, 导致安装时间更快。
2. 您可以在 package.json 文件中固定一个特定版本
3. 如果你在Tauri周围开发自定义配刀，你可以导入CLI作为常规JavaScript模块
4. 您可以使用 JavaScript 管理器安装 CLI

## 推荐浏览器列表

我们建议使用 `es2021`, `最后3 个Chrome 版本`, 和 `safari13` 用于您的浏览器列表和构建目标。 Tauri能够带动OS的原生渲染引擎 (WebKit 在macOS上，WebView2 在 Windows 上，WebKitGTK 在 Linux)。

## 在 Linux 上与 Homebrew 冲突

Linux上的 Homebrew 包含它自己的 `pkg-config` (一个在系统上查找库的工具)。 当为Tauri安装相同的 `pkg-config` 软件包时，这可能导致冲突(通常通过软件包管理器安装，如 `apt`)。 当你尝试构建Tauri应用程序时，它会尝试调用 `pkg-config` 并最终会从自制程序中调用它。 如果Homebrew 没有被用来安装Tauri的依赖关系，这可能造成错误。

错误为 _通常为_ 包含的信息大致为 `错误: 未能运行 X` 的自定义构建命令 - `插件Y 在 pkg-config 搜索路径中未找到。` 请注意，如果需要的依赖关系根本没有安装，您可能会看到类似的错误。

这个问题有两种解决办法：

1. [卸载 Homebrew][]
2. 设置 `PKG_CONFIG_PATH` 环境变量指向正确的 `pkg-config` 在构建Tauri 应用程序之前,

[crates.io]: https://crates.io/crates/tauri-cli
[via npm]: https://www.npmjs.com/package/@tauri-apps/cli
[卸载 Homebrew]: https://docs.brew.sh/FAQ#how-do-i-uninstall-homebrew
