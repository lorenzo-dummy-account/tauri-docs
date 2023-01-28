---
sidebar_position: 8
---

# 追加ファイルを埋め込み

フロントエンド( `distDir`)の一部ではない、またはバイナリにインライン展開するには大きすぎるファイルをアプリケーションバンドルに含める必要があるかもしれません。 これらのファイルを `リソース`と呼びます。

To bundle the files of your choice, you can add the `resources` property to the `tauri > bundle` object in your `tauri.conf.json` file.

tauri.conf.json の構成 [については、こちら][tauri.bundle] をご覧ください。

`リソース` は、絶対パスまたは相対パスを持つファイルを対象とする文字列のリストを期待します。 ディレクトリから複数のファイルを含める必要がある場合に備えて glob パターンをサポートします。

以下は、設定を説明するサンプルです。 これは完全な `tauri.conf.json` ファイルではありません。

```json title=tauri.conf.json
{
  "tauri": {
    "bundle": {
      "resources": [
        "/absolute/path/to/textfile.txt",
        "relative/path/to/jsonfile.json",
        "resources/*"
      ]
    },
    "allowlist": {
      "fs": {
        "scope": ["$RESOURCE/*"]
      }
    }
  }
}
```

:::note

親コンポーネントを含む絶対パスとパス(`../`) は `"$RESOURCE/*"` でのみ許可できます。 `"path/to/file.txt"` は `"$RESOURCE/path/to/file.txt"` を介して明示的に許可することができます。

:::

## JavaScriptでファイルにアクセスする

この例では、以下のような追加のi18n jsonファイルをバンドルします。

```json title=de.json
{
  "hello": "Guten Tag!",
  "bye": "Auf Wiedersehen!"
}
```

この場合、これらのファイルは `tauri.conf.json` の隣に `lang` ディレクトリに格納します。 このために、 `"lang/*"` を `リソース` に追加し、 `$RESOURCE/lang/*` を fs スコープに追加します。

Note that you must configure the allowlist to enable `path > all` and the [`fs` APIs][] you need, in this example `fs > readTextFile`.

```javascript
import { resolveResource } from '@tauri-apps/api/path'
// alternatively, use `window.__TAURI__.path.resolveResource`
import { readTextFile } from '@tauri-apps/api/fs'
// alternatively, use `window.__TAURI__.fs.readTextFile`

// `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
const resourcePath = await resolveResource('lang/de.json')
const langDe = JSON.parse(await readTextFile(resourcePath))

console.log(langDe.hello) // This will print 'Guten Tag!' to the devtools console
```

## Rust でファイルにアクセス中

これは上記の例に基づいています。 On the Rust side you need an instance of the [`PathResolver`][] which you can get from [`App`][] and [`AppHandle`][]:

```rust
tauri::Builder::default()
  .setup(|app| {
    let resource_path = app.path_resolver()
      .resolve_resource("lang/de.json")
      .expect("failed to resolve resource");

    let file = std::fs::File::open(&resource_path).unwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    println!("{}", lang_de.get("hello").unwrap()); // This will print 'Guten Tag!' to the terminal

    Ok(())
  })
```

```rust
#[tauri::command]
fn hello(handle: tauri::AppHandle) -> String {
   let resource_path = handle.path_resolver()
      .resolve_resource("lang/de.json")
      .expect("failed to resolve resource");

    let file = std::fs::File::open(&resource_path).unwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    lang_de.get("hello").unwrap()
}
```

[tauri.bundle]: ../../api/config.md#tauri.bundle
[`fs` APIs]: ../../api/js/fs/
[`PathResolver`]: https://docs.rs/tauri/latest/tauri/struct.PathResolver.html
[`App`]: https://docs.rs/tauri/latest/tauri/struct.App.html
[`AppHandle`]: https://docs.rs/tauri/latest/tauri/struct.AppHandle.html
