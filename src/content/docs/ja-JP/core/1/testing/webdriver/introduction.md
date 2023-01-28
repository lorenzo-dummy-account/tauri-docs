---
sidebar_position: 1
title: はじめに
---

:::注意事項現在 pre-alpha
TauriのWebdriver のサポートは pre-alpha になっています。 [tauri-driver][]のような専用のツールは、 積極的に開発されており、時間の経過とともに必要に応じて変化する可能性があります。 さらに、WindowsとLinuxのみが現在サポートされています。
:::

[WebDriver][] は、自動化されたテスト用に主に意図されている Web ドキュメントとやり取りするための標準化されたインターフェイスです。 Tauriはネイティブプラットフォームの [WebDriver][] サーバーを利用して [WebDriver][] インターフェイスをサポートしています。 クロスプラットフォームラッパー [`tauri-driver`][]。

## システムの依存関係

最新の [`tauri-driver`][] をインストールするか、実行して既存のインストールを更新してください:

```shell
cargo install tauri-driver
```

現在、私たちはプラットフォームのネイティブの [WebDriver][] サーバーを利用しています。 サポートされているプラットフォームで [ ][] [`tauri-driver`][] を実行するためのいくつかの要件があります。 現在、プラットフォームのサポートは Linux と Windows に限定されています。

### Linux

Linuxプラットフォームでは `WebKitWebDriver` を使用しています。 このバイナリがすでに存在するかどうかを確認する ( `WebKitDriver`コマンド) 。 いくつかのディストリビューションでは、通常の WebKit パッケージにバンドルされています。 Other platforms may have a separate package for them, such as `webkit2gtk-driver` on Debian-based distributions.

### Windows

アプリケーションがビルドされテストされている [WindowsのEdgeバージョンと一致する][] Microsoft Edge Driver のバージョンを入手してください。 これは、ほとんどの場合、最新のWindowsインストールの最新安定版である必要があります。 2つのバージョンが一致しない場合は、接続しようとしている間にWebDriverテストスイートがぶら下がっていることがあります。

ダウンロードには、 `msedgedriver.exe` というバイナリが含まれています。 [`tauri-driver`][] looks for that binary in the `$PATH` so make sure it's either available on the path or use the `--native-driver` option on [`tauri-driver`][]. エッジを確実にするために、CIのセットアッププロセスの一部として自動的にダウンロードすることもできます。 および Edge Driver バージョン は Windows CI マシンで同期し続けます。 これを行う方法に関するガイドは、後で追加することができます。

## アプリケーションの例

ガイドの [次のセクション](example/setup) では、 WebDriverでテストされる最小限のサンプルアプリケーションを作成する方法をステップバイステップで示しています。

ガイドの結果を見て、それを利用する最小限のコードベースが完成したのを見たい場合は、 は https://github.com/で確認できます。 om/chippers/hello_tauri. That example also comes with a CI script to test with GitHub actions, but you may still be interested in the [WebDriver CI](ci) guide as it explains the concept a bit more.

[WebDriver]: https://www.w3.org/TR/webdriver/

[ ]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[tauri-driver]: https://crates.io/crates/tauri-driver
[WindowsのEdgeバージョンと一致する]: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
