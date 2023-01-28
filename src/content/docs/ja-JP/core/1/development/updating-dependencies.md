---
sidebar_position: 3
---

import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

# 依存関係の更新

## npm パッケージを更新

`tauri` パッケージを使用している場合:

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm install @tauri-apps/cli@latest @tauri-apps/api@latest
```

  </TabItem>
  <TabItem value="Yarn Classic">

```shell
yarn upgrade @tauri-apps/cli @tauri-apps/api --latest
```

  </TabItem>
  <TabItem value="Yarn Berry">

```shell
yarn up @tauri-apps/cli @tauri-apps/api
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm update @tauri-apps/cli @tauri-apps/api --latest
```

  </TabItem>
</Tabs>

また、コマンドラインで Tauri の最新バージョンを検出できます。

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm outdated @tauri-apps/cli
```

  </TabItem>
  <TabItem value="Yarn">

```shell
yarn outdated @tauri-apps/cli
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm 時代遅れの @tauri-apps/cli
```

  </TabItem>
</Tabs>

あるいは、 `vue-cli-plugin-tauri` アプローチを使用している場合:

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm install vue-cli-plugin-tauri@latest
```

  </TabItem>
  <TabItem value="Yarn Classic">

```shell
yarn upgrade vue-cli-plugin-tauri --latest
```

  </TabItem>
  <TabItem value="Yarn Berry">

```shell
yarn up vue-cli-plugin-tauri
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm update vue-cli-plugin-tauri --latest
```

  </TabItem>
</Tabs>

## 貨物パッケージの更新

You can check for outdated packages with [`cargo outdated`][] or on the crates.io pages: [tauri][] / [tauri-build][].

`src-tauri/Cargo.toml` に移動し、 `tauri` と `tauri-build` に変更します。

```toml
[build-dependencies]
tauri-build = "%version%"

[dependencies]
tauri = { version = "%version%" }
```

`%version%` が上からの対応するバージョン番号です。 <!-- TODO: (You can just use the `MAJOR.MINOR`) version, like `0.9`. -->

次に、次の操作を行います。

```shell
cd src-tauri
cargo update
```

あるいは、 `cargo-edit` によって提供される [cargo-edit][] コマンドを自動的に実行することもできます。

[`cargo outdated`]: https://github.com/kbknapp/cargo-outdated
[tauri]: https://crates.io/crates/tauri/versions
[tauri-build]: https://crates.io/crates/tauri-build/versions
[cargo-edit]: https://github.com/killercup/cargo-edit
