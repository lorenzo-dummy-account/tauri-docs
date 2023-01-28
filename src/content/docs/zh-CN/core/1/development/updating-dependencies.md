---
sidebar_position: 3
---

从 '@theme/Tabs' 导入标签页 从 '@theme/TabItem' 导入标签页

# 正在更新依赖关系

## 更新 npm 包

如果您正在使用 `tauri` 包：

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

您还可以通过以下方式检测最新版本的Tauri在命令行上：

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm 过期的 @tauri-apps/cli
```

  </TabItem>
  <TabItem value="Yarn">

```shell
yarn 过时的@tauri-apps/cli
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm 过期的@tauri-apps/cli
```

  </TabItem>
</Tabs>

或者，如果您正在使用 `vue-cli-plugin-tauri` 方法：

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

## 更新货运包

您可以用 [`货物过期`][] 或箱子检查过期的包裹。 o 页面： [tauri][] / [tauri-build][]

转到 `src-tauri/Cargo.toml` 并更改 `tauri` 和 `tauri-build` 到

```toml
[build-dependencies]
tauri-build = "%version%"

[dependencies]
tauri = { version = "%version%" }
```

其中 `%version%` 是上面相应的版本号。 <!-- TODO: (You can just use the `MAJOR.MINOR`) version, like `0.9`. -->

然后这样做：

```shell
cd src-tauri
cargo update
```

或者，您可以运行 `货物升级` 命令，由 [货物编辑][] 提供，这将自动完成所有这一切。

[`货物过期`]: https://github.com/kbknapp/cargo-outdated
[tauri]: https://crates.io/crates/tauri/versions
[tauri-build]: https://crates.io/crates/tauri-build/versions
[货物编辑]: https://github.com/killercup/cargo-edit
