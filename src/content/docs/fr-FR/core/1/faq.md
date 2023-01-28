---
title: Foire aux questions
sidebar_position: 10
description: Corrige les problèmes communs
---

## Comment puis-je utiliser les modifications non publiées de Tauri ?

Pour utiliser Tauri de GitHub (version du bord de saignement), vous devez modifier votre fichier `Cargo.toml` et mettre à jour votre CLI et votre API.

<details>
  <summary>Tirer la caisse rouillée de la source</summary>

Ajouter ceci à votre fichier `Cargo.toml`:

```toml title=Cargo.toml
[patch.crates-io]
tauri = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
tauri-build = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
```

Cela forcera toutes vos dépendances à utiliser `tauri` et `tauri-build` depuis Git au lieu de crates.io.

</details>

<details>
  <summary>Utilisation de la CLI Tauri depuis la source</summary>

Si vous utilisez le CLI, vous pouvez l'installer directement à partir de GitHub :

```shell
cargo install --git https://github.com/tauri-apps/tauri --branch dev tauri-cli
```

Si vous utilisez le paquet `@tauri-apps/cli` , vous devrez cloner le dépôt et le compiler :

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/cli/node
yarn
yarn build
```

Pour l'utiliser, exécutez directement avec le noeud :

```shell
node /path/to/tauri/tooling/cli/node/tauri.js dev
node /path/to/tauri/tooling/cli/node/tauri.js build
```

Vous pouvez également exécuter votre application directement avec Cargo :

```shell
cd src-tauri
cargo run --no-default-features # au lieu de tauri dev
cargo build # au lieu de tauri build - ne va pas empaqueter votre application
```

</details>

<details>
  <summary>Utilisation de l'API Tauri depuis la source</summary>

Il est recommandé d'utiliser également le paquet de l'API Tauri depuis la source lorsque vous utilisez la caisse Tauri de GitHub (bien que cela ne soit pas nécessaire). Pour le compiler à partir des sources, exécutez le script suivant :

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/api
yarn
yarn build
```

Maintenant vous pouvez le lier en utilisant yarn:

```shell
cd dist
yarn link
cd /path/to/votre/projet
yarn link @tauri-apps/api
```

Ou vous pouvez changer votre package.json pour pointer directement vers le dossier dist :

```json title=package.json
{
  "dependencies": {
    "@tauri-apps/api": "/path/to/tauri/tooling/api/dist"
  }
}
```

</details>

## Dois-je utiliser Node ou Cargo? {#node-or-cargo}

Même si l'installation du CLI via Cargo est l'option préférée, il doit compiler tout le binaire à partir de zéro lorsque vous l'installez. Si vous êtes dans un environnement CI ou sur une machine très lente, il vaut mieux choisir une autre méthode d'installation.

Comme le CLI est écrit en Rust, il est naturellement disponible via [crates.io][] et peut être installé avec Cargo.

Nous compilons également le CLI en tant qu'addon natif Node.js et le distribuons [via npm][]. Ceci présente plusieurs avantages par rapport à la méthode d'installation de Cargo :

1. L'CLI est pré-compilée, ce qui accélère considérablement les temps d'installation
2. Vous pouvez épingler une version spécifique dans votre fichier package.json
3. Si vous développez des outils personnalisés autour de Tauri, vous pouvez importer le CLI en tant que module JavaScript normal
4. Vous pouvez installer le CLI en utilisant un gestionnaire JavaScript

## Liste de navigation recommandée

Nous vous recommandons d'utiliser `es2021`, `les 3 dernières versions de Chrome`et `safari13` pour votre liste de navigateurs et les cibles de compilation. Tauri tire parti du moteur de rendu natif de l'OS (WebKit sur macOS, WebView2 sur Windows et WebKitGTK sur Linux).

## Construire un conflit avec Homebrew sous Linux

Homebrew sous Linux inclut son propre `pkg-config` (un utilitaire pour trouver des bibliothèques sur le système). Cela peut causer des conflits lors de l'installation du même paquet `pkg-config` pour Tauri (généralement installé via le gestionnaire de paquets comme `apt`). Lorsque vous essayez de construire une application Tauri, elle essaiera d'invoquer `pkg-config` et finira par appeler celle d'Homebrew. Si Homebrew n'a pas été utilisé pour installer les dépendances de Tauri, cela peut causer des erreurs.

Les erreurs _habituellement_ contiendront des messages suivant la ligne `d'erreur: impossible d'exécuter la commande de compilation personnalisée pour X` - `Le paquet Y n'a pas été trouvé dans le chemin de recherche de pkg-config.`. Notez que vous pouvez voir des erreurs similaires si les dépendances requises ne sont pas du tout installées.

Il y a deux solutions à cette question:

1. [Désinstaller Homebrew][]
2. Définissez la variable d'environnement `PKG_CONFIG_PATH` pour pointer vers la bonne `pkg-config` avant de construire une application Tauri

[crates.io]: https://crates.io/crates/tauri-cli
[via npm]: https://www.npmjs.com/package/@tauri-apps/cli
[Désinstaller Homebrew]: https://docs.brew.sh/FAQ#how-do-i-uninstall-homebrew
