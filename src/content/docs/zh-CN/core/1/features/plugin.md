# Tauri Plugins

插件允许您连接到Tauri应用程序生命周期并引入新命令。

## 使用插件

要使用插件，只需将插件实例传递到应用程序的 `插件` 方法：

```rust
fn main() v.
  tauri::Builder::default()
    .plugin(my_awesome_plugin::init())
    .run(tauri::generate_context!())
    .expect("运行失败");
}
```

## 写入插件

插件是可重用的 Tauri API 扩展，解决常见问题。 他们也是构建你的代码基础的非常方便的方式！

如果你打算与他人分享你的插件，我们提供一个现成的模板！ 安装tauri-cli 刚刚运行：

```shell
tauri插件init --name 棒极了
```

### API 包

默认情况下，您的插件的用户可以调用所提供的命令，如：

```js
从 '@tauri-apps/api' 导入 { invoke }
调用('plugin:awesome|do_something')
```

在这里， `超棒的` 将被你的插件名称所替代。

但这并不十分方便，所以插件通常提供一个所谓的 _API 包_， 一个能够方便地访问您的命令的 JavaScript 包。

> 这方面的一个例子是 [tauri插件商店](https://github.com/tauri-apps/tauri-plugin-store)，它为访问一个商店提供了方便的类结构。 你可以用附带的 javascript API 包来手动手势插件，像这样：

```shell
tauri插件init --name 超棒的--api
```

## 写入插件

使用 `tauri::plugin::Builder` 你可以定义类似于如何定义应用程序的插件：

```rust
使用tauri:::->
  插件：:{Builder, TauriPlugin},
  Runtime,
};

// 如果你选择扩展 API 的话插件自定义命令处理程序：

#[tauri::command]
// 这将通过 `invoicke('plugin:awesome|initialize')`访问。
// 其中`awesome` 是插件名称。
fn initialize() {}

#[tauri::command]
// 这将可以通过 `invoicke('plugin:awesome|do_something')`访问。
fn do_something() {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    .invoke_handler(tauri::generate_handler![initialize, do_something])
    .build()
}
```

插件可以设置和保持状态，就像您的应用可以：

```rust
使用tauri:::●
  插件::{Builder, TauriPlugin},
  AppHandle, Manager, Runti, State,
};

#[articive(Default)]
struct MyState {}

#[tauri::command]
// 这将通过 `invotke('plugin:awesome|do_something'）`访问。
fn do_some<R: Runtime>(_app: AppHandle<R>, 状态: State<'_, MyState>) }
  // 你可以在这里访问 `MyState` !
}

pub fn init<R: Runtime>() -> TauriPlugin<R> 然后
  Builder::new("超棒")
    . nvoke_handler(tauri::generate_handler![do_something])
    etup(|app_handle|
      // 设置插件特定状态在这里
      app_handle。 anage(MyState::default());
      Ok(())
    })
    .build()
}
```

### 公约

- crate 导出一个 `init` 方法来创建插件。
- 插件应该有一个 `tauri-plugin-` 前缀的明确名称。
- 在 `Cargo.toml`/`package.json` 中包含 `tauri插件` 关键词。
- 用英文记录你的插件。
- 添加示例应用展示你的插件。

### 高级版

而不是依靠 `tauri::plugin::TauriPlugin` 结构由 `tauri::plugin::Builder::build`你可以实现 `tauri::plugin::plugin` 自己。 这使您能够完全控制相关的数据。

请注意， `插件` 特性上的每个函数都是可选的，但 `名称` 函数除外。

```rust
使用tauri::{plugin::{Plugin, Result as PluginResult}, Runtime, PageLoadPayload, Window, Invoke, AppHandle};

struct MyAwesomplugin<R: Runtime> 让您
  invoke_handler: Box<dyn Fn(Invoke<R>) + 发送 + 同步>,
  // 插件状态 配置字段
}

// 如果您选择扩展 API ，插件自定义命令处理程序。
#[tauri::command]
// 这将可以通过 `invotke('plugin:awesome|initialize')`访问。
// 其中`awesome` 是插件名称。
fn initialize() {}

#[tauri::command]
// 这将可以通过 `invoicke('plugin:awesome|do_something')`访问。
fn do_something() {}

impl<R: Runtime> MyAwesomPlugin<R> Power
  // 您可以在此处添加配置字段
  // 见 https://doc。 ust-lang.org/1.0.0/style/ownership/builders。 tml
  pub fn new() -> Self 然后
    Self Power
      invoke_handler: Box::new(tauri::generate_handler! 初始化, do_something]),
    }
  }
}

impl<R: Runtime> 插件<R> for MyAwesominplugin<R> 然后
  / / / 插件名称。 必须在 `invoke` 调用中定义和使用。
  fn name(&self) -> &'static str @un.org
    "超棒"
  }

  /// 用于初始化评估的 JS 脚本。
  /// Useful when your plugin is accessible through `window`
  /// or needs to perform a JS task on app initialization
  /// e.g. "window.awesomePlugin = { ... the plugin interface }"
  fn initialization_script(&self) -> Option<String> {
    None
  }

  /// initialize plugin with the config provided on `tauri.conf.json > plugins > $yourPluginName` or the default value.
  fn 初始化(&mut self, app: &AppHandle<R>, config: serde_json:::value-> PluginResult结果<()> }
    Ok(())
  }

  /// 在窗口创建时被调用的回调。
  已创建fn (&mut self, window: window<R>) {}

  // 在 web 视图执行导航时被调用回调。
  fn on_page_load(&mut self, window: window<R>, payload: PageLoadPayload) {}

  /// 扩展调用处理程序。
  fn extend_api(&mut self, message: Invoke<R>)
    (self.invoke_handler) (message)
  }
}
```
