# フロントエンドから Rust を呼び出す

Tauriは、WebアプリからRust関数を呼び出すためのシンプルでパワフルな `コマンド` システムを提供します。 コマンドは引数を受け取り、値を返すことができます。 また、エラーを返し、 `async` にすることもできます。

## 基本的な例

コマンドは `src-tauri/src/main.rs` ファイルに定義されています。 コマンドを作成するには、関数を追加して `#[tauri::command]` で注釈を付けてください。

```rust
#[tauri::command]
fn my_custom_command() {
  println!("I was invoked from JS!");
}
```

以下のように、ビルダー関数にコマンドのリストを提供する必要があります。

```rust
// Also in main.rs
fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

これで、JSコードからコマンドを呼び出すことができます。

```js
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'
// When using the Tauri global script (if not using the npm package)
// Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
const invoke = window.__TAURI__.invoke

// Invoke the command
invoke('my_custom_command')
```

## 引数のパス

コマンドハンドラは引数を取ることができます:

```rust
#[tauri::command]
fn my_custom_command(invoke_message: String) {
  println!("私はJSから呼び出され、このメッセージ: {}", invoke_message);
}
```

引数は camelCase キーを持つ JSON オブジェクトとして渡す必要があります。

```js
invoke('my_custom_command', { invokeMessage: 'Hello!' })
```

[`serde::Deserialize`][] を実装していれば、引数は任意の型にすることができます。

## データを返す

コマンドハンドラは以下のようにデータを返すことができます:

```rust
#[tauri::command]
fn my_custom_command() -> String {
  "Hello from Rust!".into()
}
```

`が` を呼び出すと、返された値で解決する Promise が返されます。

```js
invoke('my_custom_command').then((message) => console.log(message))
```

[`serde::Serialize`][] を実装している限り、返されたデータは任意の型にすることができます。

## エラー処理

ハンドラが失敗し、エラーを返す必要がある場合は、関数に `結果` を返すようにしてください。

```rust
#[tauri::command]
fn my_custom_command() -> Result<String, String> {
  // If something fails
  Err("This failed!".into())
  // If it worked
  Ok("This worked!".into())
}
```

コマンドがエラーを返した場合、promiseは拒否されます。そうでなければ、次のように解決します。

```js
invoke('my_custom_command')
  .then((message) => console.log(message))
  .catch((error) => console.error(error))
```

## 非同期コマンド

:::note

Asyncコマンドは [`async_runtime::spawn`][] を使用して別々のスレッドで実行されます。 _async_ キーワードのないコマンドは、 _#[tauri::command(async)]_ で定義されていない場合、メインスレッドで実行されます。

:::

コマンドを非同期で実行する必要がある場合は、 `async` として宣言してください。

```rust
#[tauri::command]
async fn my_custom_command() {
  // Call another async function and wait for it to finish
  let result = some_async_function().await;
  println!("Result: {}", result);
}
```

JSからコマンドを呼び出すとすでにPromiseが返されるので、他のコマンドと同じように動作します。

```js
invoke('my_custom_command').then(() => console.log('Completed!'))
```

## コマンドでウィンドウにアクセスする

コマンドは、メッセージを呼び出した `Window` インスタンスにアクセスできます。

```rust
#[tauri::command]
async fn my_custom_command(window: tauri::Window) {
  println!("Window: {}", window.label());
}
```

## コマンドでAppHandleにアクセスする

コマンドは `AppHandle` インスタンスにアクセスできます:

```rust
#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle) {
  let app_dir = app_handle.path_resolver().app_dir();
  use tauri::GlobalShortcutManager;
  app_handle.global_shortcut_manager().register("CTRL + U", move || {});
}
```

## 管理状態へのアクセス

Tauriは `manage` 関数 on `tauri::Builder` を使用して状態を管理することができます。 状態は `tauri::State` を使用してコマンドでアクセスできます:

```rust
struct MyState(String);

#[tauri::command]
fn my_custom_command(state: tauri::State<MyState>) {
  assert_eq!(state.0 == "some state value", true);
}

fn main() {
  tauri::Builder::default()
    .manage(MyState("some state value".into()))
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## 複数のコマンドの作成

`tauri::generate_handler!` マクロはコマンドの配列を取ります。 複数のコマンドを 登録するには、invoke_handlerを複数回呼び出すことはできません。 最後の 呼び出しのみが使用されます。 `tauri::generate_handler!` の呼び出しにそれぞれのコマンドを渡す必要があります。

```rust
#[tauri::command]
fn cmd_a() -> String {
    "Command a"
}
#[tauri::command]
fn cmd_b() -> String {
    "Command b"
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![cmd_a, cmd_b])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## 完全な例

上記のすべての機能を組み合わせることができます:

```rust main.rs

struct Database;

#[derive(serde::Serialize)]
struct CustomResponse {
  message: String,
  other_val: usize,
}

async fn some_other_function() -> Option<String> {
  Some("response".into())
}

#[tauri::command]
async fn my_custom_command(
  window: tauri::Window,
  number: usize,
  database: tauri::State<'_, Database>,
) -> Result<CustomResponse, String> {
  println!("Called from {}", window.label());
  let result: Option<String> = some_other_function().await;
  if let Some(message) = result {
    Ok(CustomResponse {
      message,
      other_val: 42 + number,
    })
  } else {
    Err("No result".into())
  }
}

fn main() {
  tauri::Builder::default()
    .manage(Database {})
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

```js
// JS

invoke('my_custom_command', {
  number: 42,
})
  . hen(res) =>
    コンソール。 og(`Message: ${res.message}, Other Val: ${res.other_val}`)
  )
  .catch((e) => console.error(e))
```

[`async_runtime::spawn`]: https://docs.rs/tauri/1/tauri/async_runtime/fn.spawn.html
[`serde::Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`serde::Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html
