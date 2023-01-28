# Integración continua

Utilizando Linux y algunos programas para crear una pantalla falsa, es posible ejecutar [pruebas de WebDriver][] con [`tauri-driver`][] en su CI. El siguiente ejemplo utiliza el ejemplo [WebdriverIO][] que hemos creado previamente [][] y Acciones de GitHub.

Esto significa los siguientes supuestos:

1. La aplicación Tauri está en la raíz del repositorio y las construcciones binarias cuando se ejecuta `carga build --release`.
2. El gestor de pruebas [WebDriverIO][] está en el directorio `webdriver/webdriverio` y se ejecuta cuando `yarn test` se utiliza en ese directorio .

Lo siguiente es un archivo de flujo de trabajo de GitHub Actions comentado en `.github/workflows/webdriver.yml`

```yaml
# ejecutar esta acción cuando el repositorio se envía a
en: [push]

# el nombre de nuestro workflow
name: WebDriver

jobs:
  # un solo trabajo llamado prueba
  test:
    # el nombre mostrado del trabajo
    name: WebDriverIO Test Runner

    # queremos ejecutar en el último entorno linux
    runs-on: ubuntu-latest

    # los pasos que nuestro trabajo ejecuta **en orden**
    pasos:
      # checkout del código del gestor de flujo de trabajo
      - usos: actions/checkout@v2

      # instala dependencias del sistema que Tauri necesita compilar en Linux.
      # note the extra dependencies for `tauri-driver` to run which are: `webkit2gtk-driver` and `xvfb`
      - name: Tauri dependencies
        run: >-
          sudo apt-get update &&
          sudo apt-get install -y
          libgtk-3-dev
          libayatana-appindicator3-dev
          libwebkit2gtk-4.0-dev
          webkit2gtk-driver
          xvfb

      # install the latest Rust stable
      - name: Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      # we run our rust tests before the webdriver tests to avoid testing a broken application
      - name: Cargo test
        uses: actions-rs/cargo@v1
        with:
          command: test

      # build a release build of our application to be used during our WebdriverIO tests
      - name: Cargo build
        uses: actions-rs/cargo@v1
        with:
          command: build
          args: --release

      # install the latest stable node version at the time of writing
      - name: Node v16
        uses: actions/setup-node@v2
        with:
          node-version: 16.x

      # install our Node.js dependencies with Yarn
      - name: Yarn install
        run: yarn install
        working-directory: webdriver/webdriverio

      # install the latest version of `tauri-driver`.
      # nota: la versión tauri-driver es independiente de cualquier otra versión de Tauri
      - name: Install tauri-driver
        uses: actions-rs/cargo@v1
        with:
          command: install
          args: tauri-driver

      # run the WebdriverIO test suite.
      # lo ejecutamos a través de `xvfb-run` (la dependencia que instalamos anteriormente) para tener un falso
      # servidor de visualización que permite a nuestra aplicación correr sin cabeceras sin ningún cambio en el código
      - nombre: WebdriverIO
        run: xvfb-run yarn test
        working-directory: webdriver/webdriverio
```

[pruebas de WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[WebdriverIO]: https://webdriver.io/
[WebDriverIO]: https://webdriver.io/
[4]: ./example/webdriverio.md
[5]: ./example/webdriverio.md
