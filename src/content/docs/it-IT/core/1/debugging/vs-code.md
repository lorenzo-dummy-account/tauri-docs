# Debug nel codice VS

Questa guida descrive come configurare il debug in codice VS per il processo [Core in applicazioni Tauri][].

## Configurazione

Installa l'estensione [`vscode-lldb`][].

## Configura launch.json

Crea un file `.vscode/launch.json` e incolla il contenuto JSON sotto in esso:

```json title=".vscode/launch.json"
{
  // Use IntelliSense to learn about possible attributes.
  // Hover per visualizzare le descrizioni degli attributi esistenti.
  // Per ulteriori informazioni, visita: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2. ",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": {
        "args": [
          "build",
          "--manifest-path=. src-tauri/Cargo. oml",
          "--no-default-features"
        ]
      },
      // task per il `beforeDevCommand` se usato, deve essere configurato in `. esplorazione/compiti. son`
      "preLaunchTask": "ui:dev"
    },
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug, Produzione Tauri",
      "cargo": {
        "args": ["build", "--release", "--manifest-path=. src-tauri/Cargo. oml"]
      },
      // attività per il `beforeBuildCommand` se usato, deve essere configurato in `. scode/tasks.json`
      "preLaunchTask": "ui:build"
    }
  ]
}
```

Questo utilizza `cargo` direttamente per costruire l'applicazione Rust e caricarlo sia in modalità di sviluppo che di produzione.

Si noti che non utilizza il Tauri CLI, quindi le esclusive funzioni CLI non vengono eseguite. Gli script `beforeDevCommand` e `beforeBuildCommand` devono essere eseguiti in anticipo o configurati come attività nel campo `preLaunchTask`. Di seguito un esempio `.vscode/tasks. file son` che ha due attività, uno per un `beforeDevCommand` che genera un server di sviluppo e uno per `beforeBuildCommand`:

```json title=".vscode/tasks.json"
{
  // Vedi https://go.microsoft.com/fwlink/?LinkId=733558
  // per la documentazione sul formato tasks.json
  "version": "2.0. ",
  "tasks": [
    {
      "label": "ui:dev",
      "tipo": "guscio",
      // `dev` continua a funzionare in background
      // idealmente dovresti anche configurare un `problemMatcher`
      // vedi https://code. isualstudio. om/docs/editor/tasks#_can-a-background-task-be-used-as-a-prelaunchtask-in-launchjson
      "isBackground": true,
      // cambialo nel tuo `beforeDevCommand`:
      "command": "yarn",
      "args": ["dev"]
    },
    {
      "label": "ui:build",
      "type": "shell",
      // cambialo nel tuo `beforeBuildCommand`:
      "command": "yarn",
      "args": ["build"]
    }
  ]
}
```

Ora puoi impostare breakpoint in `src-tauri/src/main.rs` o in qualsiasi altro file Rust e iniziare a debug premendo `F5`.

[`vscode-lldb`]: https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb

[Core in applicazioni Tauri]: ../../references/architecture/process-model.md#the-core-process
