从 '@site/static/img/webdriver/hello-tauri-webdriver.png' 导入 HelloTauriWeb驱动程序

# 设置示例

此示例应用程序仅侧重于将 WebDrive 测试添加到已存在的项目。 有 个项目来测试以下两个部分。 我们将设置一个极少的 Tauri应用程序用于我们的测试 中。 我们不会使用Tauri CLI，任何前端依赖或构建步骤，不会在此后捆绑 应用程序。 这只是为了展示一个最起码的套件来显示将Web驱动程序添加到现有的 应用程序中。

如果您只想看到已完成的示例项目使用本示例指南中将显示的内容， 然后你 可以查看 https://github。 om/chippers/hello_tauri。

## 初始化货物项目

我们想要创建一个新的二进制货物项目来容纳此示例应用程序。 我们可以轻松地从命令 中做到这一点，与 `货物新的 hello-tauri-webdriver --bin`， 这将为我们制作一个最小的二进制货物项目。 This directory will serve as the working directory for the rest of this guide, so make sure commands you run are inside this new `hello-tauri-webdriver/` directory.

## 创建最小前端

我们将创建一个最小的 HTML 文件，作为我们的示例应用程序的前端。 稍后在我们的 WebDriver 测试中，我们也会在这个前端使用一些 的东西。

首先，让我们创建我们的 Tauri `digir` 。我们知道，一旦构建应用程序的 Tauri部分，我们将需要它。 `mkdir dist` 应该创建一个新的目录，名为 `dig/` 我们将在其中放置以下 `index.html` 文件。

`dist/index.html`:

```html
<OCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello Tauri!</title>
    <style>
      body 密切相关
        /* 添加一个良好的颜色方案 */
        背景颜色： #222831;
        颜色：#ececececec；

        /* 使机构成为窗口的确切大小 */
        间距： 0；
        高度：100vh；
        宽度：100vw；

        /* 垂直和水平中心的物体标签 */
        显示：弹性；
        司法内容：中心；
        对齐-条目：中心；
      }
    </style>
  </head>
  <body>
    <h1>Hello, 陶里！</h1>
  </body>
</html>
```

## 将Tauri添加到货物项目

接下来，我们将添加必要的物品，将我们的货运项目变成陶里项目。 首先，将依赖项 添加到货运清单 (`货运。 oml`) 这样货物就知道在建筑时会拉进我们的依赖关系。

`货物.toml`:

```toml
[package]
name = "hello-tauri-webdriver"
version = "0.1.0"
edition = "2021"
rust-version = "1. 6"

# 需要在构建时为Tauri设置一些内容
[build-dependencies]
tauribution = "1"

# 实际Tauri依赖性。 连同服务页面的`定制协议`。
[dependencies]
tauri = Power version = "1", features = ["custom-protocol"]}

# # Make --release 构建一个较小的二进制文件 (opt-level = "s") 并且快速(lto = true)。
# 这完全是可选的，但显示可以测试应用程序靠近
#典型发布设置。 注意：这将减慢编译速度。
[profile.release]
增量= fals
codegen-units = 1
penic = "中止"
opt-level = "s"
lto = true
```

我们添加了一个 `[build-dependency]` 您可能已经注意到。 要使用构建依赖，我们必须从构建 脚本中使用它。 我们现在将在 `build.rs` 创建一个。

`build.rs`:

```rust
fn main() v.
    // 仅观看`dist/`目录进行重新编译，防止不必要的
    // 更改当我们更改其它项目子目录中的文件。
    println!("cargo:rerun-if-changed=dist");

    // 运行Tauri buildtime helppers
    tauri_build::build()
}
```

我们的货运项目现在知道如何拉入和建立我们的Tauri依赖于所有的配置。 让我们通过在实际项目代码中设置Tauri来完成 这个最低限度的示例作为Tauri应用。 我们将编辑 `src/main.rs` 文件以添加此 Tauri 功能。

`src/main.rs`:

```rust
fn main()
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("无法运行Tauri application");
}
```

很简单，对吗？

## Tauri Configuration

我们将需要2件物品来成功地构建应用程序。 首先，我们需要一个图标文件。 您可以为这个下一个部分使用任何 PNG 并将其复制到 `icon.png` 中。 通常情况下，当您使用 Tauri CLI 创建一个项目时，这将被作为手势的一部分提供。 To get the default Tauri icon, we can download the icon used by the Hello Tauri example repository with the command `curl -L "https://github.com/chippers/hello_tauri/raw/main/icon.png" --output icon.png`.

我们将需要 `tauri.conf.json` 来为Tauri设置一些重要的配置值。 再次 这通常来自 `tauriinit` scaffoling 命令，但我们将在这里创建我们自己的最小配置 。

`tauri.conf.json`:

```json
主席:
  "build":
    "distDir": "dist"
  },
  "tauri": Power
    "bundle": Power
      "identifier": "studio. auri.hello_tauri_webdriver，
      "icon": ["icon" ng"]
    },
    "allowlist": Power
      "all": false
    },
    "windows": [
      ~
        "width": 800,
        "higit": 600,
        "调整大小": true
        "全屏": false
      }
    ]
  }
}
```

我将继续讨论其中的一些问题。 您可以看到我们先前创建的 `距离/` 目录为 `distribir` 属性。 我们 设置了一个捆绑的标识符，以便内建应用程序有一个唯一的 id，并设置了 `图标。 ng` 是唯一的 图标。 我们没有使用任何Tauri API或功能，所以我们在 `allowlist` 中禁用了它们，设置 `"all": false` 窗口值只是设置了一个单一窗口，用一些合理的默认值创建。

此时此刻，我们有一个基本的Hello World 应用程序，在运行时应显示简单的问候。

## 运行示例应用程序

为了确保我们做得对，让我们构建这个应用程序！ 我们将以 `--release` 应用程序运行这个应用程序，因为我们 也将运行我们的发布配置文件。 运行 `cargo 运行 --release`, 经过一些编译, 我们应该 看到以下应用程序弹出处。

<div style={{textAlign: 'center'}}>
  <img src={HelloTauriWebdriver}/>
</div>

_注意: 如果您正在修改应用程序并想使用Devtools 然后在没有 `--release` 和 "Inspect Element" 应该可以在右键菜单中运行它。_

我们现在应该准备开始通过一些Web驱动程序测试这个应用程序。 本指南将按此顺序运行 [WebdriverIO](webdriverio) 和 [Selenium](selenium)
