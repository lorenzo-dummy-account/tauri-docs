import HelloTauriWebdriver from '@site/static/img/webdriver/hello-tauri-webdriver.png'

# セットアップ例

このアプリケーション例では、既存のプロジェクトに WebDriver テストを追加することに焦点を当てています。 To have a project to test in the following two sections, we will set up an extremely minimal Tauri application for use in our testing. Tauri CLI は使用せず、フロントエンドの依存関係やビルド手順を使用せず、その後は アプリケーションをバンドルしません。 これは、既存の アプリケーションにWebDriverテストを追加することを示すために、正確に最小限のスイートを紹介することです。

このサンプルガイドに表示される内容を活用した完成したプロジェクトを見たい場合。 は https://githubを見ることができます。 om/chippers/hello_tauri.

## 貨物プロジェクトの初期化

このサンプルアプリケーションを格納するための新しいバイナリ Cargo プロジェクトを作成したいと考えています。 これは コマンド行から `cargo new hello-tauri-webdriver --bin`で簡単に行えます。 最小限のバイナリCargoプロジェクトを構築します。 この ディレクトリは、このガイドの残りの作業ディレクトリとして機能します 実行するコマンドが 新しい `hello-tauri-webdriver/` ディレクトリ内にあることを確認してください。

## 最小限のフロントエンドの作成

サンプルアプリケーションのフロントエンドとして機能する最小限の HTML ファイルを作成します。 また、WebDriverのテスト中に、このフロントエンドからいくつかのものを使用します 。

最初に、アプリケーションの牡牛座部分を構築したら必要になることがわかっている私たちの牡牛座 `distDir` を作成しましょう。 `mkdir dist` は、 `dist/` という新しいディレクトリを作成し、次の `index.html` ファイルを配置します。

`dist/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello Tauri!</title>
    <style>
      body {
        /* Add a nice colorscheme */
        background-color: #222831;
        color: #ececec;

        /* Make the body the exact size of the window */
        margin: 0;
        height: 100vh;
        width: 100vw;

        /* Vertically and horizontally center children of the body tag */
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <h1>Hello, Tauri!</h1>
  </body>
</html>
```

## 貨物プロジェクトに牡牛座を追加する

次に、貨物プロジェクトを牡牛座プロジェクトに変えるために必要なアイテムを追加します。 First, is adding the dependencies to the Cargo Manifest (`Cargo.toml`) so that Cargo knows to pull in our dependencies while building.

`Cargo.toml`:

```toml
[package]
name = "hello-tauri-webdriver"
version = "0.1.0"
edition = "2021"
rust-version = "1.56"

# Needed to set up some things for Tauri at build time
[build-dependencies]
tauri-build = "1"

# The actual Tauri dependency, along with `custom-protocol` to serve the pages.
[dependencies]
tauri = { version = "1", features = ["custom-protocol"] }

# Make --release build a binary that is small (opt-level = "s") and fast (lto = true).
# これは完全に任意ですが、アプリケーションのテストが
# 一般的なリリース設定に近いことを示しています。 注意: コンパイルが遅くなります。
[profile.release]
incremental = false
codegen-units = 1
panic = "abort"
opt-level = "s"
lto = true
```

お気づきのように、 `[build-dependency]` を追加しました。 ビルド依存性を使用するには、ビルド スクリプトから使用する必要があります。 `build.rs` で作成します。

`build.rs`:

```rust
fn main() {
    // 再コンパイルのための `dist/` ディレクトリのみを見てください。不要な変更を防ぎます。
    // 他のプロジェクトのサブディレクトリでファイルを変更したときに変更します。
    println!("cargo:rerun-if-changed=dist");

    // 牡牛座のビルド時ヘルパーを実行する
    tauri_build::build()
}
```

Cargo プロジェクトでは、すべてのセットアップで牡牛座の依存関係を構築する方法が分かりました。 実際のプロジェクトコードに牡牛座を設定することによって、 この最小限の例を牡牛座アプリケーションに作り終えましょう。 この牡牛座機能を追加するために、 `src/main.rs` ファイルを編集します。

`src/main.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("unable to run Tauri application");
}
```

とてもシンプルですよね？

## Tauri Configuration

アプリケーションを正常に構築するには2つのことが必要になります。 まず、アイコンファイルが必要です。 次のパートには任意の PNG を使用して、 `icon.png` にコピーできます。 典型的には、プロジェクトを作成するために Tauri CLI を使用するときに、これは足場の一部として提供されます。 To get the default Tauri icon, we can download the icon used by the Hello Tauri example repository with the command `curl -L "https://github.com/chippers/hello_tauri/raw/main/icon.png" --output icon.png`.

牡牛座の重要な設定値を設定するには、 `tauri.conf.json` が必要です。 ここでも、 は通常、 `tauri init` scaffolding コマンドから生成されますが、ここでは独自の最小限の設定 を作成します。

`tauri.conf.json`:

```json
{
  "build": {
    "distDir": "dist"
  },
  "tauri": {
    "bundle": {
      "identifier": "studio.tauri.hello_tauri_webdriver",
      "icon": ["icon.png"]
    },
    "allowlist": {
      "all": false
    },
    "windows": [
      {
        "width": 800,
        "height": 600,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

これをいくつか見てみましょう 先ほど作成した `dist/` ディレクトリを `distDir` プロパティとして見ることができます。 We set a bundle identifier so that the built application has a unique id and set the `icon.png` as the only icon. Tauri APIや機能を使用していないため、 `allowlist` で `"all": false` を設定して無効にします。 window 値は、適切なデフォルト値を使用して作成される単一のウィンドウを設定するだけです。

この時点で、実行時に簡単な挨拶を表示する基本的な Hello World アプリケーションがあります。

## サンプルアプリケーションの実行

正しく実行したことを確認するために、このアプリケーションをビルドしましょう！ これは `--release` アプリケーションとして実行されます。 は WebDriver テストをリリースプロファイルで実行するためです。 `cargo run --release`を実行し、コンパイルを行うと、 以下のアプリケーションがポップアップするようになります。

<div style={{textAlign: 'center'}}>
  <img src={HelloTauriWebdriver}/>
</div>

_注意: アプリケーションを変更し、Devtoolsを使用する場合。 次に、 `--release` と "Inspect Element" を右クリックメニューで使用できるようにします。_

これで、いくつかのWebDriverフレームワークでこのアプリケーションのテストを開始する準備が整いました。 このガイドは [WebdriverIO](webdriverio) と [Selenium](selenium) の両方を順番に見ていきます。
