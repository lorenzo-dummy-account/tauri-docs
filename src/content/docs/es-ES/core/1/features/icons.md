importar comando de '@theme/Command'

# Iconos

Tauri viene con un iconset predeterminado basado en su logo. Esto NO es lo que desea cuando envía su solicitud. Para remediar esta situación común, Tauri proporciona el comando `icono` que tomará un archivo de entrada (`". app-icon.png"` por defecto) y crea todos los iconos necesarios para las diferentes plataformas.

:::info Nota sobre tipos de archivo

- `icon.icns` = macOS
- `icon.ico` = Windows
- `*.png` = Linux
- `Square*Logo.png` & `StoreLogo.png` = Actualmente no utilizado pero destinado a objetivos de la tienda AppX/MS.

Tenga en cuenta que los tipos de iconos pueden utilizarse en plataformas distintas de las mencionadas anteriormente (especialmente `png`). Por lo tanto recomendamos incluir todos los iconos, incluso si tiene la intención de construir sólo para un subconjunto de plataformas.

:::

## Uso de Comando

A partir de `@tauri-apps/cli` / `tauri-cli` versión 1.1 el subcomando de `icono` es parte del cli:

<Command name="icon" />

```console
> icono de cargo tauri --help
cargo-tauri-icon 1.1.

Genera varios iconos para todas las plataformas principales

USAGE:
    icono del tauri de carga [OPTIONS] [INPUT]

ARGS:
    <INPUT>    Ruta al icono de origen (png, 1240x1240px con transparencia) [por defecto: . icono de la aplicación. ng]

OPCIONES:
    -h, --help Imprime información de ayuda
    -o, --output <OUTPUT>    Directorio de salida. Por defecto: directorio 'icons' junto al archivo tauri.conf.json
    -v, --verbose Activa el registro detallado
    -V, --version Imprimir información de versión
```

Por defecto, los iconos se colocarán en la carpeta `src-tauri/icons` donde se incluirán automáticamente en tu aplicación construida. Si desea originar sus iconos desde una ubicación diferente, puede editar esta parte del archivo `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "icon": [
        "icons/32x32. ng",
        "icons/128x128. ng",
        "icons/128x128@2x.png",
        "iconos/icono. cns",
        "iconos/icono. co"
      ]
    }
  }
}
```

## Creando los iconos manualmente

Si prefiere construir estos iconos usted mismo (si desea tener un diseño más simple para pequeños tamaños o porque no quiere depender del redimensionado interno de la CLI), los tamaños de capa y nombres necesarios para el archivo [`iconos`][] se describen [en el repositorio Tauri][] y el archivo [``][] debe incluir capas para 16, 24, 32, 48, 64 y 256 píxeles. Para una visualización óptima de la imagen ICO _en desarrollo_, la capa de 32px debe ser la primera capa.

[en el repositorio Tauri]: https://github.com/tauri-apps/tauri/blob/dev/tooling/cli/src/helpers/icns.json
[`iconos`]: https://en.wikipedia.org/wiki/Apple_Icon_Image_format
[``]: https://en.wikipedia.org/wiki/ICO_(file_format)
