---
sidebar_position: 3
---

importer des onglets depuis '@theme/Tabs' importer TabItem depuis '@theme/TabItem'

# Mise à jour des dépendances

## Mettre à jour les paquets npm

Si vous utilisez le paquet `tauri`:

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
pnpm mise à jour @tauri-apps/cli @tauri-apps/api --latest
```

  </TabItem>
</Tabs>

Vous pouvez également détecter la dernière version de Tauri sur la ligne de commande, en utilisant :

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm obsolète @tauri-apps/cli
```

  </TabItem>
  <TabItem value="Yarn">

```shell
yarn obsolète @tauri-apps/cli
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm obsolète @tauri-apps/cli
```

  </TabItem>
</Tabs>

Alternativement, si vous utilisez l'approche `vue-cli-plugin-tauri`:

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
pnpm mise à jour vue-cli-plugin-tauri --latest
```

  </TabItem>
</Tabs>

## Mettre à jour les paquets de marchandise

Vous pouvez vérifier les paquets obsolètes avec [`cargaisons obsolètes`][] ou dans les caisses. o pages: [tauri][] / [tauri-build][].

Allez à `src-tauri/Cargo.toml` et changez `tauri` et `tauri-build` en

```toml
[build-dependencies]
tauri-build = "%version%"

[dependencies]
tauri = { version = "%version%" }
```

où `%version%` est le numéro de version correspondant de ci-dessus. <!-- TODO: (You can just use the `MAJOR.MINOR`) version, like `0.9`. -->

Puis faites ce qui suit :

```shell
cd src-tauri
cargo update
```

Alternativement, vous pouvez exécuter la commande `cargo upgrade` fournie par [cargo-edit][] qui fait tout cela automatiquement.

[`cargaisons obsolètes`]: https://github.com/kbknapp/cargo-outdated
[tauri]: https://crates.io/crates/tauri/versions
[tauri-build]: https://crates.io/crates/tauri-build/versions
[cargo-edit]: https://github.com/killercup/cargo-edit
