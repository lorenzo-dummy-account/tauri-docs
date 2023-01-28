---
sidebar_position: 8
---

# 嵌入附加文件

您可能需要在应用程序包中添加不属于您前端一部分的附加文件 (您的 `distrir`)，或者这些文件过大，无法嵌入到二进制程序中。 我们调用这些文件 `资源`。

将您选择的文件捆绑起来。 您可以在您的 `tauri中添加 <code>资源` 属性到 `tauri > 捆包` 对象。 onf.json</code> 文件。

在这里查看更多关于 tauri.conf.json 配置 [的][tauri.bundle]。

`资源` 需要一个针对具有绝对路径或相对路径的字符串列表。 它支持手势模式，以防您需要从目录中包含多个文件。

下面是一个示例来说明配置。 这不是完整的 `tauri.conf.json` 文件：

```json title=tauri.conf.json
{
  "tauri": {
    "bundle": {
      "resources": [
        "/absolute/path/to/textfile.txt",
        "relative/path/to/jsonfile.json",
        "resources/*"
      ]
    },
    "allowlist": {
      "fs": {
        "scope": ["$RESOURCE/*"]
      }
    }
  }
}
```

:::note

包含父组件的绝对路径和路径(`../`) 只能通过 `"$RESOURCE/*"` 被允许。 相对路径如 `"path/to/file.txt"` 可以通过 `明确允许。"$RESOURCE/path/to/file.txt"`.

:::

## 正在访问JavaScript文件

在这个示例中，我们想要捆绑看起来像这样的 i18n json 文件：

```json title=de.json
{
  "hello": "Guten Tag!",
  "bye": "Auf Wiedersehen!"
}
```

在这种情况下，我们将这些文件存储在 `tauri.conf.json` 旁边的 `lang` 目录中。 我们为此添加 `"lang/*"` 到 `resources` 和 `$RESOURCE/lang/*` 到上面所示的fs 范围。

请注意，您必须配置允许列表才能启用 `路径 > 所有` 和 [`fs` APIs][] 您所需。 在此示例 `fs > readTextFile`

```javascript
从 '@tauri-apps/api/path' 导入 { resolveResource }
// 或者使用 `window.__TAURI__路径。 esolveResource`
从 '@tauri-apps/api/fs' 导入 { readTextFile }
// 或者使用 `window.__TAURI__.fs.readTextFile`

// `lang/de.json` 是`tauri指定的值。 onf.json > tauri > bundle > resources`
const resourcePath = reass resolveResource('lang/de.json')
const langDe = JSON. arse(等待readTextFile(resourcePath))

console.log(langDe.hello) // 这将打印'Guten Tag!' 到 devtools 控制台
```

## 正在访问Rust 文件

这是基于上面的例子。 在红方您需要一个实例的 [`路径解析器`][] 您可以从 [`应用程序`][] 和 [`应用程序处理`][]

```rust
tauri::Builder::default()
  .setup(|app|
    let resource_path = app.path_resolver()
      .resolve_resource("lang/de). 儿子")
      xpect("未能解析资源");

    let file = std::fs::File::open(&resource_path). nwrapp();
    let lang_de: serde_json::Value = serde_json::from_reader(file)unwrawrapp();

    println!("{}", lang_de. et("hello").unwrapp()); // 这将把'Guten Tag!' 打印到终端

    Ok(())
})
```

```rust
#[tauri::command]
fn hello(hand: tauri:::AppHandle) -> String P,
   let resource_path = handle. ath_resolver()
      .resolve_resource("lang/de.json")
      xpect("未能解析资源");

    let file = std::fs::File::open(&resource_path). nwrapp();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrawraw();

    lang_de.get("hello").unwrawri()
}
```

[tauri.bundle]: ../../api/config.md#tauri.bundle
[`fs` APIs]: ../../api/js/fs/
[`路径解析器`]: https://docs.rs/tauri/latest/tauri/struct.PathResolver.html
[`应用程序`]: https://docs.rs/tauri/latest/tauri/struct.App.html
[`应用程序处理`]: https://docs.rs/tauri/latest/tauri/struct.AppHandle.html
