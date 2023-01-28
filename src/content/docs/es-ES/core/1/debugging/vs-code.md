# Depuración en código VS

Esta guía describe cómo configurar la depuración en el código VS para el [Core Process en aplicaciones Tauri][].

## Configurar

Instala la extensión [`vscode-lldb`][].

## Configurar launch.json

Cree un archivo `.vscode/launch.json` y pegue el siguiente contenido JSON en él:

```json title=".vscode/launch.json"
{
  // Usar IntelliSense para aprender sobre posibles atributos.
  // Hover para ver las descripciones de los atributos existentes.
  // Para más información, visite: https://go.microsoft.com/fwlink/?linkid=830387
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
      // tarea para el `beforeDevCommand` si es usado, debe configurarse en `. scode/tareas. hijo`
      "preLaunchTask": "ui:dev"
    },
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Production Debug",
      "cargo": {
        "args": ["build", "--release", "--manifest-path=. src-tauri/Cargo. oml"]
      },
      // tarea para el `beforeBuildCommand` si se usa, debe configurarse en `. scode/tasks.json`
      "preLaunchTask": "ui:build"
    }
  ]
}
```

Esto utiliza `carga` directamente para construir la aplicación Rust y cargarla tanto en modos de desarrollo como de producción.

Tenga en cuenta que no utiliza la CLI de Tauri, por lo que las características exclusivas de CLI no se ejecutan. Los scripts `beforeDevCommand` y `beforeBuildCommand` deben ejecutarse de antemano o configurarse como una tarea en el campo `preLaunchTask`. A continuación se muestra un ejemplo `.vscode/tareas. hijo` archivo que tiene dos tareas, una para una `beforeDevmand` que genera un servidor de desarrollo y otra para `beforeBuildCommand`:

```json title=".vscode/tasks.json"
{
  // Ver https://go.microsoft.com/fwlink/?LinkId=733558
  // para la documentación sobre el formato tasks.json
  "version": "2.0. ",
  "tasks": [
    {
      "label": "ui:dev",
      "type": "shell",
      // `dev` sigue corriendo en segundo plano
      // idealmente deberías configurar un `problemMatcher`
      // ver https://code. isualstudio. om/docs/editor/tareas#_can-a-background-task-be-used-as-a-prelaunchtask-in-launchjson
      "isBackground": true,
      // cambia esto a tu `beforeDevCommand`:
      "command": "yarn",
      "args": ["dev"]
    },
    {
      "label": "ui:build",
      "type": "shell",
      // cambia esto a tu `beforeBuildCommand`:
      "command": "yarn",
      "args": ["build"]
    }
  ]
}
```

Ahora puedes establecer puntos de interrupción en `src-tauri/src/main.rs` o cualquier otro archivo de Rust y empezar a depurar pulsando `F5`.

[`vscode-lldb`]: https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb

[Core Process en aplicaciones Tauri]: ../../references/architecture/process-model.md#the-core-process
