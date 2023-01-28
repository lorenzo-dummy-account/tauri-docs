---
sidebar_position: 2
---

从 '@theme/Command' 导入命令

# Windows 安装程序

Windows 的Tauri应用程序以Microsoft Installers (`.msi` 文件)分发。 Tauri CLI 捆绑您的应用程序的二进制和附加资源。 请注意， `.msi` 安装程序可以 **只能在 Windows** 上创建，因为交叉编译尚不可用。 本指南提供了有关安装程序可用的自定义选项的信息。

要构建和捆绑您的 Tauri应用程序到一个单一可执行程序，只需运行以下命令：

<Command name="build" shell="powershell"/>

它将构建你的前端，编译Rust 二进制文件，收集所有外部二进制文件和资源，并最终生成专门针对平台的捆绑和安装器。

## 构建32位或 ARM

默认情况下，Tauri CLI 使用您的机器架构编译您的可执行程序。 假定您正在研发64位机器，CLI将生成64位应用程序。

If you need to support **32-bit** machines, you can compile your application with a **different** [Rust target][platform support] using the `--target` flag:

```powershell
tauri build--target i686-pc-windows-msvc
```

默认情况下，只为您的机器的目标安装工具链。 所以您需要先安装32位Windows工具链： `扩展目标添加 i686-pc-windows-msvc`。

如果你需要构建 **ARM64** 你首先需要安装额外的构建工具。 要做到这一点，请打开 `Visual Studio Installer`, 点击"Modify", 并在“个别组件”选项卡中安装"C++ ARM64 build工具"。 在编写本报告时，VS2022的准确名称是 `MSVC v143 - VS 2022 C++ ARM64 构建工具(Latet)`。  
现在您可以用 `扩展目标添加 aarch64-pc-winds-msvc` 然后使用上述方法编译您的应用：

```powershell
tauri build--tark aarc64-pc-windows-msvc
```

## 支持 Windows 7

