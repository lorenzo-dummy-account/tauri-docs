# 从前端拨打Rust

Tauri provides a simple yet powerful `command` system for calling Rust functions from your web app. 命令可以接受参数和返回值。 他们也可以返回错误并且是 `异步`。

## 基本示例

命令在您的 `src-tauri/src/main.rs` 文件中定义。 若要创建一个命令，只需添加一个函数并使用 `#[tauri::command]` 注释：

```rust
#[tauri::command]
fn my_custom_command() {
  println!("I was invoked from JS!");
}
```

您必须向生成器函数提供您的命令列表：

```rust
/ 也是主要的。 s
fn main() v.
  tauri::Builder::default()
    // 这是你在你的命令中传递的位置
    . nvoke_handler(tauri::generate_handler![my_custom_command])
    run(tauri::generate_context!())
    .expect("运行应用失败");
}
```

现在，您可以从 JS 代码中调用命令：

```js
// 当使用 Tauri API npm 包时：
从 '@tauri-apps/api/tauri' 导入 { invoke }
// 当使用 Tauri 全局脚本时(如果不使用 npm 包)
// 请务必设置 'build。 ithGlobalTauri` in `tauri.conf.json` 中的ithGlobalTauri` 到true
const reference = window 。__TAURI__.reflect

// Invoke the 命令
invoke('my_custom_command')
```

## 传递参数

您的命令处理程序可以使用参数：

```rust
#[tauri:::command]
fn my_custom_command(invoke_message: String) }
  println!("我是在 JS中被调用的，消息是：{}", invoke_message);

```

参数应该传递为 JSON 对象，使用骆驼峰键：

```js
援用('my_custom_command', })
```

参数可以是任何类型的，只要它们实现 [`服务器：:反序列`][]。

## 返回数据

命令处理程序也可以返回数据：

```rust
#[tauri:::command]
fn my_custom_command() -> String 当中，
  "Hello from Rust!".into()
}
```

`调用` 函数返回用返回值解析的承诺：

```js
调用('my_custom_command').then(消息) => console.log(消息))
```

返回的数据可以是任何类型的，只要它实现 [`服务器：序列化`][]。

## 错误处理

如果您的处理程序可能失败，需要能够返回错误，请返回函数 `结果`:

```rust
#[tauri:::command]
fn my_custom_command() -> 结果<String, String> }
  // 如果出现错误
  错误("这个失败!). nto())
  // 如果它正常工作
  Ok("此工作!".into())
}
```

如果命令返回一个错误，承诺将被拒绝，否则它会解决：

```js
调用('my_custom_command')
  .then((message) => console.log(message))
  .catch((error) => console.error(error))
```

## 异步命令

:::note

异步命令是使用 [`async_runtime::出生`][] 在单独的线程上执行的。 没有 _async_ 关键字的命令是在主线程上执行的，除非定义为 _#[tauri::command(async)]_

:::

如果您的命令需要异步运行，只需声明它为 `异步`：

```rust
#[tauri:::command]
async fn my_custom_command() }
  // 调用另一个异步函数并等待它完成
  让结果= some_async_func(). 等待。
  打印机!("结果: {}", 结果);
}
```

因为从JS中调用命令已经返回了一个许诺，它就像任何其他命令一样：

```js
调用('my_custom_command').then(() => console.log('完整!'))
```

## 在命令中访问窗口

命令可以访问调用消息的 `窗口` 实例：

```rust
#[tauri::command]
async fn my_custom_command(window: tauri::Window) 然后
  println!("Window: {}", window.label());

```

## 在命令中访问应用程序句柄。

命令可以访问 `应用程序句柄` 实例：

```rust
#[tauri:::command]
async fn my_custom_command(app_handle: tauri::AppHandle) }
  let app_dir = app_handle.path_resolver().app_dir();
  使用 tauri::GlobalShortcutManager;
  app_handle.global_shortcut_manager().register("CTRL + U", 移动|| {});
}
```

## 访问管理状态

Tauri可以在 `tauri::Builder` 上使用 `管理` 功能来管理状态。 可以使用 `tauri::state` 在命令上访问状态：

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

## 创建多个命令

`tauri::generate_handler!` macro 需要一系列命令。 要注册 多个命令，您不能多次调用调用处理程序。 只有最后一次 通话。 您必须将每个命令传递给 `tauri::generate_handler的单个调用！`

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

## 完整示例

上述任何或所有功能都可以组合在一起：

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
// 从JS

调用调用('my_custom_command', vol
  number: 42,
})
  . hen(es) =>
    控制台。 og(`短信: ${res.message}, Other V: ${res.other_val}`)
  )
  .catch((e) => console.error(e))
```

[`async_runtime::出生`]: https://docs.rs/tauri/1/tauri/async_runtime/fn.spawn.html
[`服务器：序列化`]: https://docs.serde.rs/serde/trait.Serialize.html
[`服务器：:反序列`]: https://docs.serde.rs/serde/trait.Deserialize.html
