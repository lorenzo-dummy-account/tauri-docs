# Tauri Plugins

プラグインを使用すると、牡牛座アプリケーションのライフサイクルにフックし、新しいコマンドを導入できます。

## プラグインの使用

プラグインを使用するには、Appの `プラグイン` メソッドにプラグインインスタンスを渡してください。

```rust
fn main() {
  tauri::Builder::default()
    .plugin(my_awesome_plugin::init())
    .run(tauri::generate_context!())
    expect("アプリケーションを実行できませんでした");
}
```

## プラグインを書く

プラグインは、一般的な問題を解決するTauri APIの再利用可能な拡張機能です。 コードベースを構成するのに非常に便利な方法です。

プラグインを他の人と共有する場合は、既製のテンプレートを提供します! Tauri-cli がインストールされているだけで実行されます:

```shell
tauriプラグインinit --name awice
```

### APIパッケージ

デフォルトでは、プラグインの利用者は以下のように指定されたコマンドを呼び出すことができます。

```js
import { invoke } from '@tauri-apps/api'
invoke('plugin:awesome|do_something')
```

`awesome` はプラグイン名に置き換えられます。

これはあまり便利ではありませんが、プラグインが _API パッケージ_を提供することは一般的です。 コマンドに便利なアクセスを提供する JavaScript パッケージ。

> 例えば、 [tauri-plugin-store](https://github.com/tauri-apps/tauri-plugin-store)は、ストアにアクセスするための便利なクラス構造を提供します。 以下のように、追加された javascript API パッケージを使って、tauri プラグインを足場に置くことができます。

```shell
tauriプラグインinit --name aweson -api
```

## プラグインを書く

`tauri::plugin::Builder` を使用すると、アプリの定義と同様のプラグインを定義できます。

```rust
use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

// the plugin custom command handlers if you choose to extend the API:

#[tauri::command]
// this will be accessible with `invoke('plugin:awesome|initialize')`.
// where `awesome` is the plugin name.
fn initialize() {}

#[tauri::command]
// これは `invoke('plugin:awesome|do_something')` でアクセスできます。
fn do_something() {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    .invoke_handler(tauri::generate_handler![initialize, do_something])
    .build()
}
```

プラグインはアプリと同じように状態をセットアップして維持できます：

```rust
use tauri::{
  plugin::{Builder, TauriPlugin},
  AppHandle, Manager, Runtime, State,
};

#[derive(Default)]
struct MyState {}

#[tauri::command]
// this will be accessible with `invoke('plugin:awesome|do_something')`.
fn do_something<R: Runtime>(_app: AppHandle<R>, state: State<'_, MyState>) {
  // you can access `MyState` here!
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    .invoke_handler(tauri::generate_handler![do_something])
    .setup(|app_handle| {
      // setup plugin specific state here
      app_handle.manage(MyState::default());
      Ok(())
    })
    .build()
}
```

### コンベンション

- 木箱はプラグインを作成するために `init` メソッドをエクスポートします。
- プラグインは `tauri-plugin-` 接頭辞で明確な名前を持つ必要があります。
- `Cargo.toml` / `package.json`に`tauri-plugin` キーワードを含めます。
- プラグインを英語で文書化します。
- プラグインを紹介するサンプルアプリを追加します。

### 高度な設定

Instead of relying on the `tauri::plugin::TauriPlugin` struct returned by `tauri::plugin::Builder::build`, you can implement the `tauri::plugin::Plugin` yourself. これにより、関連するデータを完全に制御できます。

`プラグイン` トレイトの各関数は、 `name` 関数を除いて任意であることに注意してください。

```rust
use tauri::{plugin::{Plugin, Result as PluginResult}, Runtime, PageLoadPayload, Window, Invoke, AppHandle};

struct MyAwesomePlugin<R: Runtime> {
  invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
  // plugin state, configuration fields
}

// the plugin custom command handlers if you choose to extend the API.
#[tauri::command]
// これは `invoke('plugin:awesome|initialize')` でアクセスできます。
// where `awesome` is the plugin name.
fn initialize() {}

#[tauri::command]
// これは `invoke('plugin:awesome|do_something')` でアクセスできます。
fn do_something() {}

impl<R: Runtime> MyAwesomePlugin<R> {
  // you can add configuration fields here,
  // see https://doc.rust-lang.org/1.0.0/style/ownership/builders.html
  pub fn new() -> Self {
    Self {
      invoke_handler: Box::new(tauri::generate_handler![initialize, do_something]),
    }
  }
}

impl<R: Runtime> Plugin<R> for MyAwesomePlugin<R> {
  /// The plugin name. `invoke` 呼び出しで定義して使用する必要があります。
  fn name(&self) -> &'static str {
    "awesome"
  }

  /// 初期化時に評価する JS スクリプト。
  /// `window` でプラグインにアクセスできるときに便利です。
  /// またはアプリの初期化で JS タスクを実行する必要があります。
  /// e. ウィンドウを開きます。 wesomePlugin = { ... the plugin interface }"
  fn initialization_script(&self) -> Option<String> {
    None
  }

  /// `tauriで提供される設定でプラグインを初期化します。 onf.json > plugins > $yourPluginName` またはデフォルト値。
  fn initialize(&mut self, app: &AppHandle<R>, config: serde_json::Value) -> PluginResult<()> {
    Ok())
  }

  /// Window が作成されたときに呼び出されたコールバック。
  fn created(&mut self, window: Window<R>) {}

  /// webview がナビゲーションを実行したときに呼び出されたコールバック。
  fn on_page_load(&mut self, window: Window<R>, payload: PageLoadPayload) {}

  /// 呼び出しハンドラを拡張します。
  fn extend_api(&mut self, message: Invoke<R>) {
    (self.invoke_handler)(message)
  }
}
```
