# 窗口菜单

本地应用程序菜单可以附加到一个窗口。

### 创建菜单

要创建本地窗口菜单，请导入 `菜单`, `子菜单`, `菜单项` 和 `自定义菜单项` 类型。 `MenuItem` enum 包含一系列特定平台的项目(目前在 Windows 上没有实现)。 `自定义菜单项` 允许您创建自己的菜单项并为它们添加特殊功能。

```rust
使用tauri:{CustomMenuItem, Menu, MenuItem, Submenu};
```

创建 `菜单` 实例：

```rust
// 这里`quit".to_string()`定义菜单项id，第二个参数是菜单项标签。
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let close = CustomMenuItem::new("close".to_string(), "Close");
let submenu::new("File", Menu::new().add_item(quit). dd_item(关闭));
let menu = Menu::new()
  .add_native_item(MenuItem::Copy)
  .add_item(CustomMenuItem:::new("hide", "Hide"))
  .add_submenu(submenu);
```

### 将菜单添加到所有窗口

定义的菜单可以在 `tauri::Builder` 结构上使用 `菜单` API 设置为所有窗口：

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

### 将菜单添加到指定窗口

您可以创建一个窗口并设置要使用的菜单。 这允许为每个应用程序窗口定义一个特定的菜单。

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

### 正在监听自定义菜单项中的事件

每一个 `自定义菜单项` 在点击时触发一个事件。 使用 `on_menu_event` API 来处理他们，或者在全局 `tauri::Builder` 或者在特定窗口上。

#### 聆听全球菜单中的事件

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

#### 正在监听窗口菜单上的事件

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

### 正在更新菜单项

`窗口` 结构有一个 `菜单句柄` 种方法，允许更新菜单项：

```rust
fn main() v.
  let menu = Menu::new(); // 配置菜单
  tauri::Builder::default()
    . enu(菜单)
    .setup(|app|
      let main_window = app.get_window ("main"). nwrawid();
      let menu_hander = main_window. enu_handle();
      std：:thread::spawn(移动||
        // 您也可以`set_selected`, `set_enabled` 和 `set_native_image` (macOS)
        menu_handle.get_item("item_id").set_title("New title");
      });
      Ok(())
    })
}
```