默认， Microsoft Installer 无法在 Windows 7 上工作，因为如果未安装，它需要下载 Webview2 bootstraper (如果安装了 TLS 1 可能会失败)。 未在操作系统中启用)。 Tauri包含一个嵌入Webview2 引导器的选项(见下面 [嵌入Webview2 Bootstraper](#embedded-bootstrapper) 部分)。

此外，要在 Windows 7 中使用通知 API ，您需要启用 `windows7-compat` 货运功能：

```toml title="Cargo.toml"
[dependencies]
tauri = Power version = "1", feats = [ "windows7-compat" ] }
```

## Webview2 安装选项

Windows 安装程序默认下载Webview2 bootstraper 并在未安装运行时执行它。 或者，您可以嵌入bootstraper，嵌入离线安装器，或使用固定的 Webview2 运行时版本。 这些方法之间的比较见下表：

| 安装方法                                          | 需要互联网连接？ | 附加安装程序大小 | 注                                                     |
|:--------------------------------------------- |:-------- |:-------- |:----------------------------------------------------- |
| [`下载引导器`](#downloaded-bootstrapper)           | 否        | 0MB      | `默认` <br /> 结果的安装程序较小，但不推荐到 Windows 7 的部署。      |
| [`embedBootstrapper`](#embedded-bootstrapper) | 否        | ~1.8MB   | 在 Windows 7 上更好的支持。                                   |
| [`离线安装程序`](#offline-installer)                | 否        | ~127MB   | 嵌入 Webview2 安装程序。 推荐离线环境                              |
| [`固定版本`](#fixed-version)                      | 否        | ~180MB   | 嵌入固定的 Webview2 版本                                     |
| [`跳过`](#skipping-installation)                | 否        | 0MB      | ⚠️ 不建议 <br /> 不将 Webview2 安装为 Windows 安装程序的一部分。 |

:::info

在 Windows 10 (2018年4月发行版)和Windows 11, Webview2 运行时间作为操作系统的一部分分发。

:::

### 已下载的引导器

这是构建Windows 安装程序的默认设置。 它下载引导器并运行它。 需要互联网连接，但是安装程序大小较小。 如果您将要向Windows 7分发，则不推荐这样做。

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "downloadBootstrapper"
        }
      }
    }
  }
}
```

### Embedded Bootstrapper

要嵌入Webview2 Bootstraper，请将 [webviewInstall模式][] 设置为 `embedBootstraper`。 这会增加大约1.8兆字节的安装程序大小，但会增加与 Windows 7 系统的兼容性。

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "embedBootstrapper"
        }
      }
    }
  }
}
```

### 离线安装程序

要嵌入Webview2 Bootstraper，请将 [webviewInstall模式][] 设置为 `离线安装程序`。 这会增加大约127MB的安装程序大小，但允许安装您的应用程序，即使互联网连接不可用。

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "offlineInstaller"
        }
      }
    }
  }
}
```

### 固定版本

使用系统提供的运行时间对于安全来说非常重要，因为Web 视图的脆弱性补丁是由 Windows 管理的。 如果您想要控制您每个应用程序上的 Webview2 发布(要么管理您自己的发布补丁，要么在网络连接可能不可用的环境中发布应用程序)，Tauri可以为您捆绑运行时文件。

:::谨慎
发布固定的 Webview2 运行时版本会增加 Windows 安装程序约180MB。
:::

1. 从 [Microsoft 网站][download-webview2-runtime] 下载Webview2 固定版本运行时间。 在此示例中，下载的文件名是 `Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab`
2. 提取文件到核心文件夹：

```powershell
展开.\Microsoft.WebView2.FixedVersionRuntime.98.0.1108.x64.cab -F：* ./src-tauri
```

3. 配置 `tauri.conf.json` 的 Webview2 运行路径：

```json title="tauri.config.json"
主席:
  "tauri":
    "bundle": format@@
      "windows":
        "webviewInstallMode":
          "type": "field",
          "路径": ". Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50。 64/"
        }
      }
    }
  }
}
```

4. 运行 `tauribuild` 来生成固定的 Webview2 运行时间的 Windows 安装程序。

### 跳过安装

您可以通过设置 [webviewInstall模式][] 到 `跳过` ，从安装程序中下载检查。 如果用户没有安装运行时间，您的应用程序将无法工作。

:::警告
如果用户没有安装运行时间并且不会尝试安装它，您的应用程序将无法工作。
:::

```json title="tauri.config.json"
主席:
  "tauri":
    "bundle": format@@
      "windows":
        "webviewInstallMode":
          "type": "skip"
        }
      }

  }
}
```

## 自定义安装程序

Windows 安装程序包是使用 [WiX 工具集 v3][] 构建的。 目前，您可以通过自定义WiX源代码来更改它(一个带有 `的XML文件)。 xs` 文件扩展名或通过 WiX 片段。

### 用自定义WiX文件替换安装程序代码

由 Tauri定义的 Windows Installer XML 被配置为适用于简单的 web 视图应用程序的常见使用案例(您可以在这里找到 [][default wix template])。 它使用 [个手提栏][] ，所以Tauri CLI 可以根据您 `tauri.conf.json` 定义来品牌您的安装程序。 如果您需要一个完全不同的安装程序，可以在 [`tauri.bundle.windows.wix.template`][] 上配置一个自定义模板文件。

### 用WiX片段扩展安装程序

一个 [WiX 片段][] 是一个容器，您可以在容器中配置WiX提供的几乎所有的东西。 在这个示例中，我们将定义一个片段，写入两个注册表条目：

```xml
<?xml version="1.0" encoding="utf-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Fragment>
    <!-- these registry entries should be installed
         to the target user's machine -->
    <DirectoryRef Id="TARGETDIR">
      <!-- groups together the registry entries to be installed -->
      <!-- Note the unique `Id` we provide here -->
      <Component Id="MyFragmentRegistryEntries" Guid="*">
        <!-- the registry key will be under
             HKEY_CURRENT_USER\Software\MyCompany\MyApplicationName -->
        <!-- Tauri uses the second portion of the
             bundle identifier as the `MyCompany` name
             (e.g. `tauri-apps` in `com.tauri-apps.test`)  -->
        <RegistryKey
          Root="HKCU"
          Key="Software\MyCompany\MyApplicationName"
          Action="createAndRemoveOnUninstall"
        >
          <!-- values to persist on the registry -->
          <RegistryValue
            Type="integer"
            Name="SomeIntegerValue"
            Value="1"
            KeyPath="yes"
          />
          <RegistryValue Type="string" Value="Default Value" />
        </RegistryKey>
      </Component>
    </DirectoryRef>
  </Fragment>
