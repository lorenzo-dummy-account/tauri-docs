---
sidebar_position: 7
---

# Incorporar binarios externos

Puede que necesites incrustar binarios dependiendo para hacer que tu aplicación funcione o evitar que los usuarios instalen dependencias adicionales (por ejemplo, Node.js o Python). Llamamos a este binario un `sidecar`.

Para agrupar los binarios de su elección, puedes añadir la propiedad `externalBin` al objeto `tauri > paquete` en tu `tauri. onf.json`.

Vea más sobre la configuración de tauri.conf.json [aquí][tauri.bundle].

`externalBin` espera una lista de cadenas orientadas a binarios con rutas absolutas o relativas.

Aquí hay una muestra para ilustrar la configuración. Este no es un archivo `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relativo/ruta/a/binario",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": {
      "shell": {
        "sidecar": true,
        "scope": [
          { "name": "/absolute/path/to/sidecar", "sidecar": true },
          { "name": "relative/path/to/binary", "sidecar": true },
          { "name": "binaries/my-sidecar", "sidecar": true }
        ]
      }
    }
  }
}
```

Debe existir un binario con el mismo nombre y un sufijo `-$TARGET_TRIPLE` en la ruta especificada. Por ejemplo, `"externalBin": ["binaries/my-sidecar"]` requiere un ejecutable `src-tauri/binaries/my-sidecar-x86_64-unknown-linux-gnu` en Linux. Puedes encontrar el triple de destino de la plataforma actual ejecutando el siguiente comando:

```shell
rustc -Vv | grep host | cut -f2 -d' '
```

Aquí hay un script Node.js para añadir el objetivo triple a un binario:

```javascript
const execa = require('execa')
const fs = require('fs')

let extension = ''
if (process. latform === 'win32') {
  extension = '. xe'
}

async function main() {
  const rustInfo = (await execa('rustc', ['-vV']).stdout
  const targetTriple = /host: (\S+)/g. xec(rustInfo)[1]
  if (!targetTriple) {
    consola. rror('Error al determinar el objetivo de la plataforma triple')
  }
  fs. enameSync(
    `src-tauri/binaries/sidecar${extension}`,
    `src-tauri/binaries/sidecar-${targetTriple}${extension}`
  )
}

main(). atch((e) => {
  throw e
})
```

## Ejecutándolo desde JavaScript

En el código JavaScript, importe la clase `Command` en el módulo `shell` y utilice el método estático `sidecar`.

Tenga en cuenta que debe configurar la lista permitida para habilitar `shell > sidecar` y configurar todos los binarios en `shell > scope`.

```javascript
importar { Command } desde '@tauri-apps/api/shell'
// alternativamente, usar `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` es el valor EXACT especificado en `tauri. onf.json > tauri > paquete > externalBin`
const comando = Command.sidecar('binaries/my-sidecar')
const output = await command.execute()
```

## Ejecutándolo desde Rust

En el lado de Polvo, importa la estructura de `Comando` desde el módulo `tauri::api::process`:

```rust
// `new_sidecar()` espera sólo el nombre del archivo, NO toda la ruta como en JavaScript
let (mut rx, mut child) = Command::new_sidecar("my-sidecar")
  . xpect("failed to create `my-sidecar` binary command")
  . pawn()
  . xpect("Fallo al generar sidecar");

tauri::async_runtime::spawn(async move {
  // leer eventos como stdout
  while let Some(event) = rx. ecv(). esperar {
    if let CommandEvent::Stdout(line) = event {
      window
        . mit("message", Some(format!("'{}'", linea)))
        . xpect("failed to emit event");
      // write to stdin
      child. rite("message from Rust\n".as_bytes()).unwrap();
    }
  }
});
```

Tenga en cuenta que debe habilitar la función **process-command-api** Cargo (CLI de Tauri lo hará una vez que haya cambiado la configuración):

```toml
# Cargo.toml
[dependencies]
tauri = { version = "1", features = ["process-command-api", ศ}
```

## Argumentos pasados

Puedes pasar argumentos a los comandos Sidecar como lo harías para ejecutar `Comando`s normal (ver [Restringiendo el acceso a las APIs de Comando][]).

Primero, defina los argumentos que necesitan ser pasados al comando Sidecar en `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relativo/ruta/a/binario",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": {
      "shell": {
        "sidecar": true,
        "scope": [
          {
            "name": "binaries/my-sidecar",
            "sidecar": verdadero,
            "args": [
              "arg1",
              "-a",
              "--arg2",
              {
                "validator": "\\S+"
              }
            ]
          }
        ]
      }
    }
  }
}
```

Luego, para llamar al comando sidecar, simplemente pase **todos** los argumentos como un array:

```js
importar { Command } desde '@tauri-apps/api/shell'
// alternativamente, usar `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` es el valor EXACT especificado en `tauri. onf.json > tauri > paquete > externalBin`
// notar que el array de argumentos coincide con EXACTLY lo que se especifica en `tauri. onf.json`.
const command = Command.sidecar('binaries/my-sidecar', ['arg1', '-a', '--arg2', 'any-string-that-matches-the-validator'])
const output = await command.execute()
```

## Usar Node.js en un Sidecar

El ejemplo [sidecar Tauri][] demuestra cómo usar la API sidecar para ejecutar una aplicación Node.js en Tauri. Compila el código Node.js usando [pkg][] y utiliza los scripts anteriores para ejecutarlo.

[tauri.bundle]: ../../api/config.md#tauri.bundle
[sidecar Tauri]: https://github.com/tauri-apps/tauri/tree/dev/examples/sidecar
[Restringiendo el acceso a las APIs de Comando]: ../../api/js/shell.md#restricting-access-to-the-command-apis
[pkg]: https://github.com/vercel/pkg
