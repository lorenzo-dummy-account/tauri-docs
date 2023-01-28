---
sidebar_position: 7
---

# 外部バイナリを埋め込み

アプリケーションを動作させるため、またはユーザーが追加の依存関係(例えば、Node.js や Python など)をインストールすることを防ぐために、バイナリを埋め込む必要があるかもしれません。 このバイナリを `サイドカー`と呼びます。

To bundle the binaries of your choice, you can add the `externalBin` property to the `tauri > bundle` object in your `tauri.conf.json`.

tauri.conf.json の構成 [については、こちら][tauri.bundle] をご覧ください。

`externalBin` はバイナリを対象とする文字列のリストを絶対パスまたは相対パスで指定することを期待します。

以下は、設定を説明するサンプルです。 これは完全な `tauri.conf.json` ファイルではありません。

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relative/path/to/binary",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": {
      "shell": {
        "sidecar": true,
        "scope": [
          { "name": "/absolute/path/to/sidecar", "sidecar": true },
          { "name": "relative/path/to/binary", "sidecar": true },
          { "name": "binaries/my-sidecar", "sidecar": true }
        ]
      }
    }
  }
}
```

指定されたパスに同じ名前の `-$TARGET_TRIPLE` サフィックスを持つバイナリが存在する必要があります。 例えば、 `"externalBin": ["binaries/my-sidecar"]` には `src-tauri/binaries/my-sidecar-x86_64-unknown-linux-gnu` 実行可能ファイルがLinux上で必要です。 次のコマンドを実行することで、現在のプラットフォームのターゲットを 3 倍にすることができます。

```shell
rustc -Vv | grep host | cut -f2 -d' '
```

ターゲットのトリプルをバイナリに追加するNode.jsスクリプトは次のとおりです。

```javascript
const execa = require('execa')
const fs = require('fs')

let extension = ''
if (process.platform === 'win32') {
  extension = '.exe'
}

async function main() {
  const rustInfo = (await execa('rustc', ['-vV'])).stdout
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
  if (!targetTriple) {
    console.error('Failed to determine platform target triple')
  }
  fs.renameSync(
    `src-tauri/binaries/sidecar${extension}`,
    `src-tauri/binaries/sidecar-${targetTriple}${extension}`
  )
}

main().catch((e) => {
  throw e
})
```

## JavaScriptから実行

JavaScript コードでは、 `シェル` モジュールの `コマンド` クラスをインポートし、 `サイドカー` 静的メソッドを使用します。

`shell > sidecar` を有効にし、 `shell > scope` ですべてのバイナリを設定する必要があることに注意してください。

```javascript
import { Command } from '@tauri-apps/api/shell'
// alterively, use `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` is the EXACT specified on `tauri. onf.json > tauri > bundle > externalBin`
const command = Command.sidecar('binaries/my-sidecar')
const output = await command.execute()
```

## Rust から実行中

Rust 側で `コマンド` 構造体を `tauri::api::process` モジュールからインポートします。

```rust
// `new_sidecar()` expects just the filename, NOT the whole path like in JavaScript
let (mut rx, mut child) = Command::new_sidecar("my-sidecar")
  .expect("failed to create `my-sidecar` binary command")
  .spawn()
  .expect("Failed to spawn sidecar");

tauri::async_runtime::spawn(async move {
  // read events such as stdout
  while let Some(event) = rx.recv().await {
    if let CommandEvent::Stdout(line) = event {
      window
        .emit("message", Some(format!("'{}'", line)))
        .expect("failed to emit event");
      // write to stdin
      child.write("message from Rust\n".as_bytes()).unwrap();
    }
  }
});
```

**process-command-api** Cargo 機能を有効にする必要があります(設定を変更すると、Tauri の CLI がこれを行います):

```toml
# Cargo.toml
[dependencies]
tauri = { version = "1", features = ["process-command-api", ...] }
```

## 引数の渡す

通常の `コマンド`s を実行するのと同じように、Sidecar コマンドに引数を渡すことができます (次を参照してください: [コマンド API へのアクセスを制限する][])。

まず、 `tauri.conf.json` でSidecar コマンドに渡す必要のある引数を定義します。

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relative/path/to/binary",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": {
      "shell": {
        "sidecar": true,
        "scope": [
          {
            "name": "binaries/my-sidecar",
            "sidecar": true,
            "args": [
              "arg1",
              "-a",
              "--arg2",
              {
                "validator": "\\S+"
              }
            ]
          }
        ]
      }
    }
  }
}
```

そして、サイドカーコマンドを呼び出すには、 **すべての引数を** 配列として渡します。

```js
import { Command } from '@tauri-apps/api/shell'
// alterively, use `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` is the EXACT specified on `tauri. onf.json > tauri > bundle > externalBin`
// args arrayが`tauriで指定されているものと完全に一致することに気づきます。 onf.json。
const command = Command.sidecar('binaries/my-sidecar', ['arg1', '-a', '-arg2', 'any-string-that-matches-the-validator'])
const output = await command.execute()
```

## サイドカーでNode.jsを使用する

Tauri [サイドカー][] の例では、サイドカー API を使用して、牡牛座でNode.js アプリケーションを実行する方法を示しています。 [pkg][] を使用して Node.js コードをコンパイルし、上記のスクリプトを使用して実行します。

[tauri.bundle]: ../../api/config.md#tauri.bundle
[サイドカー]: https://github.com/tauri-apps/tauri/tree/dev/examples/sidecar
[コマンド API へのアクセスを制限する]: ../../api/js/shell.md#restricting-access-to-the-command-apis
[pkg]: https://github.com/vercel/pkg
