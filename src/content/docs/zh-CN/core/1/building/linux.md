---
sidebar_position: 4
---

从 './\_tauri-build.md' 导入 TauriBuilde

# Linux 包

## 限制

像glibc这样的核心图书馆经常破坏与旧系统的兼容性。 为此原因，您必须使用您打算支持的最老的基础系统来构建您的 Tauri应用程序。 像Ubuntu 18.04这样较旧的系统比Ubuntu 22.04更适合，因为Ubuntu 22编译了二进制版本。 4 需要更高的 glibc 版本，所以在运行旧系统时， 您将面临运行时错误，如 `/usr/lib/libc。 o.6：找不到版本 'GLIBC_2.33'`。 我们建议使用 Docker 容器或 GitHub 操作来构建您的 Tauri应用程序 Linux 。

请参阅 [tauri-apps/tauri#1355][] and [rust-lang/rust#57497][]的问题，以及 [AppImage 指南][] 以获取更多信息。

## Debian

Tauri允许您的应用打包为一个 `.deb` (Debian 软件包)。 如果您在 Linux 上建立，Tauri CLI 会将您的应用程序的二进制和额外资源捆绑在这种格式。 Please note that `.deb` packages can **only be created on Linux** as cross-compilation doesn't work yet.

由 Tauri Bundler 生成的Debian 软件包有你需要的一切将应用程序运到基于 Debian的 Linux 发行版。 定义应用程序的图标，生成桌面文件，并指定依赖项 `libwebkit2gtk-4。 -37` and `libgtk-3-0`, 以及 `libappindicator3-1` 如果您的应用使用系统托盘。

:::note
macOS 和Linux 上的 GUI 应用程序不继承 `$PATH` 从您的 shell dotfiles (`ashrc`, `.bash_profile`, `.zshrc`等)。 来看看Tauri的 [修正-path-env-rs](https://github.com/tauri-apps/fix-path-env-rs) crate 来解决这个问题。
:::

<TauriBuild />

### 自定义文件

当你需要更多的控制时，Tauri会显示Debian 软件包的几个配置。

如果您的应用依赖于其他系统依赖关系，您可以在 `tauri.conf.json > tauri > bundle > deb > 依赖于` 中指定它们。

要在 Debian 软件包中包含自定义文件，您可以在 `tauri中提供文件或文件夹列表。 onf.json > tauri > bundle > deb > 文件` 配置对象映射Debian 软件包中到文件系统上文件路径的路径，相对于 `tauri。 onf.json` 文件。 下面是示例配置：

```json
主席:
  "tauri":
    "bundle": format@@
      "deb":
        "files":
          "/usr/share/README. d": "../README.md", // 复制README.md文件到 /usr/share/README d
          "usr/share/assets": ... assets/" // 复制整个asset目录到/usr/share/assets
        }
      }
    }
  }
}
```

如果您需要以跨平台方式捆绑文件，请检查 Tauri [资源][] 和 [sidecar][] 机制。

## AppImage

AppImage 是一个分布格式，它不依赖系统安装的软件包，而是将应用程序所需的所有依赖和文件捆绑在一起。 出于这一原因， 输出文件较大但较容易发布，因为它在许多Linux发行版上得到支持，并且可以在不安装的情况下执行。 用户只需要使文件可执行(`chmod a+x MyProject)。 ppImage`) 然后可以运行 (`./MyProject.AppImage`)。

如果您不能针对发行版的包管理器制作包，应用图像是方便的，可以简化发行流程。 但随着文件大小从2-6MB到70+MB，你应该仔细使用它。

:::注意事项

如果您的应用播放音频/视频，您需要启用 `tauri.conf.json > tauri > bundle > appimage > bundleMediaFramework` 这将增加应用图像包的大小，以包括媒体播放所需的添加 `gstreamer` 个文件。 此标志目前仅支持 Ubuntu 构建系统。

:::

[资源]: resources.md
[sidecar]: sidecar.md
[tauri-apps/tauri#1355]: https://github.com/tauri-apps/tauri/issues/1355
[rust-lang/rust#57497]: https://github.com/rust-lang/rust/issues/57497
[AppImage 指南]: https://docs.appimage.org/reference/best-practices.html#binaries-compiled-on-old-enough-base-system
