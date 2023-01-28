# イベント

Tauriイベントシステムは、フロントエンドとバックエンドの間でメッセージを渡すことができるマルチプロデューサーのマルチコンシューマー通信プリミティブです。 それはコマンドシステムに類似しています しかし、ペイロードの型チェックはイベントハンドラに書かれなければならず、バックエンドからフロントエンドへの通信が簡単になります。 チャネルのように動作します。

牡牛座アプリケーションは、グローバルおよびウィンドウ固有のイベントをリッスンして発生させることができます。 フロントエンドとバックエンドからの使用法については、以下で説明します。

## Frontend

The event system is accessible on the frontend on the `event` and `window` modules of the `@tauri-apps/api` package.

### グローバルイベント

グローバルイベントチャンネルを使用するには、 `イベント` モジュールをインポートし、 `エミット` および `listen` 関数を使用します。

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

### Windows 固有のイベント

Windows 固有のイベントは `window` モジュールに公開されます。

```js
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'

// emit an event that are only visible to the current window
appWindow.emit('event', { message: 'Tauri is awesome!' })

// 新しいWebviewウィンドウを作成し、そのウィンドウにのみイベントを発する
const webview = new WebviewWindow('window')
webview.emit('event')
```

## バックエンド

On the backend, the global event channel is exposed on the `App` struct, and window-specific events can be emitted using the `Window` trait.

### グローバルイベント

```rust
tauri::Manager;

// ペイロードタイプは `Serialize` と `Clone` を実装する必要があります。
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

### Windows 固有のイベント

ウィンドウ固有のイベントチャンネルを使用するには、 `Window` オブジェクトをコマンドハンドラーまたは `get_window` 関数で取得できます。

```rust
tauri::{Manager, Window};

// ペイロードタイプは `Serialize` と `Clone` を実装する必要があります。
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

// init a background process on the command, and emit periodic events only to the window that used the command
#[tauri::command]
fn init_process(window: Window) {
  std::thread::spawn(move || {
    loop {
      window.emit("event-name", Payload { message: "Tauri is awesome!".into() }).unwrap();
    }
  });
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      // `main` here is the window label; it is defined on the window creation or under `tauri.conf.json`
      // the default value is `main`. note that it must be unique
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
