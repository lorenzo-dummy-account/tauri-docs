---
title: よく寄せられる質問
sidebar_position: 10
description: 一般的な問題の修正
---

## 未公開の牡牛座の変更をどのように使用できますか?

GitHubからおうりを使用するには、 `Cargo.toml` ファイルを変更し、CLIとAPIを更新する必要があります。

<details>
  <summary>ソースからRust木枠を引き抜くこと</summary>

これを `Cargo.toml` ファイルに追加します。

```toml title=Cargo.toml
[patch.crates-io]
tauri = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
tauri-build = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
```

これにより、すべての依存関係が crates.io の代わりに `tauri` と `tauri-build` を使用するようになります。

</details>

<details>
  <summary>ソースから Tauri CLI を使用する</summary>

Cargo CLI を使用している場合は、GitHub から直接インストールできます。

```shell
cargo install --git https://github.com/tauri-apps/tauri --branch dev tauri-cli
```

`@tauri-apps/cli` パッケージを使用している場合は、リポジトリをクローンしてビルドする必要があります。

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/cli/node
yarn
yarn build
```

それを使用するには、ノードで直接実行します:

```shell
node /path/to/tauri/tooling/cli/node/tauri.js dev
node /path/to/tauri/tooling/cli/node/tauri.js build
```

または、Cargoでアプリを直接実行することもできます。

```shell
cd src-tauri
cargo run --no-default-features # instead of tauri dev
cargo build # instead of tauri build - won't bundle your app
```

</details>

<details>
  <summary>ソースから Tauri API を使用する</summary>

GitHubからおうりクレートを使用する場合は、ソースからおうりAPIパッケージを使用することをお勧めします(不要かもしれませんが)。 ソースからビルドするには、次のスクリプトを実行します。

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/api
yarn
yarn build
```

Yarnを使ってリンクできるようになりました:

```shell
cd dist
yarn link
cd /path/to/your/project
yarn link @tauri-apps/api
```

または、package.jsonをdistフォルダを直接指すように変更することもできます。

```json title=package.json
{
  "dependencies": {
    "@tauri-apps/api": "/path/to/tauri/tooling/api/dist"
  }
}
```

</details>

## ノードまたは貨物を使用する必要がありますか? {#node-or-cargo}

Cargo 経由で CLI をインストールするのが好ましいオプションですが、インストール時には最初からバイナリ全体をコンパイルする必要があります。 CI 環境または非常に低速のマシンにいる場合は、別のインストール方法を選択することをお勧めします。

CLI は Rust で書かれているので、 [crates.io][] を通して自然に利用でき、Cargo でインストールできます。

We also compile the CLI as a native Node.js addon and distribute it [via npm][]. Cargo のインストール方法に比べて、いくつかの利点があります。

1. CLI は事前にコンパイルされているため、インストール時間が大幅に短縮されます。
2. package.json ファイルに特定のバージョンをピン留めできます。
3. 牡牛座の周りにカスタムツールを開発する場合は、CLI を通常の JavaScript モジュールとしてインポートできます。
4. JavaScript マネージャーを使用して CLI をインストールできます。

## おすすめのブラウザリスト

`es2021`, `最新の 3 Chrome バージョン`, および `Safari13` をブラウザリストに使用し、ターゲットを構築することをお勧めします。 TauriはOSのネイティブレンダリングエンジン(macOSのWebKit、WindowsのWebView2、LinuxのWebKitGTK)を活用しています。

## Linux 上で Homebrew との競合を構築します

Linux の Homebrew には `pkg-config` (システム上のライブラリを見つけるためのユーティリティ) があります。 これは、同じ `pkg-config` パッケージをインストールするときに競合を引き起こす可能性があります (通常、 `apt` のようなパッケージマネージャを介してインストールされます)。 Tauriアプリを構築しようとすると、 `pkg-config` を起動しようとし、Homebrewから起動します。 Homebrewが牡牛座の依存関係をインストールするために使用されていない場合、エラーが発生する可能性があります。

Errors will _usually_ contain messages along the lines of `error: failed to run custom build command for X` - `Package Y was not found in the pkg-config search path.`. 必要な依存関係がまったくインストールされていない場合、同様のエラーが表示されることに注意してください。

この問題には2つの解決策があります:

1. [Homebrew をアンインストール][]
2. Tauriアプリを構築する前に、 `PKG_CONFIG_PATH` 環境変数を正しい `pkg-config` を指すように設定します。

[crates.io]: https://crates.io/crates/tauri-cli
[via npm]: https://www.npmjs.com/package/@tauri-apps/cli
[Homebrew をアンインストール]: https://docs.brew.sh/FAQ#how-do-i-uninstall-homebrew
