---
sidebar_position: 5
---

# Compilación de Plataforma Cruzada

Tauri depende en gran medida de las bibliotecas nativas y las toolchains, por lo que la compilación cruzada significativa **no es posible** en el momento actual. La siguiente mejor opción es compilar utilizando un pipeline de CI/CD alojado en algo como [GitHub Actions][], Azure Pipelines, GitLab, u otras opciones. El pipeline puede ejecutar la compilación para cada plataforma simultáneamente haciendo el proceso de compilación y liberación mucho más fácil.

Para una configuración fácil, actualmente proporcionamos [Tauri Action][], una Acción de GitHub que se ejecuta en todas las plataformas soportadas, compila su software, genera los artefactos necesarios y los carga a una nueva versión de GitHub.

## Tauri GitHub Action

Tauri Action aprovecha las Acciones de GitHub para construir simultáneamente tu aplicación como un binario nativo Tauri para macOS, Linux, y Windows, y automatiza la creación de una versión de GitHub.

Esta acción de GitHub también puede utilizarse como un pipeline de prueba para su aplicación Tauri, garantizar la compilación funciona bien en todas las plataformas para cada pull request enviado, incluso si no desea crear una nueva versión.

:::info firma de código

Para configurar la firma de código para Windows y macOS en tu flujo de trabajo, sigue la guía específica para cada plataforma:

- [Firmar código de Windows con acciones de GitHub][]
- [firma de código macOS con acciones de GitHub][]

:::

### Comenzando

Para configurar Tauri Action primero debe configurar un repositorio de GitHub. Puedes usar esta acción en un repositorio que no tiene Tauri configurado ya que inicializa automáticamente Tauri antes de construirlo y configurarlo para que use tus artefactos.

