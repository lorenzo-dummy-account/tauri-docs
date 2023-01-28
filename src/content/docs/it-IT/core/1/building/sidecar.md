---
sidebar_position: 7
---

# Incorporare Binari Esterni

Potrebbe essere necessario incorporare a seconda dei binari per far funzionare l'applicazione o impedire agli utenti di installare dipendenze aggiuntive (ad esempio, Node.js o Python). Chiamiamo questo binario un `sidecar`.

Per raggruppare i binari a tua scelta, puoi aggiungere la proprietà `externalBin` all'oggetto `tauri > bundle` nel tuo `tauri. onf.json`.

Scopri di più sulla configurazione di tauri.conf.json [qui][tauri.bundle].

`externalBin` prevede un elenco di stringhe che servono binari con percorsi assoluti o relativi.

Ecco un esempio per illustrare la configurazione. Questo non è un file completo `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relative/path/to/binary",
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

Un binario con lo stesso nome e un suffisso `-$TARGET_TRIPLE` deve esistere sul percorso specificato. Per esempio, `"externalBin": ["binaries/my-sidecar"]` richiede un `src-tauri/binaries/my-sidecar-x86_64-unknown-linux-gnu` eseguibile su Linux. È possibile trovare il target della piattaforma attuale triplo eseguendo il seguente comando:

```shell
rustc -Vv | grep host | cut -f2 -d' '
```

Ecco uno script Node.js per aggiungere il triplo di destinazione a un binario:

```javascript
const execa = require('execa')
const fs = require('fs')

let extension = ''
if (process. latform === 'win32') {
  extension = '. xe'
}

async function main() {
  const rustInfo = (await execa('rustc', ['-vV'])).stdout
  const targetTriple = /host: (\S+)/g. xec(rustInfo)[1]
  if (!targetTriple) {
    console. rror('Failed to determine platform target triple')
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

## Esecuzione da JavaScript

Nel codice JavaScript, importa la classe `Command` sul modulo `shell` e usa il metodo statico `sidecar`.

Nota che devi configurare la lista permessi per abilitare la shell ` > sidecar` e configurare tutti i binari in `shell > scope`.

```javascript
import { Command } from '@tauri-apps/api/shell'
// alternativamente, use `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` is the EXACT value specified on `tauri. onf.json > tauri > bundle > externalBin`
const command = Command.sidecar('binaries/my-sidecar')
const output = await command.execute()
```

## Esecuzione da Ruggine

Sul lato Ruggine, importa la struttura `Command` dal modulo `tauri::api::process`:

```rust
// `new_sidecar()` si aspetta solo il nome del file, NON l'intero percorso come in JavaScript
let (mut rx, mut child) = Command::new_sidecar("my-sidecar")
  . xpect("non è riuscito a creare il comando binario `my-sidecar`")
  . pawn()
  . xpect("Impossibile generare lateralmente");

tauri::async_runtime::spawn(async move {
  // leggi eventi come stdout
  mentre let Some(event) = rx. ecv(). wait {
    if let CommandEvent::Stdout(line) = event {
      window
        . mit("message", Some(format!("'{}'", line)))
        . xpect("non è riuscito ad emettere evento");
      // scrivi a stdin
      figlio. rite("messaggio da Rust\n".as_bytes()).unwrap();
    }
  }
});
```

Nota che devi abilitare la funzione **process-command-api** Cargo (la CLI di Tauri farà questo per te una volta che hai cambiato la configurazione):

```toml
# Cargo.toml
[dependencies]
tauri = { version = "1", features = ["process-command-api", ...] }
```

## Argomenti di passaggio

È possibile passare argomenti a comandi Sidecar proprio come si farebbe per eseguire normali `Comando`s (vedi [Restricting access to the Command API][]).

In primo luogo, definire gli argomenti che devono essere passati al comando Sidecar in `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relative/path/to/binary",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": {
      "shell": {
        "sidecar": true,
        "scope": [
          {
            "name": "binaries/my-sidecar",
            "sidecar": vero,
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

Poi, per chiamare il comando sidecar, basta passare in **tutti** gli argomenti come un array:

```js
import { Command } from '@tauri-apps/api/shell'
// alternativamente, use `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` is the EXACT value specified on `tauri. onf.json > tauri > bundle > externalBin`
// Notare che l'array degli args corrisponde ESATTAMENTE a quanto specificato su `tauri. onf.json`.
const command = Command.sidecar('binaries/my-sidecar', ['arg1', '-a', '--arg2', 'any-string-that-matches-the-validator'])
const output = await command.execute()
```

## Utilizzo di Node.js su un Sidecar

L'esempio di sidecar Tauri [][] dimostra come utilizzare l'API sidecar per eseguire un'applicazione Node.js su Tauri. Compila il codice Node.js usando [pkg][] e usa gli script sopra per eseguirlo.

[tauri.bundle]: ../../api/config.md#tauri.bundle
[3]: https://github.com/tauri-apps/tauri/tree/dev/examples/sidecar
[4]: https://github.com/tauri-apps/tauri/tree/dev/examples/sidecar
[Restricting access to the Command API]: ../../api/js/shell.md#restricting-access-to-the-command-apis
[pkg]: https://github.com/vercel/pkg
