# Integrazione Continua

Utilizzando Linux e alcuni programmi per creare un falso display, è possibile eseguire [test WebDriver][] con [`tauri-driver`][] sul tuo CI. Il seguente esempio utilizza l'esempio [WebdriverIO][] che [in precedenza abbiamo costruito insieme][] e GitHub Actions.

Ciò significa le seguenti ipotesi:

1. L'applicazione Tauri è nella root del repository e le build binarie quando si esegue `cargo build --release`.
2. Il [WebDriverIO][] test runner è nella directory `webdriver/webdriverio` e viene eseguito quando `yarn test` viene utilizzato in quella directory .

Di seguito è riportato un file di workflow di GitHub Actions commentato su `.github/workflows/webdriver.yml`

```yaml
# eseguire questa azione quando il repository viene inviato a
su: [push]

# il nome del nostro flusso di lavoro
nome: WebDriver

lavori:
  # un singolo lavoro chiamato test
  test:
    # il nome visualizzato del lavoro di test
    nome: WebDriverIO Test Runner

    # vogliamo eseguire sull'ultimo ambiente linux
    runs-on: ubuntu-latest

    # i passi che il nostro job esegue **in ordine**
    passi:
      # checkout il codice sul workflow runner
      - uses: actions/checkout@v2

      # install le dipendenze di sistema che Tauri deve compilare su Linux.
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
      # nota: la versione tauri-driver è indipendente da qualsiasi altra versione Tauri
      - nome: Installazione tauri-driver
        utilizza: actions-rs/cargo@v1
        con:
          comando: install
          args: tauri-driver

      # eseguire la suite di test WebdriverIO.
      # lo eseguiamo attraverso `xvfb-run` (la dipendenza che abbiamo installato in precedenza) per avere un falso
      # display server che permette alla nostra applicazione di eseguire senza intestazione senza alcuna modifica al codice
      - nome: WebdriverIO
        run: xvfb-run yarn test
        working-directory: webdriver/webdriverio
```

[test WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[WebdriverIO]: https://webdriver.io/
[WebDriverIO]: https://webdriver.io/
[in precedenza abbiamo costruito insieme]: ./example/webdriverio.md
