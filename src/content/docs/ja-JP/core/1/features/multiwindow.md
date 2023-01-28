# マルチウィンドウ

1つのアプリケーションで複数のウィンドウを管理します。

## ウィンドウの作成

ウィンドウは、牡牛座設定ファイルまたは実行時に静的に作成できます。

### 静的ウィンドウ

[tauri.windows][] 設定配列で複数のウィンドウを作成できます。 次の JSON スニペットは、設定を使用して複数のウィンドウを静的に作成する方法を示します。

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

window ラベルは一意でなければならず、実行時にウィンドウインスタンスにアクセスするために使用できることに注意してください。 静的ウィンドウで利用可能な設定オプションの完全なリストは、 [WindowConfig][] ドキュメントを参照してください。

### ランタイムウィンドウ

Rust レイヤーまたは Tauri API 経由で実行時にウィンドウを作成することもできます。

#### Rust にウィンドウを作成

[WindowBuilder][] 構造体を使用して、実行時にウィンドウを作成できます。

ウィンドウを作成するには、実行中の [App][] または [AppHandle][] のインスタンスが必要です。

##### [App][] インスタンスを使用してウィンドウを作成します

[App][] インスタンスは、セットアップ フックまたは [Builder::build][] の呼び出し後に取得できます。

```rust Using the setup hook
tauri::Builder::default()
  .setup(|app| {
    let docs_window = tauri::WindowBuilder::new(
      app,
      "external", /* the unique window label */
      tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
    ).build()?;
    let local_window = tauri::WindowBuilder::new(
      app,
      "local",
      tauri::WindowUrl::App("index.html".into())
    ).build()?;
    Ok(())
  })
```

セットアップ フックを使用すると、静的なウィンドウと牡牛座のプラグインが初期化されることが保証されます。 または、 [App][] をビルドした後にウィンドウを作成することもできます。

```rust Using the built app
let app = tauri::Builder::default()
  .build(tauri::generate_context!())
  .expect("error while building tauri application");

let docs_window = tauri::WindowBuilder::new(
  &app,
  "external", /* the unique window label */
  tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
).build().expect("failed to build window");

let local_window = tauri::WindowBuilder::new(
  &app,
  "local",
  tauri::WindowUrl::App("index.html".into())
).build()?;
```

このメソッドは、値の所有権をセットアップ終了に移動できない場合に便利です。

##### [AppHandle][] インスタンスを使用してウィンドウを作成する

[AppHandle][] インスタンスは、[`App::handle`]関数を使うか、牡牛座コマンドに直接挿入することができます。

```rust Create a window in a separate thread
tauri::Builder::default()
  .setup(|app| {
    let handle = app.handle();
    std::thread::spawn(move || {
      let local_window = tauri::WindowBuilder::new(
        &handle,
        "local",
        tauri::WindowUrl::App("index.html".into())
      ).build()?;
    });
    Ok(())
  })
```

```rust Create a window in a Tauri command
#[tauri::command]
async fn open_docs(handle: tauri::AppHandle) {
  let docs_window = tauri::WindowBuilder::new(
    &handle,
    "external", /* the unique window label */
    tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
  ).build().unwrap();
}
```

:::info

Tauriコマンドでウィンドウを作成する場合 `wry#583` の問題により、Windowsのデッドロックを避けるために、コマンド関数が [非同期][] であることを確認してください。

:::

#### JavaScriptでウィンドウを作成

Tauri API を使用すると、 [WebviewWindow][] クラスをインポートすることで、実行時に簡単にウィンドウを作成できます。

```js Create a window using the WebviewWindow class
import { WebviewWindow } from '@tauri-apps/api/window'
const webview = new WebviewWindow('theUniqueLabel', {
  url: 'path/to/page.html',
})
// since the webview window is created asynchronously,
// Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
webview.once('tauri://created', function () {
  // webview window successfully created
})
webview.once('tauri://error', function (e) {
  // an error occurred during webview window creation
})
```

## 実行時にウィンドウにアクセスする

window インスタンスは、そのラベルと Rust の [get_window][] メソッド、JavaScript の [WebviewWindow.getByLabel][] メソッドを使用してクエリできます。

```rust Using get_window
use tauri::Manager;
tauri::Builder::default()
  .setup(|app| {
    let main_window = app.get_window("main").unwrap();
    Ok())
})
```

Note that you must import [tauri::Manager][] to use the [get_window][] method on [App][] or [AppHandle][] instances.

```js Using WebviewWindow.getByLabel
import { WebviewWindow } from '@tauri-apps/api/window'
const mainWindow = WebviewWindow.getByLabel('main')
```

## 他のウィンドウとの通信

ウィンドウ通信は、イベントシステムを使用して行うことができます。 詳細は [イベント ガイド][] を参照してください。

[tauri.windows]: ../../api/config.md#tauriconfig.windows
[WindowConfig]: ../../api/config.md#windowconfig
[WindowBuilder]: https://docs.rs/tauri/1.0.0/tauri/window/struct.WindowBuilder.html
[App]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[AppHandle]: https://docs.rs/tauri/1.0.0/tauri/struct.AppHandle.html
[Builder::build]: https://docs.rs/tauri/1.0.0/tauri/struct.Builder.html#method.build
[get_window]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html#method.get_window
[非同期]: https://github.com/tauri-apps/wry/issues/583
[WebviewWindow]: ../../api/js/window.md#webviewwindow
[WebviewWindow.getByLabel]: ../../api/js/window.md#getbylabel
[tauri::Manager]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html
[イベント ガイド]: ./events.md
