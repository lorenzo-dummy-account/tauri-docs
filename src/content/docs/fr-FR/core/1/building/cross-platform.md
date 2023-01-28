---
sidebar_position: 5
---

# Compilation inter-plateforme

Tauri repose lourdement sur les bibliothèques natives et les chaînes de compilation, donc la cross-compilation significative n'est **pas possible** pour le moment actuel. La prochaine meilleure option est de compiler un pipeline CI/CD hébergé sur quelque chose comme [GitHub Actions][], Azure Pipelines, GitLab, ou d'autres options. Le pipeline peut exécuter la compilation pour chaque plate-forme en même temps rendant le processus de compilation et de publication beaucoup plus facile.

Pour une installation facile, nous fournissons actuellement [Tauri Action][], une action GitHub qui s'exécute sur toutes les plateformes supportées, compile votre logiciel, génère les artefacts nécessaires et les télécharge vers une nouvelle version de GitHub.

## Tauri GitHub Action

Tauri Action tire parti des actions GitHub pour construire simultanément votre application en tant que binaire natif Tauri pour macOS, Linux et Windows et automatise la création d'une version GitHub.

Cette action GitHub peut également être utilisée comme pipeline de test pour votre application Tauri, la garantie de la compilation s'exécute correctement sur toutes les plates-formes pour chaque pull request envoyée, même si vous ne souhaitez pas créer de nouvelle version.

:::info Signature de code

Pour configurer la signature de code pour Windows et macOS sur votre flux de travail, suivez le guide spécifique pour chaque plateforme :

- [Signature de code Windows avec les actions GitHub][]
- [Signature de code macOS avec les actions GitHub][]

:::

### Commencer

Pour configurer l'action Tauri, vous devez d'abord configurer un dépôt GitHub. Vous pouvez utiliser cette action sur un dépôt qui n'a pas de Tauri configuré car il initialise automatiquement Tauri avant de construire et de le configurer pour utiliser vos artefacts.

Allez dans l'onglet Actions de votre projet GitHub et choisissez "Nouveau flux de travail", puis choisissez "Configurer un workflow vous-même". Remplacez le fichier par l'exemple de workflow de production [Tauri Action][]. Vous pouvez également configurer le flux de travail en fonction de l'exemple [en bas de cette page](#example-workflow)

### Configuration

Vous pouvez configurer Tauri avec les options `configPath`, `distPath` et `iconPath`. Voir les actions Lisez-moi pour plus de détails.


<!-- FIXME: tauriScript is currently broken.
  Custom Tauri CLI scripts can be run with the `tauriScript` option. So instead of running `yarn tauri build` or `npx tauri build`, `${tauriScript}` will be executed. This can be useful when you need custom build functionality such as when creating Tauri apps e.g. a `desktop:build` script.
-->

Lorsque votre application n'est pas à la racine du dépôt, utilisez l'entrée `projectPath`.

Vous pouvez modifier le nom du workflow, modifier les déclencheurs, et ajoutez d'autres étapes telles que `npm run lint` ou `npm run test`. La partie importante est que vous gardez la ligne ci-dessous à la fin du workflow, puisque ceci exécute le script de compilation et libère les artefacts:

```yaml
- utilisations : tauri-apps/tauri-action@v0
```

### Comment déclencher

Le workflow de publication dans les exemples README liés ci-dessus est déclenché par des poussées sur la branche "release". L'action crée automatiquement un tag et un titre pour la version GitHub en utilisant la version de l'application spécifiée dans `tauri.config.json`.

Vous pouvez également déclencher le workflow sur la poussée d'un tag de version tel que "app-v0.7.0". Pour cela, vous pouvez changer le début du flux de travail de la version:

```yaml
Nom : publier
sur:
  push:
    tags :
      - 'app-v*'
  workflow_dispatch:
```

### Exemple de Workflow

Ci-dessous se trouve un exemple de workflow qui a été mis en place pour fonctionner chaque fois qu'une nouvelle version est créée sur git.

Ce workflow met en place l'environnement sous les dernières versions de Windows, Ubuntu et macOS. Note sous `jobs.release.strategy.matrix` le tableau de plate-forme qui contient `macos-latest`, `ubuntu-20.04`, et `windows-latest`.

Les étapes que ce workflow prend sont:

