---
sidebar_position: 1
title: 一. 导言
---

:::caution Currently in pre-alpha
Webdriver support for Tauri is still in pre-alpha. 专用于它的配刀，例如 [tauri驱动器][]，仍然处于 活跃的开发阶段，并可能随时间的需要而变化。 此外，目前只支持 Windows 和 Linux。
:::

[WebDrive][] 是一个与主要用于自动测试的 web 文档交互的标准化界面。 Tauri支持 [WebDriver][] 接口，方法是利用本地平台 [WebDrive][] 服务器在一个 跨平台包装程序下 [`tauri驱动程序`][]

## 系统依赖关系

安装最新的 [`tauri驱动程序`][] 或通过运行更新现有的安装：

```shell
货物安装tauri驱动程序
```

因为我们目前正在使用平台的原生 [WebDriver][] 服务器， 在支持的平台上运行 [`tauri驱动程序`][] 平台支持目前仅限Linux和Windows。

### Linux

我们在 Linux 平台上使用 `WebKitWebDriver` 检查这个二进制文件是否已经存在(命令 `是什么WebKitWebDriver`)， 一些发行版将它与常规WebKit软件包捆绑在一起。 Other platforms may have a separate package for them, such as `webkit2gtk-driver` on Debian-based distributions.

### 窗口

Make sure to grab the version of [Microsoft Edge Driver][] that matches your Windows' Edge version that the application is being built and tested on. 这几乎总是最新版本的Windows安装。 如果 两个版本不匹配，您可能会在尝试连接时遇到您的 WebDriver 测试套装。

下载包含一个名为 `msedgedriver.exe` 的二进制文件。 [`tauri驱动程序`][] 在 `$PATH` 中寻找该二进制文件，所以请 确保它可以在路径上使用，或使用 `--native-driver` 选项在 [`tauri驱动程序`][]。 您可能想要自动下载，作为CI 设置过程的一部分，以确保边缘。 和Edge 驱动版本 保持在 Windows CI 机上同步。 关于如何做到这一点的指南可在晚些时候添加。

## 示例应用程序

指南的 [接下来的](example/setup) 部分显示了如何创建一个 通过 WebDrive 测试的最小示例应用程序。

如果你喜欢看到指南的结果并看到一个使用它的最小代码库， 你 可以查看 https://github。 om/chippers/hello_tauri。 这个示例还伴随着一个 CI 脚本测试GitHub 动作。 但您可能仍然很感兴趣 [WebDriver CI](ci) 指南，因为它解释了更多的概念。

[WebDrive]: https://www.w3.org/TR/webdriver/

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri驱动程序`]: https://crates.io/crates/tauri-driver
[tauri驱动器]: https://crates.io/crates/tauri-driver
[Microsoft Edge Driver]: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
