# Rendere Il Tuo Cmi

Tauri consente alla tua app di avere una CLI attraverso [clap](https://github.com/clap-rs/clap), un robusto analizzatore di argomenti a riga di comando. Con una semplice definizione CLI nel tuo `tauri.conf. son` file, è possibile definire la propria interfaccia e leggere il suo argomento corrisponde alla mappa su JavaScript e/o Rust.

## Configurazione Base

Sotto `tauri.conf.json`, hai la seguente struttura per configurare l'interfaccia:

```json title=src-tauri/tauri.conf.json
{
  "tauri": {
    "cli": {
      "description": "", // descrizione del comando mostrata sull'aiuto
      "longDescription": "", // comando descrizione lunga che è mostrato in aiuto
      "beforeHelp": "", // contenuto da mostrare prima del testo di aiuto
      "afterHelp": "", // contenuto da mostrare dopo il testo di aiuto
      "args": [], // elenco di argomenti del comando, lo spiegheremo più tardi
      "subcommands": {
        "subcommand-name": {
          // configura un sottocomando accessibile
          // con `. app subcommand-name --arg1 --arg2 --etc`
          // configurazione come sopra, con "description", "args", ecc.
        }
      }
    }
  }
}
```

:::note

Tutte le configurazioni JSON qui sono solo campioni, molti altri campi sono stati omessi per motivi di chiarezza.

:::

## Aggiunta Argomenti

L'array `args` rappresenta l'elenco degli argomenti accettati dal suo comando o sottocomando. Puoi trovare maggiori dettagli sul modo di configurarli [qui][tauri config].

### Argomenti Positivi

Un argomento di posizione è identificato dalla sua posizione nell'elenco degli argomenti. Con la seguente configurazione:

```json tauri.conf.json
{
  "args": [
    {
      "name": "source",
      "index": 1,
      "takesValue": true
    },
    {
      "name": "destination",
      "index": 2,
      "takesValue": true
    }
  ]
}
```

Gli utenti possono eseguire la tua app come `./app tauri.txt dest. xt` and the arg match map will define `source` as `"tauri. xt"` e `destinazione` come `"dest.txt"`.

### Argomenti Con Nome

Un argomento chiamato è una coppia (chiave, valore) in cui la chiave identifica il valore. Con la seguente configurazione:

```json tauri.conf.json
{
  "args": [
    {
      "name": "type",
      "breve": "t",
      "takesValue": true,
      "multiplo": true,
      "possibleValues": ["foo", "bar"]
    }
  ]
}
```

Gli utenti possono eseguire la tua app come `./app --type foo bar`, `. app -t foo -t bar` o `. app --type=foo,bar` e l'arg corrisponde alla mappa definirà il tipo `` come `["foo", "bar"]`.

### Argomenti Bandiera

Un argomento di flag è una chiave autonoma la cui presenza o assenza fornisce informazioni alla tua applicazione. Con la seguente configurazione:

```json tauri.conf.json
{
  "args": [
    "name": "verbose",
    "short": "v",
    "multipleOccurrences": true
  ]
}
```

Gli utenti possono eseguire la tua app come `./app -v -v -v`, `. app --verbose --verbose --verbose` o `. app -vvv` and the arg match map will define `verbose` as `true`, con `occorrenze = 3`.

## Sottocomandi

Alcune applicazioni CLI hanno interfacce aggiuntive come sottocomandi. Per esempio, il `git` CLI ha `git branch`, `git commit` e `git push`. È possibile definire interfacce annidate aggiuntive con l'array `sottocomandi`:

```json tauri.conf.json
{
  "cli": {
...
    "subcommands": {
      "branch": {
        "args": []
      },
      "push": {
        "args": []
      }
    }
  }
}
```

La sua configurazione è la stessa della configurazione dell'applicazione root, con la `description`, `longDescription`, `args`, ecc.

## Lettura delle partite

### Ruggine

```rust
fn main() {
  tauri::Builder::default()
    .setup(<unk> app<unk> {
      match app.get_cli_matches() {
        // `matches` ecco uno Struct con { args, subcommand }.
        // `args` è `HashMap<String, ArgData>` dove `ArgData` è una struttura con { value, occurrences }.
        // `subcommand` è `Option<Box<SubcommandMatches>>` dove `SubcommandMatches` è una struttura con { name, matches }.
        Ok(matches) => {
          println! "{:?}", matches)
        }
        Err(_) => {}
      }
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### JavaScript

```js
import { getMatches } from '@tauri-apps/api/cli'

getMatches().then((matches) => {
  // do something with the { args, subcommand } match
})
```

## Documentazione completa

Puoi trovare ulteriori informazioni sulla configurazione CLI [qui][tauri config].

[tauri config]: ../../api/config.md#tauri
