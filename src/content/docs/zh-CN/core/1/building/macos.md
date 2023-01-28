---
sidebar_position: 3
---

从 './\_tauri-build.md' 导入 TauriBuilde

# macOS Bundle

MacOS 的 Tauri应用程序要么使用 [应用程序包][] (`分发。 pp` 文件) 或 Apple Disk 镜像(`.dmg` 文件). Tauri CLI 会自动将您的应用程序代码捆绑在这些格式，提供您的应用程序的共设计选项和公证。 请注意， `.app` and `.dmg` bundles can **只能在 macOS** 上创建，因为交叉编译尚不可用。

:::note

在 macOS 和 Linux 上的 GUI 应用程序不能继承您的 shell 点文件的 `$PATH` (`)。 ashrc`, `.bash_profile`, `.zshrc`等)。 来看看Tauri的 [修正-path-env-rs][] crate 来解决这个问题。

:::

<TauriBuild />

## 设置最低系统版本

在 macOS 中运行的 Tauri应用程序所需的最低操作系统版本是 `10.13`。 如果您需要支持较新的 macOS API，如 `window.print` 只支持 macOS 版 `11。` 开始后，您可以更改 [`tauri.bundle.macOS.minimumSystem版本`][] 这将反过来设置 `Info.plist` [LSMinimumSystemversion][] 属性和 `MACOSX_DEPLOYMENT_TARGET` 环境变量。

## 二进制目标

您可以编译您针对苹果 Silicon, 英特尔的 Mac 计算机或通用macOS 二进制软件的应用程序。 默认情况下，CLI 构建了一个针对您机器结构的二进制文件。 如果你想要为另一个目标构建，你必须先通过运行 `来为目标安装缺失的rust目标，增加aarch64-apple-darwin` 或 `Rusup 目标添加 x86_64-apple-darwin`然后您可以使用 `--target` 标志来构建您的应用：

- `tauri建造--tarch64-apple-darwin`: 目标 Apple silicon 机器。
- `tauri building --target x86_64-apple-darwin`: targets based on Intel的机器。
- `tauri building --target universal-apple-darwin`: 生成 [通用macOS 二进制][] 运行于苹果硅和英特尔的Mac。

虽然苹果硅机器可以通过一个叫做 [Rosetta][]的翻译层运行为英特尔的Mac编译的应用程序， 这导致处理器指示翻译导致性能下降。 通常的做法是让用户在下载应用程序时选择正确的目标, 但您也可以选择发布一个 [通用二进制][universal macos binary]。 通用二进制程序包括 `无序` and `x86_64` 可执行文件，给您两个架构的最佳体验。 但请注意，这会大大增加您的捆包的大小。

## 应用程序Bundle 自定义

Tauri配置文件提供了自定义应用程序包的以下选项：

- **捆绑名称：** 您的应用的人类可读名称。 Configured by the [`package.productName`][] property.
- **Bundle 版本：** 您的应用版本。 由 [`package.version`][] 属性配置。
- **应用程序类别：** 描述您应用程序的类别。 由 [配置`tauri.bundle.category`][] 属性。 您可以在这里查看 [macOS 类别的列表。][macos app categories]。
- **版权：** 与您的应用相关联的版权字符串。 Configured by the [`tauri.bundle.copyright`][] property.
- **捆绑图标：** 您的应用图标。 使用 [中列出的第一个 `.icns` 文件`tauri.bundle.icon`][] 数组。
- **最低系统版本：** 由 [配置`tauri.bundle.macOS.minimumSystem版本`][] 属性。
- **DMG 许可证文件：** 已添加到 `.dmg` 文件的许可证。 由 [配置`tauri.bundle.macOS.license`][] 属性。
- **[Entitlements.plist 文件][]:** entitlements control 你的应用程序将访问什么。 由 [配置`tauri.bundle.macOS.pites`][] 属性。
- **异常域：** 是一个不安全的域，您的应用程序可以访问的 `本地主机` 或一个远程 `http` 域。 这是围绕 `NSAppTransportSecurity > NSExceptionDomains` 设置 `NSExceptionallowsInsecetHTTPLoad` 和 `NSIncludesSubdomains` 设置的方便配置。 查看 [`tauri.bundle.macOS.expresitionDomain`][] 获取更多信息。

:::info

这些选项生成应用程序包 [Info.plist 文件][]。 您可以用您自己的 `Info.plist` 文件扩展生成的文件存储在 Tauri 文件夹中(`src-tauri` 默认情况下)。 CLI 将生成中的 `.plist` 文件与核心层在开发过程中嵌入二进制文件。

:::

[应用程序包]: https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html
[`tauri.bundle.macOS.minimumSystem版本`]: ../../api/config.md#macconfig.minimumsystemversion
[配置`tauri.bundle.macOS.minimumSystem版本`]: ../../api/config.md#macconfig.minimumsystemversion
[LSMinimumSystemversion]: https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion
[通用macOS 二进制]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[universal macos binary]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[Rosetta]: https://support.apple.com/en-gb/HT211861
[macos app categories]: https://developer.apple.com/app-store/categories/
[`package.productName`]: ../../api/config.md#packageconfig.productname
[`package.version`]: ../../api/config.md#packageconfig.version
[配置`tauri.bundle.category`]: ../../api/config.md#bundleconfig.category
[`tauri.bundle.copyright`]: ../../api/config.md#bundleconfig.copyright
[中列出的第一个 `.icns` 文件`tauri.bundle.icon`]: ../../api/config.md#bundleconfig.icon
[配置`tauri.bundle.macOS.license`]: ../../api/config.md#bundleconfig.icon
[Entitlements.plist 文件]: https://developer.apple.com/documentation/bundleresources/entitlements
[配置`tauri.bundle.macOS.pites`]: ../../api/config.md#macconfig.entitlements
[`tauri.bundle.macOS.expresitionDomain`]: ../../api/config.md#macconfig.exceptiondomain
[Info.plist 文件]: https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html
[修正-path-env-rs]: https://github.com/tauri-apps/fix-path-env-rs
