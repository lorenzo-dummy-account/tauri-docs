# VS コードでのデバッグ

このガイドでは、牡牛座アプリケーションの [コアプロセスのVSコードでデバッグをセットアップする方法について説明します][]。

## セットアップ

[`vscode-lldb`][] 拡張機能をインストールします。

## launch.jsonの設定

`.vscode/launch.json` ファイルを作成し、以下の JSON コンテンツを以下に貼り付けます:

```json title=".vscode/launch.json"
{
  // IntelliSenseを使用して、可能な属性について学習します。
  // ホバーで既存の属性の説明を表示します。
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": {
        "args": [
          "build",
          "--manifest-path=./src-tauri/Cargo.toml",
          "--no-default-features"
        ]
      },
      // task for the `beforeDevCommand` if used, must be configured in `.vscode/tasks.json`
      "preLaunchTask": "ui:dev"
    },
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Production Debug",
      "cargo": {
        "args": ["build", "--release", "--manifest-path=./src-tauri/Cargo.toml"]
      },
      // task for the `beforeBuildCommand` if used, must be configured in `.vscode/tasks.json`
      "preLaunchTask": "ui:build"
    }
  ]
}
```

これは `貨物` を直接使用して、Rust アプリケーションを構築し、開発モードと本番モードの両方にロードします。

Tauri CLI は使用しないので、排他的な CLI 機能は実行されません。 `beforeDevCommand` と `beforeBuildCommand` のスクリプトは、事前に実行するか、 `preLaunchTask` フィールドでタスクとして設定する必要があります。 Below is an example `.vscode/tasks.json` file that has two tasks, one for a `beforeDevCommand` that spawns a development server and one for `beforeBuildCommand`:

```json title=".vscode/tasks.json"
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "ui:dev",
      "type": "shell",
      // `dev` keeps running in the background
      // ideally you should also configure a `problemMatcher`
      // see https://code.visualstudio.com/docs/editor/tasks#_can-a-background-task-be-used-as-a-prelaunchtask-in-launchjson
      "isBackground": true,
      // change this to your `beforeDevCommand`:
      "command": "yarn",
      "args": ["dev"]
    },
    {
      "label": "ui:build",
      "type": "shell",
      // change this to your `beforeBuildCommand`:
      "command": "yarn",
      "args": ["build"]
    }
  ]
}
```

`src-tauri/src/main.rs` またはその他のRustファイルでブレークポイントを設定し、 `F5` を押してデバッグを開始できます。

[`vscode-lldb`]: https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb

[コアプロセスのVSコードでデバッグをセットアップする方法について説明します]: ../../references/architecture/process-model.md#the-core-process
