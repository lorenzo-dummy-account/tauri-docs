# 多窗口

管理单个应用程序的多个窗口。

## 创建窗口

一个窗口可以静态从 Tauri 配置文件或运行时创建。

### 静态窗口

可以使用 [tairi.window][] 配置数组创建多个窗口。 下面的 JSON 代码片段演示如何通过配置静态创建几个窗口：

```json tauri.conf.json
{
  "tauri": {
    "windows": [
      {
        "label": "external",
        "title": "Tauri Docs",
        "url": "https://tauri.app"
      },
      {
        "label": "local",
        "title": "Tauri",
        "url": "index.html"
      }
    ]
  }
}
```

请注意，窗口标签必须是唯一的，可以在运行时使用来访问窗口实例。 静态窗口可用的配置选项的完整列表可以在 [WindowConfig][] 文档中找到。

### 运行时窗口

您也可以在运行时通过Rust lay或通过 Tauri API创建窗口。

#### 用Rust创建一个窗口

可以在运行时使用 [Windows Builder][] 结构创建一个窗口。

若要创建一个窗口，您必须有一个运行中的 [App][] 或 [AppHandle][] 的实例。

##### 使用 [App][] 实例创建窗口

[App][] 实例可以在设置钩子里或在调用 [Builder::build][] 之后获得。

```rust Using the setup hook
tauri::Builder::default()
  . etup(|app|
    let docs_window = tauri::WindowBuilder::new(
      app,
      "外部", /* 唯一的窗口标签 */
      tauri::WindowUrl::External("https://tauri). pp/".parse(). nwrap())
    ?
    let local_window = tauri::WindowBuilder::new(
      app,
      "local",
      tauri::WindowUrl::App("index. tml".into())
    ).build()?；
    Ok(())
})
```

使用设置钩子确保静态窗口和Tauri插件已初始化。 或者，您可以在构建 [App][] 后创建一个窗口：

```rust Using the built app
let app = tauri::Builder::default()
  .build(tauri::generate_context!())
  xpect("Building tauri应用程序错误");

let docs_window = tauri::WindowBuilder::new(
  &app,
  "外部", /* 唯一的窗口标签 */
  tauri::WindowUrl::External("https://tauri). pp/"parse().unwrapp())
).build()。 xpect("构建窗口失败");

let local_window = tauri::WindowBuilder::new(
  &app,
  "local",
  tauri::WindowUrl::App("index). tml".into())
).build()?;
```

当您不能将值所有权移动到设置关闭时，此方法是有用的。

##### 使用 [AppHandle][] 实例创建窗口

[AppHandle][] 实例可以使用 [`App::cheale`] 函数获得或直接注入Tauri命令。

```rust Create a window in a separate thread
tauri::Builder::default()
  .setup(|app|
    let chep = app. 和 ();
    std::thread::spawn(移动 ||
      let local_window = tauri::WindowBuilder::new(
        &handle,
        "local",
        tauri::WindowUrl::App("index). tml".into())
      ).build()?；
    })；
    Ok(())
})
```

```rust Create a window in a Tauri command
#[tauri:::command]
async fn open_docs(hand: tauri:::AppHandle) format@@
  let docs_window = tauri::WindowBuilder::new(
    &handle,
    "外部", /* 唯一的窗口标签 */
    tauri::WindowUrl::External("https://tauri). pp/"parse().unwrapp().unwrapp()
  ).build().unwrapp().
}
```

:::info

在 Tauri 命令中创建窗口时 确保命令函数是 `异步` ，以避免由于 [wry#583][] 问题而在Windows上出现僵局。

:::

#### 在 JavaScript 中创建一个窗口

使用 Tauri API，您可以通过导入 [WebviewWind][] 类轻松地在运行时创建一个窗口。

```js Create a window using the WebviewWindow class
从 '@tauri-apps/api/window ' 导入 { WebviewWindow }
const webview = new WebviewWindow('theUnqueLabel', PDF
  url: 'path/to/page. tml,
})
// 因为网页视图窗口是异步创建，
/ Tauri emits `tauri://created` 和 `tauri://error` 可以将创建响应通知您
webview。 nce('tauri://createdd, function () por
  // webview window successfully created
})
webview。 nce('tauri://error', function (e).
  // 在创建网页视图窗口期间发生错误
})
```

## 运行时访问窗口

窗口实例可以使用它的标签和 [get_window][] 方法在Rust 或 [WebviewWindow.getByLabel][] 在 JavaScript 上查询。

```rust Using get_window
使用 tauri:::Manager;
tauri::Builder::default()
  .setup(|app|
    let main_window = app.get_window ("main").unwrawind();
    Ok(())
})
```

注意您必须导入 [tauri::Manager][] 才能使用 [get_window][] 方法在 [App][] 或 [AppHandle][] 实例。

```js Using WebviewWindow.getByLabel
从 '@tauri-apps/api/window' 导入 { WebviewWindow }
const mainwindow = WebviewWindow.getByLabel('main')
```

## 与其他窗口通信

窗口通信可以使用事件系统进行。 更多信息请访问 [事件指南][]。

[tairi.window]: ../../api/config.md#tauriconfig.windows
[WindowConfig]: ../../api/config.md#windowconfig
[Windows Builder]: https://docs.rs/tauri/1.0.0/tauri/window/struct.WindowBuilder.html
[App]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[AppHandle]: https://docs.rs/tauri/1.0.0/tauri/struct.AppHandle.html
[Builder::build]: https://docs.rs/tauri/1.0.0/tauri/struct.Builder.html#method.build
[get_window]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html#method.get_window
[wry#583]: https://github.com/tauri-apps/wry/issues/583
[WebviewWind]: ../../api/js/window.md#webviewwindow
[WebviewWindow.getByLabel]: ../../api/js/window.md#getbylabel
[tauri::Manager]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html
[事件指南]: ./events.md
