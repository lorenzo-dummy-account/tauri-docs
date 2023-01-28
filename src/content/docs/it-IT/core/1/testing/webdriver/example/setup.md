importa HelloTauriWebdriver da '@site/static/img/webdriver/hello-tauri-webdriver.png'

# Esempio Di Configurazione

Questa applicazione di esempio si concentra esclusivamente sull'aggiunta di test WebDriver a un progetto già esistente. Per avere un progetto da testare nelle due sezioni seguenti, imposteremo un'applicazione Tauri estremamente minima per l'utilizzo in il nostro test. Non useremo il Tauri CLI, nessuna dipendenza dal frontend o passi di costruzione, e non aggregeremo l'applicazione in seguito. Questo per mostrare esattamente una suite minima per mostrare l'aggiunta di test WebDriver ad un'applicazione esistente.

Se si desidera solo vedere il progetto di esempio finito che utilizza ciò che verrà mostrato in questa guida di esempio, poi puoi vedere https://github. om/chippers/hello_tauri.

## Inizializzazione di un progetto di carico

Vogliamo creare un nuovo progetto Cargo binario per ospitare questa applicazione di esempio. Possiamo facilmente farlo dalla linea di comando con `cargo new hello-tauri-webdriver --bin`, che impalcerà un minimo progetto binario Cargo per noi. Questa directory servirà come directory di lavoro per il resto di questa guida, quindi assicurati che i comandi che esegui siano all'interno di questa nuova directory `hello-tauri-webdriver/`.

## Creare un Frontend minimale

Creeremo un file HTML minimo per agire come front end della nostra applicazione di esempio. Inoltre useremo alcune cose da questo frontend più tardi durante i nostri test WebDriver.

In primo luogo, creiamo il nostro Tauri `distDir` che sappiamo che avremo bisogno di una volta che costruiremo la parte Tauri dell'applicazione. `mkdir dist` dovrebbe creare una nuova directory chiamata `dist/` in cui inseriremo il seguente file `index.html`.

`dist/index.html`:

```html
<! OCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Ciao Tauri!</title>
    <style>
      body {
        /* Add a nice colorscheme */
        background-color: #222831;
        colore: #ececec;

        /* Rendi il corpo la dimensione esatta della finestra */
        margine: 0;
        altezza: 100vh;
        larghezza: 100vw;

        /* Verticalmente e orizzontalmente centra i figli del tag del corpo */
        display: flex;
        giustifica-contenuto: centro;
        elementi di allineamento: centro;
      }
    </style>
  </head>
  <body>
    <h1>Ciao, Tauri!</h1>
  </body>
</html>
```

## Aggiungere Tauri al progetto Cargo

Successivamente, aggiungeremo gli elementi necessari per trasformare il nostro progetto Cargo in un progetto Tauri. In primo luogo, sta aggiungendo le dipendenze al manifesto di carico (`Cargo. oml`) in modo che Cargo sappia tirare le nostre dipendenze durante la costruzione.

`Cargo.toml`:

```toml
[package]
name = "hello-tauri-webdriver"
version = "0.1.0"
edition = "2021"
rust-version = "1. 6"

# Necessario impostare alcune cose per Tauri al tempo di costruzione
[build-dependencies]
tauri-build = "1"

# La dipendenza effettiva di Tauri, insieme a `custom-protocol` per servire le pagine.
[dependencies]
tauri = { version = "1", features = ["custom-protocol"] }

# Crea --release build un binario piccolo (opt-level = "s") e veloce (lto = true).
# Questo è completamente opzionale, ma mostra che testare l'applicazione come vicino alle impostazioni di rilascio
# tipiche è possibile. Nota: questo rallenterà la compilazione.
[profile.release]
incremental = false
codegen-units = 1
panic = "abort"
opt-level = "s"
lto = true
```

Abbiamo aggiunto un `[build-dependency]` come potresti aver notato. Per utilizzare la dipendenza di generazione, dobbiamo usarla da uno script build . Ne creeremo uno ora a `build.rs`.

`build.rs`:

```rust
fn main() {
    // Guarda solo la directory `dist/` per il recompiling, impedendo inutili
    // modifiche quando modifichiamo i file in altre sottodirectory del progetto.
    println!("cargo:rerun-if-changed=dist");

    // Esegui gli helpers Tauri build-time
    tauri_build::build()
}
```

Il nostro progetto Cargo ora sa come tirare e costruire le nostre dipendenze Tauri con tutte quelle impostazioni. Finiamo di rendere questo esempio minimale un'applicazione Tauri impostando Tauri nel codice del progetto reale. Modificheremo il file `src/main.rs` per aggiungere questa funzionalità Tauri.

`src/main.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("unable to run Tauri application");
}
```

Molto semplice, giusto?

## Tauri Configuration

Avremo bisogno di 2 cose per costruire con successo l'applicazione. In primo luogo, abbiamo bisogno di un file di icone. È possibile utilizzare qualsiasi PNG per questa parte successiva e copiarlo in `icon.png`. Tipicamente, questo sarà fornito come parte del ponteggio quando si utilizza il CLI Tauri per creare un progetto. Per ottenere l'icona Tauri predefinita, possiamo scaricare l'icona usata dal repository di esempio Hello Tauri con il comando `curl -L "https://github. om/chippers/hello_tauri/raw/main/icon.png" --output icon.png`.

Avremo bisogno di un `tauri.conf.json` per impostare alcuni valori di configurazione importanti per Tauri. Ancora una volta, questo sarebbe tipicamente venire dal `tauri init` comando ponteggi, ma qui creeremo la nostra configurazione minimale .

`tauri.conf.json`:

```json
{
  "build": {
    "distDir": "dist"
  },
  "tauri": {
    "bundle": {
      "identifier": "studio. auri.hello_tauri_webdriver",
      "icona": ["icona. ng"]
    },
    "allowlist": {
      "all": false
    },
    "windows": [
      {
        "width": 800,
        "altezza": 600,
        "ridimensionabile": true,
        "schermo intero": falso
      }
    ]
  }
}
```

Andrò sopra alcuni di questi. Puoi vedere la directory `dist/` che abbiamo creato precedentemente specificata come la proprietà `distDir`. Abbiamo impostato un identificatore bundle in modo che l'applicazione costruita abbia un id univoco e imposta l'icona `. ng` come unica icona . Non utilizziamo nessuna API Tauri o funzionalità, quindi le disattiviamo in `allowlist` impostando `"tutti": false`. I valori della finestra semplicemente impostano una singola finestra da creare con alcuni valori predefiniti ragionevoli.

A questo punto, abbiamo un'applicazione Hello World di base che dovrebbe mostrare un semplice saluto durante l'esecuzione.

## Esecuzione dell'applicazione di esempio

Per essere sicuri che l'abbiamo fatto bene, costruiamo questa applicazione! Eseguiremo questo come un'applicazione `--release` perché eseguiremo anche i nostri test WebDriver con un profilo di rilascio. Esegui `cargo run --release`, e dopo qualche compilazione, dovremmo vedere la seguente applicazione popup.

<div style={{textAlign: 'center'}}>
  <img src={HelloTauriWebdriver}/>
</div>

_Osservazioni: Se si modifica l'applicazione e si desidera utilizzare Devtools, poi eseguirlo senza `--release` e "Ispeziona Element" dovrebbe essere disponibile nel menu di scelta rapida._

Ora dovremmo essere pronti ad iniziare a testare questa applicazione con alcuni framework WebDdriver. Questa guida andrà oltre entrambi [WebdriverIO](webdriverio) e [Selenio](selenium) in quell'ordine.
