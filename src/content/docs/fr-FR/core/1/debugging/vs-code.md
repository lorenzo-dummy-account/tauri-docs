# Débogage dans le code VS

Ce guide décrit comment configurer le débogage dans le code VS pour le [processus Core dans les applications Tauri][].

## Configuration

Installez l'extension [`vscode-lldb`][].

## Configurer launch.json

Créez un fichier `.vscode/launch.json` et collez le contenu JSON ci-dessous dans celui-ci :

```json title=".vscode/launch.json"
{
  // Utilisez IntelliSense pour en savoir plus sur les attributs possibles.
  // Survolez pour voir les descriptions des attributs existants.
  // Pour plus d'informations, visitez : https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2. ",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargaison": {
        "args": [
          "build",
          "--manifest-path=. src-tauri/Cargo. oml",
          "--no-default-features"
        ]
      },
      // tâche pour le `beforeDevCommand` si utilisé, doit être configuré dans `. scode/tâches. son`
      "preLaunchTask": "ui:dev"
    },
    {
      "type": "lldb",
      "request": "launch",
      "nom": "Debug de production de Tauri",
      "cargo": {
        "args": ["build", "--release", "--manifest-path=. src-tauri/Cargo. oml"]
      },
      // tâche pour le `beforeBuildCommand` si utilisé, doit être configuré dans `. scode/tasks.json`
      "preLaunchTask": "ui:build"
    }
  ]
}
```

Cela utilise `cargo` directement pour construire l'application Rust et la charger en mode de développement et de production.

Notez qu'il n'utilise pas le CLI Tauri, donc les fonctionnalités exclusives de CLI ne sont pas exécutées. Les scripts `beforeDevCommand` et `beforeBuildCommand` doivent être exécutés préalablement ou configurés en tant que tâche dans le champ `preLaunchTask`. Voici un exemple `.vscode/tâches. fils` fichier qui a deux tâches, un pour une `beforeDevCommand` qui fait apparaître un serveur de développement et un pour `beforeBuildCommand`:

```json title=".vscode/tasks.json"
{
  // Voir https://go.microsoft.com/fwlink/?LinkId=733558
  // pour la documentation sur le format tasks.json
  "version": "2.0. ",
  "tasks": [
    {
      "label": "ui:dev",
      "type": "coque",
      // `dev` continue de fonctionner en arrière-plan
      // idéalement vous devriez aussi configurer un `problemMatcher`
      // voir https://code. Etudiant om/docs/editor/tasks#_can-a-background-task-be-used-as-a-prelaunchtask-in-launchjson
      "isBackground": true,
      // changez cela pour votre `beforeDevCommand`:
      "command": "yarn",
      "args": ["dev"]
    },
    {
      "label": "ui:build",
      "type": "shell",
      // changez cela pour votre `beforeBuildCommand`:
      "command": "yarn",
      "args": ["build"]
    }
  ]
}
```

Vous pouvez maintenant définir des points d'arrêt dans `src-tauri/src/main.rs` ou tout autre fichier Rust et commencer à déboguer en appuyant sur `F5`.

[`vscode-lldb`]: https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb

[processus Core dans les applications Tauri]: ../../references/architecture/process-model.md#the-core-process
