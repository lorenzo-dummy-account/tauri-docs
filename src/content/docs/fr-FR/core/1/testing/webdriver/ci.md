# Intégration continue

Utiliser Linux et certains programmes pour créer un faux affichage, il est possible d'exécuter [WebDriver][] tests avec [`tauri-driver`][] sur votre CI. L'exemple suivant utilise l'exemple [WebdriverIO][] que nous avons [précédemment construit ensemble][] et GitHub Actions.

Cela signifie les hypothèses suivantes :

1. L'application Tauri est à la racine du dépôt et le binaire se construit lorsque vous exécutez `cargo build --release`.
2. L'exécuteur de test [WebDriverIO][] est dans le répertoire `webdriver/webdriverio` et s'exécute lorsque `yarn test` est utilisé dans ce répertoire .

Ce qui suit est un fichier commenté de workflow GitHub Actions sur `.github/workflows/webdriver.yml`

```yaml
# exécute cette action lorsque le dépôt est poussé vers
sur: [push]

# le nom de notre workflow
nom: WebDriver

jobs:
  # un seul job nommé test
  test :
    # le nom d'affichage de la tâche de test
    nom: WebDriverIO Test Runner

    # nous voulons exécuter sur le dernier environnement linux
    runs-on: ubuntu-latest

    # les étapes que notre tâche est exécutée **in order**
    étapes :
      # checkout le code sur l'exécuteur de workflow
      - uses: actions/checkout@v2

      # installer les dépendances système dont Tauri a besoin pour compiler sous Linux.
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
      # note: la version tauri-driver est indépendante de toute autre version de Tauri
      - nom: Installer tauri-driver
        utilise: actions-rs/cargo@v1
        avec:
          commande: install
          args: tauri-driver

      # exécuter la suite de test WebdriverIO.
      # nous l'exécutons via `xvfb-run` (la dépendance que nous avons installée plus tôt) pour avoir un faux
      # serveur d'affichage qui permet à notre application de fonctionner headless sans aucune modification au code
      - nom: WebdriverIO
        run: xvfb-run yarn test
        working-directory: webdriver/webdriverio
```

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[WebdriverIO]: https://webdriver.io/
[WebDriverIO]: https://webdriver.io/
[précédemment construit ensemble]: ./example/webdriverio.md
