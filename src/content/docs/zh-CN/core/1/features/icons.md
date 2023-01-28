从 '@theme/Command' 导入命令

# 图标

Tauri船只的标志是默认的图标。 这不是你在运送应用程序时想要的。 为了纠正这种常见情况，Tauri提供了 `图标` 命令，它将需要输入文件(`)。 app-icon.png"` 默认情况下, 并创建各种平台所需的所有图标。

:::info 注释在文件类型

- `icon.icns` = macOS
- `icon.ico` = Windows
- `*.png` = Linux
- `正方形*Logo.png` & `StoreLogo.png` = 当前未使用但打算用于 AppX/MS 存储目标。

注意图标类型可能会用于上面列出的平台以外的平台(特别是 `png`)。 因此，我们建议包括所有图标，即使您只打算构建平台子集。

:::

## 命令使用

开始于 `@tauri-apps/cli` / `tauri-cli` 版本 1.1 `图标` 子命令是主客户端的一部分：

<Command name="icon" />

```console
> 货运标签图标 --help
cargo-tauri-icon 1.1。

为所有主要平台生成各种图标

USAGE：
    货运标签图标 [OPTIONS] [INPUT]

方舟：
    <INPUT>    源图标路径(png), 1240x1240像素具有透明度) [默认： 应用程序图标。 ng]

选项：
    - h, --help 打印帮助信息
    -o, --output <OUTPUT>    输出目录。 默认: tauri.conf.json 文件
    -v, --verbose 启用详细日志
    -V, --version 打印版本信息
```

默认情况下，图标将被放置在您的 `src-tauri/icons` 文件夹中，他们将被自动放置在您的内置应用程序中。 如果您想要从不同的位置来源自您的图标，您可以编辑 `tauri.conf.json` 文件的这一部分：

```json
主席:
  "tauri":
    "bundle": format@@
      "icon": [
        "icons/32x32). ng",
        "icons/128x128 ng",
        "icons/128x128@2x.png",
        "icons/icon cns”，
        "icons/icon"。 co"
      ]
    }
  }
}
```

## 手动创建图标

如果您希望自己构建这些图标(如果您想要为小尺寸设计一个更简单的设计，或者因为您不想依赖CLI的内部图像大小调整)， [`icns`][] 文件 [在 Tauri repo][] 和 [`ico`][] 文件必须包含16层， 24、32、48、64和256像素。 为了在开发</em>中最佳地显示ICO 图像 _，32px 图层应该是第一层。</p>

[在 Tauri repo]: https://github.com/tauri-apps/tauri/blob/dev/tooling/cli/src/helpers/icns.json
[`icns`]: https://en.wikipedia.org/wiki/Apple_Icon_Image_format
[`ico`]: https://en.wikipedia.org/wiki/ICO_(file_format)