1. Vérifier le dépôt en utilisant `actions/checkout@v3`
2. Configurez Node LTS et un cache pour les données globales du paquet npm/yarn/pnpm en utilisant `actions/setup-node@v3`.
3. Configurez Rust et un cache pour le dossier `target/` en utilisant `dtolnay/rust-toolchain@stable` et `swatinem/rust-cache@v2`.
4. Installe toutes les dépendances et exécute le script de compilation (pour l'application web).
5. Enfin, il utilise `tauri-apps/tauri-action@v0` pour exécuter `tauri build`, générer les artefacts et créer la version GitHub.

```yaml
Nom : Release
sur:
  push:
    tags :
      - 'v*'
  workflow_dispatch:

jobs:
  release:
    strategy:
      fail-fast: false
      matrice:
        platform: [macos-latest, Ubuntu-20. 4, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Install dependencies (ubuntu only)
        if: matrix. latform == 'ubuntu-20.04'
        # Vous pouvez supprimer libayatana-appindicator3-dev si vous n'utilisez pas la fonctionnalité de la barre d'état système.
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4. -dev libayatana-appindicator3-dev librsvg2-dev

      - nom: Configuration de Rust
        utilise: dtolnay/rust-toolchain@stable

      - nom: cache Rust
        utilise: swatinem/rust-cache@v2
        avec:
          espaces de travail : '. src-tauri -> target'

      - nom: Synchroniser la version du noeud et configurer le cache
        utilisations : actions/setup-node@v3
        avec:
          node-version: 'lts/*'
          cache: 'yarn' # Réglez ceci sur npm, yarn ou pnpm.

      - nom: Installez les dépendances des applications et build web
        # Supprimez `&& yarn build` si vous construisez votre frontend dans `beforeBuildCommand`
        run: yarn && yarn build # Changez cela en npm, yarn ou pnpm.

      - nom : Construire l'application
        utilise: tauri-apps/tauri-action@v0

        env:
          GITHUB_TOKEN : ${{ secrets.GITHUB_TOKEN }}
        avec:
          tagName: ${{ github.ref_name }} # Cela ne fonctionne que si votre workflow se déclenche sur de nouveaux tags.
          releaseName: 'App Name v__VERSION__' # tauri-action remplace \_\_VERSION\_\_ par la version de l'application.
          releaseBody: "Voir les ressources pour télécharger et installer cette version."
          releaseDraft: true
          prerelease: false
```

### Jeton d'environnement GitHub

Le jeton GitHub est automatiquement émis par GitHub pour chaque workflow exécuté sans autre configuration, ce qui signifie qu'il n'y a aucun risque de fuite secrète. Ce jeton n'a cependant que les permissions de lecture par défaut et vous pouvez obtenir une erreur "Ressource non accessible par intégration" lors de l'exécution du workflow. Si cela se produit, vous devrez peut-être ajouter des permissions d'écriture à ce jeton. Pour ce faire, allez dans les paramètres de votre projet GitHub, puis sélectionnez Actions, faites défiler vers le bas jusqu'à "Permissions de flux de travail" et cochez "Permissions de lecture et d'écriture".

Vous pouvez voir le jeton GitHub passé au workflow ci-dessous:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Notes d'utilisation

Assurez-vous de vérifier la documentation [pour les actions GitHub][github actions] pour mieux comprendre le fonctionnement de ce workflow. Prenez garde à lire la documentation de [limites d'utilisation, facturation et administration][usage limits billing and administration] pour les actions GitHub. Certains modèles de projet peuvent déjà implémenter ce flux de travail d'action GitHub, comme [tauri-svelte-template][]. Vous pouvez utiliser cette action sur un dépôt qui n'a pas configuré Tauri. Tauri s'initialise automatiquement avant la construction et la configuration pour utiliser vos artefacts web.

[Tauri Action]: https://github.com/tauri-apps/tauri-action
[Tauri Action]: https://github.com/tauri-apps/tauri-action#creating-a-release-and-uploading-the-tauri-bundles
[GitHub Actions]: https://docs.github.com/en/actions
[github actions]: https://docs.github.com/en/actions
[usage limits billing and administration]: https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration
[tauri-svelte-template]: https://github.com/probablykasper/tauri-svelte-template
[Signature de code Windows avec les actions GitHub]: ../distribution/sign-windows.md#bonus-sign-your-application-with-github-actions
[Signature de code macOS avec les actions GitHub]: ../distribution/sign-macos.md#example
