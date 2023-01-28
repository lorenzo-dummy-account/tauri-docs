---
title: Preguntas frecuentes
sidebar_position: 10
description: Soluciones para problemas comunes
---

## ¿Cómo puedo usar cambios Tauri no publicados?

Para utilizar Tauri de GitHub (versión del borde sangrado), necesita cambiar su archivo `Cargo.toml` y actualizar su CLI y API.

<details>
  <summary>Extraer la caja de polvo de la fuente</summary>

Añade esto a tu archivo `Cargo.toml`:

```toml title=Cargo.toml
[patch.crates-io]
tauri = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
tauri-build = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
```

Esto obligará a todas tus dependencias a usar `tauri` y `tauri-build` de Git en lugar de crates.io.

</details>

<details>
  <summary>Usando el CLI de Tauri desde el código fuente</summary>

Si está utilizando la CLI de Carga, puede instalarla directamente desde GitHub:

```shell
cargo install --git https://github.com/tauri-apps/tauri --branch dev tauri-cli
```

Si estás usando el paquete `@tauri-apps/cli` , necesitarás clonar el repositorio y construirlo:

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/cli/node
yarn
build yarn
```

Para usarlo, ejecute directamente con nodo:

```shell
node /path/to/tauri/tooling/cli/node/tauri.js dev
node /path/to/tauri/tooling/cli/node/tauri.js build
```

Alternativamente, puedes ejecutar tu aplicación con Cargo directamente:

```shell
cd src-tauri
cargo run --no-default-features # en lugar de tauri dev
carga build # en lugar de tauri build - no empaquetará tu aplicación aunque
```

</details>

<details>
  <summary>Usando la API de Tauri desde el código fuente</summary>

Se recomienda usar también el paquete Tauri API de origen cuando se utiliza la caja Tauri de GitHub (aunque puede que no sea necesario). Para construirlo desde el código fuente, ejecute el siguiente script:

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/api
yarn
build yarn
```

Ahora puedes enlazarlo usando hilos:

```shell
cd dist
yarn link
cd /path/to/tu/proyecto
yarn link @tauri-apps/api
```

O puede cambiar su package.json para que apunte a la carpeta dist directamente:

```json title=package.json
{
  "dependencies": {
    "@tauri-apps/api": "/path/to/tauri/tooling/api/dist"
  }
}
```

</details>

## ¿Debo usar Node o Carga? {#node-or-cargo}

Aunque instalar la CLI a través de Cargo es la opción preferida, tiene que compilar todo el binario desde cero al instalarlo. Si está en un entorno CI o en una máquina muy lenta, es mejor elegir otro método de instalación.

Como la CLI está escrita en Rust, está disponible naturalmente a través de [crates.io][] e instalable con Cargo.

También compilamos el CLI como complemento nativo de Node.js y lo distribuimos [a través de npm][]. Esto tiene varias ventajas en comparación con el método de instalación de carga:

1. El CLI está precompilado, lo que lleva a tiempos de instalación mucho más rápidos
2. Puede anclar una versión específica en su archivo package.json
3. Si desarrolla herramientas personalizadas alrededor de Tauri, puede importar el CLI como un módulo JavaScript regular
4. Puede instalar el CLI usando un gestor de JavaScript

## Lista de navegadores recomendada

Recomendamos usar `es2021`, `últimas 3 versiones de Chrome`y `safari13` para tu lista de navegadores y objetivos de construcción. Tauri aprovecha el motor de renderizado nativo del SO (WebKit en macOS, WebView2 en Windows y WebKitGTK en Linux).

## Construir conflictos con Homebrew en Linux

Homebrew en Linux incluye su propio `pkg-config` (una utilidad para encontrar bibliotecas en el sistema). Esto puede causar conflictos al instalar el mismo paquete `pkg-config` para Tauri (normalmente instalado a través del gestor de paquetes como `apt`). Cuando intenta construir una aplicación Tauri, intentará invocar `pkg-config` y terminará invocando la de Homebrew. Si Homebrew no fue usado para instalar las dependencias de Tauri, esto puede causar errores.

Errores _generalmente_ contendrán mensajes a lo largo de las líneas de `error: no se pudo ejecutar el comando de compilación personalizada para X` - `El paquete Y no se encontró en la ruta de búsqueda de pkg-config.`. Tenga en cuenta que puede ver errores similares si las dependencias requeridas no están instaladas en absoluto.

Hay dos soluciones para esta cuestión:

1. [Desinstalar Homebrew][]
2. Establece la variable de entorno `PKG_CONFIG_PATH` para apuntar a la correcta `pkg-config` antes de construir una aplicación Tauri

[crates.io]: https://crates.io/crates/tauri-cli
[a través de npm]: https://www.npmjs.com/package/@tauri-apps/cli
[Desinstalar Homebrew]: https://docs.brew.sh/FAQ#how-do-i-uninstall-homebrew
