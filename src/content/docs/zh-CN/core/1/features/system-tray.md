# 系统托盘

本地应用程序系统托盘。

### 设置

配置 `systemTray` 对象在 `tauri.conf.json`:

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

`iconAsTemplate` 是一个布尔值，用于决定图像在macOS上是否表示一个 [模板图像][]。

#### Linux 设置

在 Linux 上，您需要安装 `libayatana-appindicate` 或 `libappindicator` 软件包。 Tauri决定在运行时使用哪个软件包，如果两个软件包都安装了， `libayatana` 是首选软件包。

默认情况下，Debian 软件包 (`.deb` 文件)将添加依赖于 `libayatana-appindicator3-1`。 要创建一个 Debian 软件包目标 `libappindicator3`, 设置 `TAURI_TRAY` 环境变量为 `libappindicator3`

AppImage Bundle自动嵌入已安装的托盘库，您也可以使用 `TAURI_TRAY` 环境变量手动选择它。

:::info

`libappindicator3` 未维护，在一些磁盘上不存在，例如 `debian11`, 但是 `libayatana-appindicator` 在旧版本中不存在。

:::

### 创建系统托盘

要创建本地系统托盘，请导入 `系统托盘` 类型：

```rust
使用 tauri::SystemTray;
```

初始化新托盘实例：

```rust
let tray = SystemTray::new();
```

### 配置系统托盘上下文菜单

您可选择添加右键托盘图标时可见的上下文菜单。 导入 `SystemTrayMenu 菜单`, `SystemTrayMenuitem` 和 `CustomMenuitem` 类型:

```rust
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
```

创建 `SystemTrayMenu`:

```rust
// 这里`quit".to_string()`定义菜单项id，第二个参数是菜单项标签。
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let hide = CustomMenuItem::new("hide".to_string(), "Hide");
let tray_menu = SystemTrayMenu::new()
  .add_item(quit)
  .add_native_item(SystemtrayMenutem:::Separator)
  .add_item(hide);
```

将托盘菜单添加到 `SystemTray` 实例：

```rust
let tray = SystemTray::new().with_menu(tray_menu);
```

### 配置应用系统托盘

创建的 `SystemTray` 实例可以使用 `system_tray` API在 `tauri::Builder` 结构：

```rust
使用tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

fn main() v.
  let tray_menu = SystemTrayMenu::new(); // 在此处插入菜单项
  let system_tray = SystemTray::new()
    ith_menu(tray_menu);
  tauri::Builder::default()
    .system_tray(system_tray)
    . un(tauri::generate_context!())
    .expect("运行tauri应用程序时出错");
}
```

### 正在监听系统托盘事件

每一个 `自定义菜单项` 在点击时触发一个事件。 另外，Tauri发布托盘图标点击事件。 使用 `on_system_tray_event` API 来处理他们：

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
      } => 。
        println!("system tray received a left click");
      }
      SystemTrayEvent:::Rightclick volv.
        position: _,
        size: _,
...
      } => 。
        println!("system tray received a right click");
      }
      SystemTrayEvent::DoubleClick Windows
        position: _,
        size: _,
...
      } => 。
        println!("system tray received a two click");
      }
      SystemTrayEvent:::MenuItemClick id ... } => {
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

### 更新系统托盘

`AppHandle` 结构有一个 `tray_hande` 方法， 返回一个句柄到系统托盘，允许更新托盘图标和上下文菜单项：

#### 正在更新上下文菜单项

```rust
使用tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
使用tauri::Manager;

fn main() v.
  let tray_menu = SystemTrayMenu::new(); // 在此处插入菜单项
  tauri::Builder::default()
    ystem_tray(Systemtray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match 活动卷定于
      SystemTrayEvent:::MenuItemClick ID... } => {
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
            item_handle.set_title("显示")。 nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("运行tauri应用程序时出错");
}
```

#### 更新托盘图标

请注意，您需要将 `icon-ico` 或 `icon-png` 功能标志添加到您货物中的 tauri依赖之处。 oml 可以使用 `图标：Raw`

```rust
app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!) ("../path/to/myicon.ico").to_vec())).unwrawrapp();
```

### 关闭所有窗口后保持应用程序在后台运行

默认情况下，当上一个窗口关闭时，tauri会关闭应用程序。 如果您的应用应该在后台运行，您可以调用 `api.prevent_close()` 就像这样：

```rust
tauri::Builder::default()
  .build(tauri::generate_context!())
  .expect("building tauri应用程序时发生错误")
  .run(|_app_handle, event| match 事件 *
    tauri::RunEvent::ExitRequest api, ... } => 。
      api.prevent_exit();
    }
    _ => {}
});
```

[模板图像]: https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc
