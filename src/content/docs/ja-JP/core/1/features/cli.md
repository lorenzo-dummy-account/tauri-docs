# あなた自身のCLIを作る

牡牛座は、堅牢なコマンドライン引数パーサである [clap](https://github.com/clap-rs/clap)を通じて、アプリケーションがCLIを持つことを可能にします。 With a simple CLI definition in your `tauri.conf.json` file, you can define your interface and read its argument matches map on JavaScript and/or Rust.

## 基本設定

`tauri.conf.json`では、インターフェイスを構成するために次の構造を持っています。

```json title=src-tauri/tauri.conf.json
{
  "tauri": {
    "cli": {
      "description": "", // command description that's shown on help
      "longDescription": "", // command long description that's shown on help
      "beforeHelp": "", // content to show before the help text
      "afterHelp": "", // content to show after the help text
      "args": [], // list of arguments of the command, we'll explain it later
      "subcommands": {
        "subcommand-name": {
          // configures a subcommand that is accessible
          // with `./app subcommand-name --arg1 --arg2 --etc`
          // configuration as above, with "description", "args", etc.
        }
      }
    }
  }
}
```

:::note

ここでのJSON設定はすべてサンプルですが、明確にするために他の多くのフィールドが省略されています。

:::

## 引数の追加

`args` 配列は、コマンドまたはサブコマンドで受け入れられる引数のリストを表します。 設定方法の詳細については、こちら [][tauri config] をご覧ください。

### 位置引数

位置引数は、引数のリスト内の位置によって識別されます。 以下の設定で:

```json tauri.conf.json
{
  "args": [
    {
      "name": "source",
      "index": 1,
      "takesValue": true
    },
    {
      "name": "destination",
      "index": 2,
      "takesValue": true
    }
  ]
}
```

Users can run your app as `./app tauri.txt dest.txt` and the arg matches map will define `source` as `"tauri.txt"` and `destination` as `"dest.txt"`.

### 名前付き引数

名前付き引数は、キーが値を識別する(キー、値)ペアです。 以下の設定で:

```json tauri.conf.json
{
  "args": [
    {
      "name": "type",
      "short": "t",
      "takesValue": true,
      "multiple": true,
      "possibleValues": ["foo", "bar"]
    }
  ]
}
```

Users can run your app as `./app --type foo bar`, `./app -t foo -t bar` or `./app --type=foo,bar` and the arg matches map will define `type` as `["foo", "bar"]`.

### フラグ引数

flag 引数は、アプリケーションに情報を提供するスタンドアロンキーです。 以下の設定で:

```json tauri.conf.json
{
  "args": [
    "name": "verbose",
    "short": "v",
    "multipleOcurrences": true
  ]
}
```

Users can run your app as `./app -v -v -v`, `./app --verbose --verbose --verbose` or `./app -vvv` and the arg matches map will define `verbose` as `true`, with `occurrences = 3`.

## サブコマンド

一部の CLI アプリケーションにはサブコマンドとして追加のインターフェイスがあります。 例えば、 `git` CLI には `git ブランチ`、 `git commit` と `git push` があります。 `サブコマンド` 配列を使用して、追加のネストされたインターフェイスを定義できます。

```json tauri.conf.json
{
  "cli": {
...
    "subcommands": {
      "branch": {
        "args": []
      },
      "push": {
        "args": []
      }
    }
  }
}
```

設定は `説明`, `longDescription`, `args`などのルートアプリケーション設定と同じです。

## 試合を読むこと

### Rust

```rust
fn main() {
  tauri::Builder::default()
    .setup(|app| {
      match app.get_cli_matches() {
        // `matches` here is a Struct with { args, subcommand }.
        // `args` is `HashMap<String, ArgData>` where `ArgData` is a struct with { value, occurrences }.
        // `subcommand` is `Option<Box<SubcommandMatches>>` where `SubcommandMatches` is a struct with { name, matches }.
        Ok(matches) => {
          println!("{:?}", matches)
        }
        Err(_) => {}
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### JavaScript

```js
import { getMatches } from '@tauri-apps/api/cli'

getMatches().then((matches) => {
  // do something with the { args, subcommand } matches
})
```

## 完全なドキュメント

CLI の構成 [については、こちら][tauri config] をご覧ください。

[tauri config]: ../../api/config.md#tauri

[tauri config]: ../../api/config.md#tauri

[tauri config]: ../../api/config.md#tauri
