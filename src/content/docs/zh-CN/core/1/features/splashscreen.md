# 分屏界面

如果您的网页可能需要一些时间加载，或者您需要在显示您的主窗口之前在Rust运行初始化过程， 初始屏幕可以改善用户的加载体验。

### 设置

首先，在 `distribut` 中创建 `splashscreen.html` , 其中包含 splashscreen 的 HTML 代码。 然后更新您的 `tauri.conf.json` 就像这样：

```diff
"windows": [
  演变为
    "title": "Tauri App",
    "宽度": 800,
    "高 ": 600,
    "调整大小"：true，
    "全屏"：false,
+ "可见": false // 默认隐藏主窗口
  },
  // 添加初始屏幕窗口
+
+ "宽度": 400,
+ "height": 200,
+ "装饰": false,
+ "url": "splashscreen. tml",
+ "label": "splashscreen"
+ }
]
```

现在，您的主窗口将被隐藏，您的应用程序启动时将显示启动屏幕窗口。 接下来，当您的应用程序准备就绪时，您需要关闭初始屏幕并显示主窗口。 您如何操作取决于您在关闭初始屏幕之前正在等待什么。

### 等待网页

如果您正在等待您的网页代码，您将想要创建一个 `close_splashscreen` [命令](command)。

```rust src-tauri/main.rs
使用tauri::manager;
// 创建命令:
// 此命令必须是异步，以免它在主线程上运行。
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

然后，你可以从你的JS呼叫它：

```js
// 使用 Tauri API npm 包：
从 '@tauri-apps/api/tauri' 导入 { invoke }
// 带有Tauri 全局脚本：
const reference = window__TAURI__引用

文档。 ddEventListener('DOMContentLoadedd', () => }
  // 这将等待窗口加载。 但您可以
  // 在任何您想要的触发器上运行此功能
  调用('close_splashscreen')
})
```

### 正在等待Rust

如果你正在等待 Rust 代码运行， 将其放在 `设置` 函数处理程序中，所以您可以访问 `App` 实例：

```rust src-tauri/main.rs
使用 tauri:::Manager;
fn main() por
  tauri::Builder::default()
    . etup(|app|
      let splashscreen_window = app.get_window ("splashscreen")unwrapp();
      let main_window = app.get_window ("main"). nwrap();
      // 我们在新的任务上执行初始化代码，所以应用程序不会冻结
      tauri::async_runtime::spawn(async move power
        // 将您的应用程序初始化到这里而不是睡眠中 :)
        打印！ “初始化。 .");
        std::thread::sleep(std::time::Duration::from_secs(2));
        打印！ "初始化完成。 );

        // 完成后, 关闭初始屏幕并显示主窗口
        splashscreen_windows。 lose().unwrawind();
        main_wind.show(). nwrap();
      };
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("运行应用失败");
}
```
