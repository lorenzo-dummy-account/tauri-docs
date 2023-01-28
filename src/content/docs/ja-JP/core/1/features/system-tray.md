# システムトレイ

ネイティブアプリケーションシステムトレイ。

### セットアップ

`systemTray` オブジェクトを `tauri.conf.json に設定する`:

```json
{
  "tauri": {
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
}
```

`iconAsTemplate` は、macOS 上の [Template Image][] をイメージが表すかどうかを決定する boolean 値です。

#### Linux セットアップ

Linux では、 `libayatana-appindicator` または `libappindicator3` パッケージのいずれかをインストールする必要があります。 Tauriは実行時にどのパッケージを使用するかを決定します。両方がインストールされている場合は、 `libayatana` が優先されます。

デフォルトでは、Debian パッケージ (`.deb` file) は `libayatana-appindicator3-1` に依存関係を追加します。 Debian パッケージ targeting `libappindicator3`を作成するには、 `TAURI_TRAY` 環境変数を `libappindicator3` に設定してください。

AppImageバンドルは自動的にインストールされたトレイライブラリを埋め込みます。また、 `TAURI_TRAY` 環境変数を使用して手動で選択することもできます。

:::info

`libappindicator3` is unmaintained and does not exist on some distros like `debian11`, but `libayatana-appindicator` does not exist on older releases.

:::

### システムトレイの作成

ネイティブのシステムトレイを作成するには、 `SystemTray` typeをインポートします。

```rust
tauri::SystemTray; を使用する
```

新しいトレイインスタンスを初期化:

```rust
let tray = SystemTray::new();
```

### システムトレイコンテキストメニューの設定

必要に応じて、トレイアイコンが右クリックされたときに表示されるコンテキストメニューを追加できます。 `SystemTrayMenu`, `SystemTrayMenuItem` と `CustomMenuItem` 型をインポート:

```rust
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
```

`SystemTrayMenu` を作成する :

```rust
// こちら `quit".to_string()` はメニューアイテムIDを定義し、2番目のパラメータはメニューアイテムラベルです。
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let hide = CustomMenuItem::new("hide".to_string(), "Hide");
let tray_menu = SystemTrayMenu::new()
  .add_item(quit)
  .add_native_item(SystemTrayMenuItem::Separator)
  .add_item(hide);
```

tray メニューを `SystemTray` インスタンスに追加します。

```rust
let tray = SystemTray::new().with_menu(tray_menu);
```

### アプリのシステムトレイを設定

作成された `SystemTray` インスタンスは、 `tauri::Builder` 構造体の `system_tray` API を使用して設定できます。

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insert the menu items here
  let system_tray = SystemTray::new()
    .with_menu(tray_menu);
  tauri::Builder::default()
    .system_tray(system_tray)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### システムトレイイベントを再生中

各 `CustomMenuItem` はクリックされたときにイベントをトリガーします。 また、おうりは、トレイアイコンをクリックしてイベントを発行します。 `on_system_tray_event` API を使用して処理します。

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insert the menu items here
  tauri::Builder::default()
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a left click");
      }
      SystemTrayEvent::RightClick {
        position: _,
        size: _,
..
      } => {
        println!("system tray received a right click");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
..
      } => {
        println!("system tray received a double click");
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "hide" => {
            let window = app.get_window("main").unwrap();
            window.hide().unwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### システムトレイの更新

`AppHandle` 構造体は `tray_handle` メソッドを持ちます。 は、tray アイコンとコンテキストメニュー項目を更新できるように、システムトレイにハンドルを返します。

#### コンテキストメニュー項目を更新中

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insert the menu items here
  tauri::Builder::default()
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        // get a handle to the clicked menu item
        // note that `tray_handle` can be called anywhere,
        // just get an `AppHandle` instance with `app.handle()` on the setup hook
        // and move it to another function or thread
        let item_handle = app.tray_handle().get_item(&id);
        match id.as_str() {
          "hide" => {
            let window = app.get_window("main").unwrap();
            window.hide().unwrap();
            // you can also `set_selected`, `set_enabled` and `set_native_image` (macOS only).
            item_handle.set_title("Show").unwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

#### トレイアイコンを更新中

Note that you need to add `icon-ico` or `icon-png` feature flag to the tauri dependency in your Cargo.toml to be able to use `Icon::Raw`

```rust
app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../path/to/myicon.ico").to_vec())).unwrap();
```

### すべてのウィンドウを閉じた後もアプリをバックグラウンドで実行してください

デフォルトでは、tauriは最後のウィンドウが閉じられたときにアプリケーションを閉じます。 アプリがバックグラウンドで実行される場合は、 `api.prevent_close()` を以下のように呼び出すことができます。

```rust
tauri::Builder::default()
  .build(tauri::generate_context!())
  .expect("tauriアプリケーションのビルド中にエラー")
  .run(|_app_handle, event| match event {
    tauri::RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    _ => {}
});
```

[Template Image]: https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc
