---
sidebar_position: 3
---

import TabItem da '@theme/Tabs' import TabItem da '@theme/TabItem'

# Aggiornamento Dipendenze

## Aggiorna pacchetti npm

Se stai usando il pacchetto `tauri`:

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

È inoltre possibile rilevare la versione più recente di Tauri sulla riga di comando, utilizzando:

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm obsoleto @tauri-apps/cli
```

  </TabItem>
  <TabItem value="Yarn">

```shell
yarn outdated @tauri-apps/cli
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm obsoleto @tauri-apps/cli
```

  </TabItem>
</Tabs>

In alternativa, se stai usando l'approccio `vue-cli-plugin-tauri`:

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

## Aggiorna Pacchetti Carico

È possibile verificare la presenza di pacchetti obsoleti con [`cargo obsoleti`][] o sulle casse. o pagine: [tauri][] / [tauri-build][].

Vai a `src-tauri/Cargo.toml` e cambia `tauri` e `tauri-build` in

```toml
[build-dependencies]
tauri-build = "%version%"

[dependencies]
tauri = { version = "%version%" }
```

dove `%version%` è il numero di versione corrispondente dall'alto. <!-- TODO: (You can just use the `MAJOR.MINOR`) version, like `0.9`. -->

Quindi fare quanto segue:

```shell
cd src-tauri
cargo update
```

In alternativa, è possibile eseguire il comando `cargo upgrade` fornito da [cargo-edit][] che fa tutto questo automaticamente.

[`cargo obsoleti`]: https://github.com/kbknapp/cargo-outdated
[tauri]: https://crates.io/crates/tauri/versions
[tauri-build]: https://crates.io/crates/tauri-build/versions
[cargo-edit]: https://github.com/killercup/cargo-edit
