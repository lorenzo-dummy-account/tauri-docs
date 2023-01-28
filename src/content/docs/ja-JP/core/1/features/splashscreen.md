# スプラッシュ画面

Webページの読み込みに時間がかかる場合、またはメインウィンドウを表示する前に Rust で初期化手順を実行する必要がある場合。 スプラッシュスクリーンはユーザーの読み込み体験を向上させます

### セットアップ

まず、スプラッシュスクリーン用の HTML コードを含む `distDir` に `splashscreen.html` を作成します。 次に、 `tauri.conf.json` を以下のように更新します。

```diff
"windows": [
  {
    "title": "Tauri App",
    "width": 800,
    "height": 600,
    "resizable": true,
    "fullscreen": false,
+   "visible": false // Hide the main window by default
  },
  // Add the splashscreen window
+ {
+   "width": 400,
+   "height": 200,
+   "decorations": false,
+   "url": "splashscreen.html",
+   "label": "splashscreen"
+ }
]
```

これで、メインウィンドウが非表示になり、アプリの起動時にスプラッシュスクリーンウィンドウが表示されます。 次に、アプリの準備が整ったら、スプラッシュスクリーンを閉じてメインウィンドウを表示する方法が必要です。 これを行う方法は、スプラッシュスクリーンを閉じる前に待っているものに依存します。

### ウェブページを待っています

ウェブコードを待っている場合は、 `close_splashscreen` [コマンド](command) を作成します。

```rust src-tauri/main.rs
use tauri::Manager;
// Create the command:
// This command must be async so that it don't run on the main thread.
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Close splashscreen
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Show main window
  window.get_window("main").unwrap().show().unwrap();
}

// Register the command:
fn main() {
  tauri::Builder::default()
    // Add this line
    .invoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}

```

次に、JSから呼び出すことができます:

```js
// With the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'
// With the Tauri global script:
const invoke = window.__TAURI__.invoke

document.addEventListener('DOMContentLoaded', () => {
  // This will wait for the window to load, but you could
  // run this function on whatever trigger you want
  invoke('close_splashscreen')
})
```

### Rust を待っています

Rust コードの実行を待っている場合 `セットアップ` 関数ハンドラに入れて、 `App` インスタンスにアクセスできるようにします。

```rust src-tauri/main.rs
use tauri::Manager;
fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main").unwrap();
      // we perform the initialization code on a new task so the app doesn't freeze
      tauri::async_runtime::spawn(async move {
        // initialize your app here instead of sleeping :)
        println!("Initializing...");
        std::thread::sleep(std::time::Duration::from_secs(2));
        println!("Done initializing.");

        // After it's done, close the splashscreen and display the main window
        splashscreen_window.close().unwrap();
        main_window.show().unwrap();
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```
