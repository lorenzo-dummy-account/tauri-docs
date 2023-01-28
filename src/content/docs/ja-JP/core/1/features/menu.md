# ウィンドウメニュー

ネイティブアプリケーションメニューは、ウィンドウに添付することができます。

### メニューの作成

ネイティブ ウィンドウ メニューを作成するには、 `メニュー`、 `サブメニュー`、 `MenuItem` および `CustomMenuItem` 型をインポートします。 `MenuItem` 列挙型には、プラットフォーム固有のアイテムのコレクションが含まれています(現在は Windows には実装されていません)。 `CustomMenuItem` を使用すると、独自のメニュー項目を作成し、それらに特別な機能を追加できます。

```rust
tauri::{CustomMenuItem, Menu, MenuItem, Submenu}; を使用する
```

`メニュー` インスタンスを作成:

```rust
// こちら `quit".to_string()` はメニューアイテムIDを定義し、2番目のパラメータはメニューアイテムラベルです。
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let close = CustomMenuItem::new("close".to_string(), "Close");
let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
let menu = Menu::new()
  .add_native_item(MenuItem::Copy)
  .add_item(CustomMenuItem::new("hide", "Hide"))
  .add_submenu(submenu);
```

### すべてのウィンドウにメニューを追加する

定義されたメニューは、 `tauri::Builder` 構造の `メニュー` API を使用して、すべてのウィンドウに設定できます。

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    .menu(menu)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### 特定のウィンドウにメニューを追加する

ウィンドウを作成し、使用するメニューを設定できます。 これにより、アプリケーションウィンドウごとに特定のメニューセットを定義できます。

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri::WindowBuilder;

fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    .setup(|app| {
      WindowBuilder::new(
        app,
        "main-window".to_string(),
        tauri::WindowUrl::App("index.html".into()),
      )
      .menu(menu)
      .build()?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### カスタムメニューアイテムのイベントを再生中

各 `CustomMenuItem` はクリックされたときにイベントをトリガーします。 `on_menu_event` API を使用して、グローバル `tauri::Builder` または特定のウィンドウのいずれかでこれらを処理します。

#### グローバルメニューでイベントを再生中

```rust
use tauri::{CustomMenuItem, Menu, MenuItem};

fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    .menu(menu)
    .on_menu_event(|event| {
      match event.menu_item_id() {
        "quit" => {
          std::process::exit(0);
        }
        "close" => {
          event.window().close().unwrap();
        }
        _ => {}
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

#### ウインドウメニューでイベントを再生中

```rust
use tauri::{CustomMenuItem, Menu, MenuItem};
use tauri::{Manager, WindowBuilder};

fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    .setup(|app| {
      let window = WindowBuilder::new(
        app,
        "main-window".to_string(),
        tauri::WindowUrl::App("index.html".into()),
      )
      .menu(menu)
      .build()?;
      let window_ = window.clone();
      window.on_menu_event(move |event| {
        match event.menu_item_id() {
          "quit" => {
            std::process::exit(0);
          }
          "close" => {
            window_.close().unwrap();
          }
          _ => {}
        }
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### メニュー項目を更新中

`Window` 構造体には `menu_handle` メソッドがあり、メニュー項目を更新することができます。

```rust
fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    .menu(menu)
    .setup(|app| {
      let main_window = app.get_window("main").unwrap();
      let menu_handle = main_window.menu_handle();
      std::thread::spawn(move || {
        // you can also `set_selected`, `set_enabled` and `set_native_image` (macOS only).
        menu_handle.get_item("item_id").set_title("New title");
      });
      Ok(())
    })
}
```
