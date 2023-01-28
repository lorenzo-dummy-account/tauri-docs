import Command from '@theme/Command'

# アプリケーションのデバッグ

牡牛座のすべての動く部分で, あなたはデバッグを必要とする問題に遭遇する可能性があります. エラーの詳細が印刷されている多くの場所があり、Tauriはデバッグプロセスをより簡単にするためのいくつかのツールが含まれています。

## Rust コンソール

エラーを探す最初の場所は、Rust コンソールにあります。 これは実行した端末で、例えば `tauri dev` などです。 次のコードを使用して、Rust ファイル内からそのコンソールに何かを出力できます。

```rust
println!("Rustからのメッセージ: {}", msg);
```

時々、Rust コードにエラーがあるかもしれませんし、Rust コンパイラはたくさんの情報を与えることができます。 たとえば、 `tauri dev` がクラッシュした場合、LinuxやmacOSでこのように再実行できます。

```shell
RUST_BACKTRACE=1 tauri dev
```

Windowsの場合はこんな感じです

```shell
はいけいを RUST_BACKTRACE=1
tauri dev
```

このコマンドは、スタックトレースの詳細を提供します。 一般的に、Rust コンパイラは次のように問題に関する詳細な情報を 与えることであなたを助けます。

```
error[E0425]: cannot find value `sun` in this scope
  --> src/main.rs:11:5
   |
11 |     sun += i.to_string().parse::<u64>().unwrap();
   |     ^^^ help: a local variable with a similar name exists: `sum`

error: aborting due to previous error

For more information about this error, try `rustc --explain E0425`.
```

## WebView Console

WebViewで右クリックし、 `要素の調査` を選択します。 これにより、ChromeまたはFirefoxの開発ツールと同様のウェブインスペクターが開きます。 You can also use the `Ctrl + Shift + i` shortcut on Linux and Windows, and `Command + Option + i` on macOS to open the inspector.

インスペクターはプラットフォームに特化しており、Linux上でwebkit2gtk WebInspector、macOS上でSafariのインスペクタ、Windows上でMicrosoft Edge DevToolsをレンダリングします。

### 開発ツールをプログラム的に開く

インスペクターウィンドウの表示を制御するには、 [`Window::open_devtools`][] と [`Window::close_devtools`][] 関数を使用します。

```rust
use tauri::Manager;
tauri::Builder::default()
  .setup(|app| {
    #[cfg(debug_assertions)] // only include this code on debug builds
    {
      let window = app.get_window("main").unwrap();
      window.open_devtools();
      window.close_devtools();
    }
    Ok(())
  });
```

### プロダクションでのインスペクターの使用

デフォルトでは、インスペクタは、Cargo 機能で有効にしない限り、開発ビルドおよびデバッグビルドでのみ有効になります。

#### デバッグビルドを作成

デバッグビルドを作成するには、 `tauri build --debug` コマンドを実行します。

<Command name="build --debug" />

通常のビルドおよび開発プロセスと同様に、このコマンドを初めて実行するときにはビルドに時間がかかりますが、その後の実行では大幅に速くなります。 最終バンドルされたアプリは開発コンソールが有効になっており、 `src-tauri/target/debug/bundle` に置かれています。

ターミナルからビルド済みのアプリを実行することもできます。 Rust コンパイラのノート (エラーの場合) または `println` メッセージを与えます。 ファイル `src-tauri/target/(release|debug)/[app name]` を参照し、コンソールで直接実行するか、ファイルシステム内で実行ファイル自体をダブルクリックします(注:コンソールはこの方法でエラーが発生すると閉じます)。

#### 開発ツール機能を有効にする

:::warning

devtools API は macOS ではプライベートです。 macOS でプライベート API を使用すると、アプリケーションが App Store に受け入れられなくなります。

:::

本番用ビルドで開発ツールを有効にするには、 `src-tauri/Cargo.toml` ファイル内の `devtools` Cargo 機能を有効にする必要があります。

```toml
[dependencies]
tauri = { version = "...", features = ["...", "devtools"] }
```

## コアプロセスのデバッグ

コアプロセスは Rust によって供給されるため、GDB または LLDB を使用してデバッグできます。 VS Code [のデバッグ][] ガイドに従って、LLDB VS Code Extension を使用して牡牛座アプリケーションのコアプロセスをデバッグする方法を学ぶことができます。

[のデバッグ]: ./vs-code.md
[`Window::open_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.open_devtools
[`Window::close_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.close_devtools
