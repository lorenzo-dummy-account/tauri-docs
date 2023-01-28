---
sidebar_position: 3
---

importar pestañas de '@theme/Tabs' importar TabItem de '@theme/TabItem'

# Actualizando dependencias

## Actualizar paquetes npm

Si estás usando el paquete `tauri`:

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

También puedes detectar cuál es la última versión de Tauri en la línea de comandos, usando:

<Tabs groupId="package-manager">
  <TabItem value="npm">

```shell
npm desactualizado @tauri-apps/cli
```

  </TabItem>
  <TabItem value="Yarn">

```shell
yarn desactualizado @tauri-apps/cli
```

  </TabItem>
  <TabItem value="pnpm">

```shell
pnpm desactualizada @tauri-apps/cli
```

  </TabItem>
</Tabs>

Alternativamente, si estás usando el método `vue-cli-plugin-tauri`:

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

## Actualizar paquetes de carga

Puede comprobar si hay paquetes desactualizados con [`carga desactualizada`][] o en las cajas. o pages: [tauri][] / [tauri-build][].

Ve a `src-tauri/Cargo.toml` y cambia `tauri` y `tauri-build` a

```toml
[build-dependencies]
tauri-build = "%version%"

[dependencies]
tauri = { versión = "%version%" }
```

donde `%version%` es el número de versión correspondiente desde arriba. <!-- TODO: (You can just use the `MAJOR.MINOR`) version, like `0.9`. -->

Luego haz lo siguiente:

```shell
cd src-tauri
cargo update
```

Alternativamente, puedes ejecutar el comando `de actualización de carga` proporcionado por [cargo-edit][] que hace todo esto automáticamente.

[`carga desactualizada`]: https://github.com/kbknapp/cargo-outdated
[tauri]: https://crates.io/crates/tauri/versions
[tauri-build]: https://crates.io/crates/tauri-build/versions
[cargo-edit]: https://github.com/killercup/cargo-edit