</Wix>
```

<!-- Would be good to include here WHERE we recommend to save it -->

在您的项目中的某个地方使用 `.wxs` 扩展保存片段文件，并在 `tauri.conf.json` 中引用它：

```json
主席:
  "tauri":
    "bundle": format@@
      "windows":
        "wix":
          "fragmentPaths": [". 路径/到/注册。 xs"],
          "componentRefs": ["MyFragmentRegistryEntries"]
        }
      }
    }
  }
 } 
 }
```

注意 `组件组`, `组件`, `特征组`, `功能` 和 `合并` 元素id必须在 `wix` 对象 `tauri. onf.json` 关于 `components GroupRefs`, `componentRefs`, `featureGroupRefs`, `featureRefs` 和 `合并Refs` 将分别包含在安装程序中。

## Internationalization

Windows 安装程序默认使用 `-US` 语言构建。 可以使用 [`tauri.bundle.windows.wix.language`][] 属性，定义语言Tauri 应该构建一个安装程序。 您可以在 [微软网站][localizing the error and actiontext tables] 上找到语言文化列中使用的语言名称。

### 为单一语言编译安装程序

要创建一个针对特定语言的单个安装程序，请将 `语言` 值设置为字符串：

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": "fr-FR"
        }
      }
    }
  }
}
```

### 在列表中编译每种语言的安装程序

要编译针对语言列表的安装程序，请使用数组。 将为每种语言创建一个特定的安装程序，语言键作为后缀：

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": ["en-US", "pt-BR", "fr-FR"]
        }
      }
    }
  }
}
```

### 配置每种语言的安装程序

可以为每种语言定义配置本地化字符串的配置对象：

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": {
            "en-US": null,
            "pt-BR": {
              "localePath": "./wix/locales/pt-BR.wxl"
            }
          }
        }
      }
    }
  }
}
```

`localePath` 属性定义了语言文件的路径，一个 XML 配置语言文化：

```xml
<WixLocalization
  Culture="en-US"
  xmlns="http://schemas.microsoft.com/wix/2006/localization"
>
  <String Id="LaunchApp"> 启动 MyApplicationname </String>
  <String Id="DowngradeErrorMessage">
    新版本的 MyApplicationName 已经安装。
  </String>
  <String Id="PathEnvVarFeature">
    将 MyApplicationName 可执行文件的安装位置添加到
    的 PATH 系统环境变量。 这允许从任何位置调用
    MyApplicationName 可执行文件。
  </String>
  <String Id="InstallAppFeature">
    安装了 MyApplicationName
  </String>
</WixLocalization>
```

:::note
`WixLocalization` 元素的 `Culture` 字段必须匹配配置的语言。
:::

目前，Tauri引用了以下区域字符串： `LaunchApp`, `DowngradeErrorMessage`, `PathEnvVarFeature` 和 `InstallApp功能` 您可以定义您自己的字符串并在您的自定义模板或片段上引用它们， `"!(foc.TheStringId)"`。 查看 [WiX 本地化文档][] 获取更多信息。

[platform support]: https://doc.rust-lang.org/nightly/rustc/platform-support.html
[webviewInstall模式]: ../../api/config.md#webviewinstallmode
[download-webview2-runtime]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section
[WiX 工具集 v3]: https://wixtoolset.org/documentation/manual/v3/
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[个手提栏]: https://docs.rs/handlebars/latest/handlebars/
[`tauri.bundle.windows.wix.template`]: ../../api/config.md#wixconfig.template
[WiX 片段]: https://wixtoolset.org/documentation/manual/v3/xsd/wix/fragment.html
[`tauri.bundle.windows.wix.language`]: ../../api/config.md#wixconfig.language
[WiX 本地化文档]: https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/make_installer_localizable.html
[localizing the error and actiontext tables]: https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables
