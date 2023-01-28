importa comando da '@theme/Command'

# Icone

Tauri è dotato di un iconset predefinito basato sul suo logo. Questo non è quello che vuoi quando spedisci la tua applicazione. Per rimediare a questa situazione comune, Tauri fornisce il comando `icon` che prenderà un file di input (`". app-icon.png"` per impostazione predefinita) e creare tutte le icone necessarie per le varie piattaforme.

:::info Nota sui tipi di file

- `icon.icns` = macOS
- `icon.ico` = Windows
- `*.png` = Linux
- `Square*Logo.png` & `StoreLogo.png` = Attualmente inutilizzato ma destinato agli obiettivi AppX/MS Store.

Si noti che i tipi di icone possono essere utilizzati su piattaforme diverse da quelle sopra elencate (specialmente `png`). Pertanto consigliamo di includere tutte le icone anche se si intende costruire solo per un sottoinsieme di piattaforme.

:::

## Utilizzo Dei Comandi

A partire da `@tauri-apps/cli` / `tauri-cli` versione 1.1 il sottocomando `icon` fa parte del client principale:

<Command name="icon" />

```console
> cargo tauri icon --help
cargo-tauri-icon 1.1.

Genera varie icone per tutte le principali piattaforme

USAGE:
    cargo tauri icon [OPTIONS] [INPUT]

ARGS:
    <INPUT>    Percorso all'icona sorgente (png, 1240x1240px con trasparenza) [default: . app-icon. ng]

OPZIONI:
    -h, --help Stampa informazioni di aiuto
    -o, --output <OUTPUT>    Directory di output. Default: directory 'icons' accanto al file tauri.conf.json
    -v, --verbose Abilita la registrazione dettagliata
    -V, --version Stampa informazioni di versione
```

Per impostazione predefinita, le icone saranno posizionate nella cartella `src-tauri/icone` dove saranno automaticamente incluse nella tua app integrata. Se si desidera generare le icone da una posizione diversa, è possibile modificare questa parte del file `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "icon": [
        "icons/32x32. ng",
        "icone/128x128. ng",
        "icons/128x128@2x.png",
        "icons/icon. cns",
        "icone/icona. co"
      ]
    }
  }
}
```

## Creazione manuale delle icone

Se preferisci costruire queste icone da solo (se vuoi avere un design più semplice per piccole dimensioni o perché non vuoi dipendere dal ridimensionamento dell'immagine interna del CLI), le dimensioni e i nomi dei livelli richiesti per il file [`icns`][] sono descritti [nel repo Tauri][] e il file [`ico`][] deve includere livelli per 16, 24, 32, 48, 64 e 256 pixel. Per una visualizzazione ottimale dell'immagine ICO _in sviluppo_, il livello 32px dovrebbe essere il primo livello.

[nel repo Tauri]: https://github.com/tauri-apps/tauri/blob/dev/tooling/cli/src/helpers/icns.json
[`icns`]: https://en.wikipedia.org/wiki/Apple_Icon_Image_format
[`ico`]: https://en.wikipedia.org/wiki/ICO_(file_format)
