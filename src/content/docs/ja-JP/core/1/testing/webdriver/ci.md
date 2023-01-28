# 継続的統合

Linuxやプログラムを使って偽のディスプレイを作成する [WebDriver][] テストを [`tauri-driver`][] で CI で実行することができます。 次の例では、 [WebdriverIO][] の例を使用しています。 [以前にビルドした][] と GitHub Actions。

これは以下の仮定を意味します:

1. Tauriアプリケーションはリポジトリルートにあり、 `cargo build --release` を実行するとバイナリビルドが実行されます。
2. The [WebDriverIO][] test runner is in the `webdriver/webdriverio` directory and runs when `yarn test` is used in that directory.

以下はコメントされた GitHub Actions のワークフロー ファイル `.github/workflows/webdriver.yml`

```yaml
# run this action when the repository is pushed to
on: [push]

# the name of our workflow
name: WebDriver

jobs:
  # a single job named test
  test:
    # the display name of the test job
    name: WebDriverIO Test Runner

    # we want to run on the latest linux environment
    runs-on: ubuntu-latest

    # the steps our job runs **in order**
    steps:
      # checkout the code on the workflow runner
      - uses: actions/checkout@v2

      # install system dependencies that Tauri needs to compile on Linux.
      # note the extra dependencies for `tauri-driver` to run which are: `webkit2gtk-driver` and `xvfb`
      - name: Tauri dependencies
        run: >-
          sudo apt-get update &&
          sudo apt-get install -y
          libgtk-3-dev
          libayatana-appindicator3-dev
          libwebkit2gtk-4.0-dev
          webkit2gtk-driver
          xvfb

      # install the latest Rust stable
      - name: Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      # we run our rust tests before the webdriver tests to avoid testing a broken application
      - name: Cargo test
        uses: actions-rs/cargo@v1
        with:
          command: test

      # build a release build of our application to be used during our WebdriverIO tests
      - name: Cargo build
        uses: actions-rs/cargo@v1
        with:
          command: build
          args: --release

      # install the latest stable node version at the time of writing
      - name: Node v16
        uses: actions/setup-node@v2
        with:
          node-version: 16.x

      # install our Node.js dependencies with Yarn
      - name: Yarn install
        run: yarn install
        working-directory: webdriver/webdriverio

      # install the latest version of `tauri-driver`.
      # note: tauri-driver バージョンは、他の牡牛座のバージョンとは独立しています
      - name: Install tauri-driver
        uses: actions-rs/cargo@v1

          command: install
          args: tauri-driver

      # run the WebdriverIO test suite.
      # `xvfb-run` (前にインストールした依存関係) を介して実行します。偽の
      # display サーバを使用すると、アプリケーションはコードを変更せずにヘッドレスで実行できます。
      - name: WebdriverIO
        run: xvfb-run yarn test
        working-directory: webdriver/webdriverio
```

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[WebdriverIO]: https://webdriver.io/
[WebDriverIO]: https://webdriver.io/
[以前にビルドした]: ./example/webdriverio.md
