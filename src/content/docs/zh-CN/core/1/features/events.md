# 事件

Tauri事件系统是一个多生产商多消费者通信原始系统，可以在前端和后端之间传递信息。 它类似于指挥系统。 但有效载荷类型检查必须写在事件处理器上，并简化从后端到前端的通信。 工作就像一个频道。

Tauri应用程序可以监听和发布全局和窗口特定事件。 前端和后端的用法描述如下。

## 前端

事件系统可以在 `事件` 和 `窗口` 的前端访问 `@tauri-apps/api` 软件包。

### 全球活动

要使用全局事件频道，导入 `事件` 模块并使用 `emit` 和 `监听` 函数：

```js
import { emit, listen } from '@tauri-apps/api/event'

// listen to the `click` event and get a function to remove the event listener
// there's also a `once` function that subscribes to an event and automatically unsubscribes the listener on the first event
const unlisten = await listen('click', (event) => {
  // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
  // event.payload is the payload object
})

// emits the `click` event with the object payload
emit('click', {
  theMessage: 'Tauri is awesome!',
})
```

### 窗口特定事件

在 `窗口` 模块上曝光了特定窗口事件。

```js
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'

// emit an event that are only visible to the current window
appWindow.emit('event', { message: 'Tauri is awesome!' })

// 创建一个新的网络视图窗口，并且仅将事件释放到该窗口
网络视图= 新的 WebviewWindow('window')
webview.emit('event')
```

## 后端

在后端，全局事件频道在 `App` 结构上曝光， 和特定窗口事件可以使用 `窗口` 特性来发布。

### 全球活动

```rust
使用 tauri::Manager;

// payload 类型必须实现 `Serialize` 和 `Clone` 。
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      // listen to the `event-name` (emitted on any window)
      let id = app.listen_global("event-name", |event| {
        println!("got event-name with payload {:?}", event.payload());
      });
      // unlisten to the event using the `id` returned on the `listen_global` function
      // an `once_global` API is also exposed on the `App` struct
      app.unlisten(id);

      // emit the `event-name` event to all webview windows on the frontend
      app.emit_all("event-name", Payload { message: "Tauri is awesome!".into() }).unwrap();
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

### 窗口特定事件

要使用特定窗口事件频道，可以在命令处理程序或 `get_window` 函数获得 `窗口` 对象：

```rust
使用tauri::{Manager, Window};

// payload 类型必须实现 `Serialize` 和 `Clone` 。
#[arrive(Clone，serde::Serialize)]
构建有效载荷
  消息：字符串，
}

// 在命令上包含后台流程。 并将周期性事件仅发送到使用命令的窗口
#[tauri::command]
fn init_process(window: Window)
  std::thread::spawn(move ||
    loop 然后返回
      window. mit("event-name", Payload Public, message: "Tauri is awesome!".into() }). nwraw();
    }
  };
}

fn main() vol
  tauri::Builder::default()
    . etup(|app|
      // `main` 这里是窗口标签； 它是在窗口创建或在“tauri”下定义的。 onf.json`
      // 默认值是 `main` 。 note that it must be unique
      let main_window = app.get_window("main").unwrap();

      // listen to the `event-name` (emitted on the `main` window)
      let id = main_window.listen("event-name", |event| {
        println!("got window event-name with payload {:?}", event.payload());
      });
      // unlisten to the event using the `id` returned on the `listen` function
      // an `once` API is also exposed on the `Window` struct
      main_window.unlisten(id);

      // emit the `event-name` event to the `main` window
      main_window.emit("event-name", Payload { message: "Tauri is awesome!".into() }).unwrap();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![init_process])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```
