import Command from '@theme/Command'

# アイコン

牡牛座はロゴに基づいてデフォルトのアイコンセットで出荷されます。 これは、アプリケーションを出荷するときに必要なものではありません。 To remedy this common situation, Tauri provides the `icon` command that will take an input file (`"./app-icon.png"` by default) and create all the icons needed for the various platforms.

:::info ファイルの種類に対するメモ

- `icon.icns` = macOS
- `icon.ico` = Windows
- `*.png` = Linux
- `Square*Logo.png` & `StoreLogo.png` = 現在未使用ですが、AppX/MS ストアのターゲットを対象としています。

アイコンの種類は上記以外のプラットフォームでも使用できます(特に `png`)。 したがって、一部のプラットフォームでのみビルドする場合でも、すべてのアイコンを含めることをお勧めします。

:::

## コマンドの使用法

`@tauri-apps/cli` / `tauri-cli` バージョン 1.1 から、 `アイコン` サブコマンドはメインクライアントの一部です。

<Command name="icon" />

```console
> cargo tauri icon --help
cargo-tauri-icon 1.1.0

Generates various icons for all major platforms

USAGE:
    cargo tauri icon [OPTIONS] [INPUT]

ARGS:
    <INPUT>    Path to the source icon (png, 1240x1240px with transparency) [default: ./app-icon.png]

OPTIONS:
    -h, --help               Print help information
    -o, --output <OUTPUT>    Output directory. デフォルト: tauri.conf.json ファイルの隣の 'icons' ディレクトリ
    -v, --verbose 詳細なログを有効にする
    -V, --version バージョン情報を印刷する
```

デフォルトでは、アイコンは `src-tauri/icons` フォルダに配置され、自動的にビルドされたアプリに含まれます。 別の場所からアイコンをソースする場合は、 `tauri.conf.json` ファイルのこの部分を編集できます。

```json
{
  "tauri": {
    "bundle": {
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    }
  }
}
```

## アイコンを手動で作成する

これらのアイコンを自分で作成したい場合(小さなサイズのシンプルなデザインをしたい場合、またはCLIの内部イメージのリサイズに依存したくない場合) [`icns`][] ファイルの必要なレイヤーサイズと名前は、 [Tauri repo で説明されています。][] [`ico`][] ファイルには、16 のレイヤーを含める必要があります。 24、32、48、64、256ピクセル。 開発中の ICO 画像 __を最適に表示するには、32px レイヤーが最初のレイヤーでなければなりません。

[Tauri repo で説明されています。]: https://github.com/tauri-apps/tauri/blob/dev/tooling/cli/src/helpers/icns.json
[`icns`]: https://en.wikipedia.org/wiki/Apple_Icon_Image_format
[`ico`]: https://en.wikipedia.org/wiki/ICO_(file_format)
