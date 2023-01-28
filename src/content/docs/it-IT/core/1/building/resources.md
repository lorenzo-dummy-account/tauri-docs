---
sidebar_position: 8
---

# Incorporare File Aggiuntivi

Potrebbe essere necessario includere file aggiuntivi nel pacchetto di applicazioni che non fanno parte del frontend (il tuo `distDir`) direttamente o che sono troppo grandi per essere inseriti nel binario. Chiamiamo questi file `risorse`.

Per raggruppare i file a tua scelta, puoi aggiungere la proprietà `resources` al `tauri > bundle` object nel tuo `tauri. onf.json` file.

Scopri di più sulla configurazione di tauri.conf.json [qui][tauri.bundle].

`resources` expected a list of strings targeting files with absolute or relative paths. Supporta modelli globo nel caso in cui sia necessario includere più file da una directory.

Ecco un esempio per illustrare la configurazione. Questo non è un file completo `tauri.conf.json`:

```json title=tauri.conf.json
{
  "tauri": {
    "bundle": {
      "resources": [
        "/absolute/path/to/textfile. xt",
        "relative/path/to/jsonfile. son",
        "resources/*"
      ]
    },
    "allowlist": {
      "fs": {
        "scope": ["$RESOURCE/*"]
      }
    }
  }
}
```

:::note

Percorsi assoluti e percorsi contenenti componenti genitore (`../`) possono essere ammessi solo tramite `"$RESOURCE/*"`. Percorsi relativi come `"path/to/file.txt"` possono essere permessi esplicitamente tramite `"$RESOURCE/path/to/file.txt"`.

:::

## Accesso ai file in JavaScript

In questo esempio vogliamo raggruppare ulteriori file i18n json che assomigliano a questo:

```json title=de.json
{
  "hello": "Guten Tag!",
  "bye": "Auf Wiedersehen!"
}
```

In questo caso, memorizziamo questi file in una directory `lang` accanto al `tauri.conf.json`. Per questo aggiungiamo `"lang/*"` a `risorse` e `$RESOURCE/lang/*` al campo fs come mostrato sopra.

Nota che devi configurare la lista permessi per abilitare `path > tutte le` e le API [`fs`][] di cui hai bisogno, in questo esempio `fs > readTextFile`.

```javascript
import { resolveResource } from '@tauri-apps/api/path'
// alternativamente, use `window.__TAURI__.path. esolveResource`
import { readTextFile } from '@tauri-apps/api/fs'
// alternativamente, use `window.__TAURI__.fs.readTextFile`

// `lang/de.json` is the value specified on `tauri. onf.json > tauri > bundle > resources`
const resourcePath = await resolveResource('lang/de.json')
const langDe = JSON. arse(await readTextFile(resourcePath))

console.log(langDe.hello) // Questo stamperà 'Guten Tag!' sulla console devtools
```

## Accesso ai file in Rust

Questo è basato sull'esempio di cui sopra. Sul lato Rust hai bisogno di un'istanza del [`PathResolver`][] che puoi ottenere da [`App`][] e [`AppHandle`][]:

```rust
tauri::Builder::default()
  .setup(<unk> app<unk> {
    let resource_path = app.path_resolver()
      .resolve_resource("lang/de. son")
      . xpect("failed to resolve resource");

    let file = std::fs::File::open(&resource_path). nwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    println!("{}", lang_de. et("hello").unwrap()); // Questo stamperà 'Guten Tag!' al terminale

    Ok())
})
```

```rust
#[tauri::command]
fn hello(handle: tauri::AppHandle) -> String {
   let resource_path = handle. ath_resolver()
      .resolve_resource("lang/de.json")
      . xpect("failed to resolve resource");

    let file = std::fs::File::open(&resource_path). nwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    lang_de.get("hello").unwrap()
}
```

[tauri.bundle]: ../../api/config.md#tauri.bundle
[`fs`]: ../../api/js/fs/
[`PathResolver`]: https://docs.rs/tauri/latest/tauri/struct.PathResolver.html
[`App`]: https://docs.rs/tauri/latest/tauri/struct.App.html
[`AppHandle`]: https://docs.rs/tauri/latest/tauri/struct.AppHandle.html