Ve a la pestaña Acciones en tu proyecto de GitHub y elige "Nuevo flujo de trabajo", luego elige "Configurar un flujo de trabajo tú mismo". Replace the file with the [Tauri Action production build workflow example][]. Alternativamente, puede configurar el flujo de trabajo basado en el ejemplo [en la parte inferior de esta página](#example-workflow)

### Configuración

Puedes configurar Tauri con las opciones `configPath`, `distPath` y `iconPath`. Vea las acciones Léame para más detalles.


<!-- FIXME: tauriScript is currently broken.
  Custom Tauri CLI scripts can be run with the `tauriScript` option. So instead of running `yarn tauri build` or `npx tauri build`, `${tauriScript}` will be executed. This can be useful when you need custom build functionality such as when creating Tauri apps e.g. a `desktop:build` script.
-->

Cuando tu aplicación no esté en la raíz del repositorio, usa la entrada `projectPath`.

Puede modificar el nombre del flujo de trabajo, cambiar los activadores, y añadir más pasos como `npm run lint` o `npm run test`. La parte importante es que usted mantenga la línea de abajo al final del flujo de trabajo, ya que esto ejecuta el script de compilación y libera los artefactos:

```yaml
- usos: tauri-apps/tauri-action@v0
```

### Cómo activar

El flujo de trabajo de la liberación en los ejemplos de README enlazados arriba se activa con empuñaduras en la rama "lanzamiento". La acción crea automáticamente una etiqueta y título para el lanzamiento de GitHub usando la versión de aplicación especificada en `tauri.config.json`.

También puede activar el flujo de trabajo en el push de una etiqueta de versión como "app-v0.7.0". Para esto puede cambiar el inicio del flujo de trabajo de la liberación:

```yaml
nombre: publicar
el:
  push:
    etiquetas:
      - 'app-v*'
  workflow_dispatch:
```

### Ejemplo de flujo de trabajo

A continuación se muestra un flujo de trabajo de ejemplo que ha sido configurado para ejecutarse cada vez que se crea una nueva versión en git.

Este flujo de trabajo configura el entorno en las últimas versiones de Windows, Ubuntu y macOS. Tenga en cuenta bajo `jobs.release.strategy.matrix` el array de plataforma que contiene `macos-latest`, `ubuntu-20.04`y `windows-latest`.

Los pasos que toma este flujo de trabajo son:

1. Compruebe el repositorio usando `actions/checkout@v3`
2. Configurar LTS de Node y un caché para los datos globales del paquete npm/yarn/pnpm usando `actions/setup-node@v3`.
3. Configura Rust y un caché para la carpeta `target/` usando `dtolnay/rust-toolchain@stable` y `swatinem/rust-cache@v2`.
4. Instala todas las dependencias y ejecuta el script de compilación (para la aplicación web).
5. Finalmente, utiliza `tauri-apps/tauri-action@v0` para ejecutar `tauri build`, generar los artefactos y crear la versión de GitHub.

```yaml
nombre: Lanzamiento
el
  push:
    etiquetas:
      - 'v*'
  workflow_dispatch:

trabajos:
  lanzamiento:
    estrategia:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-20. 4, windows-latest]
    runs-on: ${{ matrix.platform }}
    pasos:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Install dependencies (ubuntu only)
        if: matrix. latform == 'ubuntu-20.04'
        # Puede eliminar libayatana-appindicator3-dev si no utiliza la función de la bandeja del sistema.
        ejecutar: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4. -dev libayatana-appindicator3-dev librsvg2-dev

      - name: Configuración de Rust
        uses: dtolnay/rust-toolchain@stable

      - name: cache de Rust
        uses: swatinem/rust-cache@v2
        with:
          espacios de trabajo: '. src-tauri -> target'

      - name: Sync node version and setup cache
        uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'
          cache: 'yarn' # Set this to npm, yarn o pnpm.

      - name: Instalar dependencias de aplicaciones y construir web
        # Eliminar `&& yarn build` si construyes tu interfaz en `beforeBuildCommand`
        run: yarn && yarn build # Cambia esto a npm, yarn o pnpm.

      - name: Construir la aplicación
        uses: tauri-apps/tauri-action@v0

        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }} # Esto sólo funciona si su flujo de trabajo se activa en nuevas etiquetas.
          releaseName: 'App Name v__VERSION__' # tauri-action reemplaza \_\_VERSION\_\_ con la versión de la aplicación.
          releaseBody: 'Ver los recursos para descargar e instalar esta versión.'
          releaseDraft: verdadero
          elease: falso
```

### Token de entorno de GitHub

El token de GitHub es emitido automáticamente por GitHub para cada flujo de trabajo ejecutado sin más configuración, lo que significa que no hay riesgo de fugas secretas. Sin embargo, este token sólo tiene permisos de lectura por defecto y puede obtener un error "Recurso no accesible por integración" cuando se ejecuta el flujo de trabajo. Si esto sucede, puede que necesite agregar permisos de escritura a este token. Para ello, vaya a la configuración del proyecto de GitHub y, a continuación, seleccione Acciones, desplácese hacia abajo hacia "Permisos de flujo de trabajo" y marque "permisos de lectura y escritura".

Puede ver que el token de GitHub se pasa al flujo de trabajo de abajo:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Notas de uso

Asegúrate de comprobar la [documentación para GitHub Actions][github actions] para entender mejor cómo funciona este flujo de trabajo. Tenga cuidado de leer la documentación de [Límites de uso, facturación y administración][usage limits billing and administration] para Acciones de GitHub. Algunas plantillas de proyecto pueden ya implementar este flujo de trabajo de acción de GitHub, como [tauri-svelte-template][]. Puede usar esta acción en un repositorio que no tiene Tauri configurado. Tauri se inicializa automáticamente antes de construirlo y configurarlo para que utilice sus artefactos web.

[Tauri Action]: https://github.com/tauri-apps/tauri-action
[Tauri Action production build workflow example]: https://github.com/tauri-apps/tauri-action#creating-a-release-and-uploading-the-tauri-bundles
[GitHub Actions]: https://docs.github.com/en/actions
[github actions]: https://docs.github.com/en/actions
[usage limits billing and administration]: https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration
[tauri-svelte-template]: https://github.com/probablykasper/tauri-svelte-template
[Firmar código de Windows con acciones de GitHub]: ../distribution/sign-windows.md#bonus-sign-your-application-with-github-actions
[firma de código macOS con acciones de GitHub]: ../distribution/sign-macos.md#example
