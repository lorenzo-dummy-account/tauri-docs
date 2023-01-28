---
sidebar_position: 6
---

# Ridurre La Dimensione Dell'App

Con Tauri, stiamo lavorando per ridurre l'impronta ambientale delle applicazioni utilizzando meno risorse di sistema laddove disponibili, fornendo sistemi compilati che non necessitano di valutazione di runtime, e offrendo guide in modo che gli ingegneri possano andare ancora più piccoli senza sacrificare prestazioni o sicurezza. Risparmiando risorse stiamo facendo la nostra parte per aiutarci a salvare il pianeta - che è l'unica linea di fondo di cui le aziende nel XXI secolo dovrebbero occuparsi .

Quindi, se sei interessato a imparare come migliorare le dimensioni e le prestazioni dell'app, leggi su!

### Non puoi migliorare quello che non puoi misurare

Prima di poter ottimizzare la tua app, devi capire cosa occupa spazio nella tua app! Ecco un paio di strumenti che possono aiutarvi con questo:

- **`cargo-bloat`** - Un'utilità Rust per determinare cosa richiede più spazio nella tua app. Ti dà una panoramica eccellente e ordinata delle funzioni Rust più significative.

- **`cargo-expand`** - [Macro][] rende il tuo codice di ruggine più conciso e più facile da leggere, ma sono anche trappole di dimensioni nascoste! Usa [`cargo-expand`][cargo-expand] per vedere cosa queste macro generano sotto il cofano.

- **`rollup-plugin-visualizer`** - Uno strumento che genera grafici belli (e intuitivi) dal tuo pacchetto rollup. Molto conveniente per capire quali dipendenze JavaScript contribuiscono di più alla dimensione finale del pacchetto.

- **`rollup-plugin-graph`** - Hai notato una dipendenza inclusa nel tuo frontend finale, ma non sei sicuro perché? [`rollup-plugin-graph`][rollup-plugin-graph] genera visualizzazioni compatibili con Graphviz-dell'intero grafico delle dipendenze.

Questi sono solo un paio di strumenti che si potrebbe utilizzare. Assicurati di controllare l'elenco dei plugin dei pacchetti frontend per ulteriori informazioni!

## Checklist

1. [Minimizza Javascript](#minify-javascript)
2. [Ottimizza Dipendenze](#optimize-dependencies)
3. [Ottimizza Le Immagini](#optimize-images)
4. [Rimuovi Caratteri Personalizzati Non Necessari](#remove-unnecessary-custom-fonts)
5. [Permetti Configurazione](#allowlist-config)
6. [Ottimizzazioni Rust Build-time](#rust-build-time-optimizations)
7. [Stripping](#stripping)
8. [UPX](#upx)

### Minify JavaScript

JavaScript costituisce una grande porzione di una tipica app Tauri, quindi è importante rendere il JavaScript il più leggero possibile.

Puoi scegliere tra una pletora di pacchetti JavaScript; le scelte popolari sono [Vite][], [webpack][]e [rollup][]. Tutti possono produrre JavaScript minificato se configurato correttamente, quindi consulta la documentazione del tuo bundler per opzioni specifiche. In generale, dovresti assicurarti di:

#### Abilita agitazione ad albero

Questa opzione rimuove il JavaScript inutilizzato dal tuo pacchetto. Tutti i pacchetti popolari lo abilitano per impostazione predefinita.

#### Abilita minificazione

La minimizzazione rimuove gli spazi bianchi inutili, accorcia i nomi delle variabili e applica altre ottimizzazioni. La maggior parte dei pacchetti lo abilita per impostazione predefinita; una notevole eccezione è il rollup [][], dove hai bisogno di plugin come [rollup-plugin-terser][] o [rollup-plugin-uglify][].

Nota: Puoi usare i minificatori come [terser][] e [esbuild][] come strumenti indipendenti.

#### Disabilita mappe sorgenti

Le mappe sorgente forniscono una piacevole esperienza di sviluppo quando si lavora con i linguaggi che compilano in JavaScript, come ad esempio [TypeScript][]. Poiché le mappe di origine tendono ad essere abbastanza grandi, è necessario disattivarle durante la costruzione per la produzione. Non hanno alcun beneficio per il vostro utente finale, quindi è effettivamente peso morto.

### Ottimizza Dipendenze

Molte librerie popolari hanno alternative più piccole e più veloci tra cui si può scegliere.

La maggior parte delle librerie che usi dipendono da molte librerie stesse, in modo che una libreria che sembra poco visibile a prima vista potrebbe aggiungere **diversi megabyte** vale la pena di codice alla tua app.

È possibile utilizzare [Bundlephobia][] per trovare il costo delle dipendenze JavaScript. Ispezionare il costo delle dipendenze Rust è generalmente più difficile dal momento che il compilatore fa molte ottimizzazioni.

Se si trova una biblioteca che sembra eccessivamente grande, Google intorno, le probabilità sono qualcun altro aveva già lo stesso pensiero e creato un'alternativa. Un buon esempio è [Moment.js][] ed è [molte alternative][you-dont-need-momentjs].

Ma tenete a mente: **La migliore dipendenza è nessuna dipendenza**, il che significa che dovreste sempre preferire la lingua costruita su pacchetti di terze parti.

### Ottimizza Le Immagini

Secondo il [Http Archive][], le immagini sono il [più grande contributore al peso del sito][http archive report, image bytes]. Quindi, se la tua app include immagini o icone, assicurati di ottimizzarle!

È possibile scegliere tra diverse opzioni manuali ([GIMP][], [Photoshop][], [Squoosh][]) o plugin per i tuoi strumenti di generazione di frontend preferiti ([vite-imagetools][], [vite-plugin-imagemin][], [image-minimizer-webpack-plugin][]).

Notare che la libreria `imagemin` la maggior parte dei plugin utilizzati è [ufficialmente non mantenuta][imagemin is unmaintained].

#### Usa I Formati D'Immagine Moderni

Formati come `webp` o `avif` offrono riduzioni di dimensione di **fino a 95%** rispetto a jpeg mantenendo un'eccellente precisione visiva. Puoi usare strumenti come [Squoosh][] per provare diversi formati sulle tue immagini.

#### Dimensione Immagini Di Conseguenza

Nessuno apprezza la spedizione dell'immagine grezza 6K con la tua app, quindi assicurati di dimensionare l'immagine di conseguenza. Le immagini che appaiono grandi sullo schermo dovrebbero essere di dimensioni maggiori delle immagini che occupano meno spazio sullo schermo.

#### Non Utilizzare Immagini Reattive

In un ambiente Web, dovresti usare [Immagini Responsive][] per caricare dinamicamente la dimensione dell'immagine corretta per ogni utente. Dal momento che non stai distribuendo dinamicamente le immagini sul web, utilizzando le immagini reattive gonfiano inutilmente la tua app con copie ridondanti.

#### Rimuovi Metadati

Le immagini che sono state scattate direttamente da una fotocamera o da una foto stock lato spesso includono metadati circa la fotocamera e lente modello o fotografo. Non solo i byte sprecati, ma anche le proprietà dei metadati possono contenere informazioni potenzialmente sensibili come il tempo, giorno e posizione della foto.

### Rimuovi Caratteri Personalizzati Non Necessari

Considera di non spedire caratteri personalizzati con la tua app e di affidarti a font di sistema. Se devi spedire caratteri personalizzati, assicurati che siano in formati moderni e ottimizzati come `woff2`.

I caratteri possono essere piuttosto grandi, quindi utilizzando i caratteri già inclusi nel sistema operativo si riduce l'impronta della tua app. Inoltre evita FOUT (Flash di Unstyled Text) e fa sentire la tua app più "nativa" in quanto utilizza lo stesso carattere di tutte le altre applicazioni.

Se è necessario includere caratteri personalizzati, assicurati di includerli in formati moderni come `woff2` come quelli tendono ad essere molto più piccoli dei formati legacy.

Usa le cosiddette **"Stack di Font di Sistema"** nel tuo CSS. Ci sono un numero di variazioni, ma qui ci sono 3 di base per iniziare:

**Sans-Serif**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
  sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

**Serif**

```css
font-family: Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid
    Serif, Tempi, Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe
    UI Symbol;
```

**Monospace**

```css
font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation
    Mono, monospace;
```

### Permetti Configurazione

Puoi ridurre la dimensione della tua app solo abilitando le funzionalità API Tauri di cui hai bisogno nella configurazione `allowlist`.

La configurazione `allowlist` determina quali funzioni API abilitare; le funzioni disabilitate **non saranno compilate nella tua app**. Questo è un modo facile di perdere un po 'di peso in più.

Un esempio da un tipico `tauri.conf.json`:

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "writeFile": true
      },
      "shell": {
        "execute": true
      },
      "dialog": {
        "save": true
      }
    }
  }
}
```

### Ottimizzazioni Rust Build-Time

Configura il tuo progetto cargo per sfruttare le funzionalità di ottimizzazione delle dimensioni di Rusts. [Perché è un eseguibile di ruggine di grandi dimensioni?][] fornisce un'eccellente spiegazione del motivo per cui questo è importante e una passeggiata approfondita. Allo stesso tempo, [Minimizing Rust Binary Size][] è più aggiornato e ha un paio di raccomandazioni extra.

Rust è noto per la produzione di grandi binari, ma è possibile istruire il compilatore per ottimizzare le dimensioni dell'eseguibile finale.

Cargo espone diverse opzioni che determinano come il compilatore genera il tuo binario. Le opzioni "consigliate" per le app Tauri sono queste:

```toml
[profile.release]
panic = "abort" # Strip costoso panic clean-up logic
codegen-units = 1 # Compila le casse uno dopo l'altro in modo che il compilatore possa ottimizzare meglio
lto = true # Abilita il link alle ottimizzazioni
opt-level = "s" # Ottimizza per la dimensione binaria
```

:::note
C'è anche `opt-level = "z"` disponibile per ridurre la dimensione binaria risultante. `"s"` e `"z"` possono a volte essere più piccoli dell'altro, quindi provalo con la tua applicazione!

Abbiamo visto dimensioni binarie più piccole da `"s"` per applicazioni di esempio Tauri, ma le applicazioni del mondo reale possono sempre differire.
:::

Per una spiegazione dettagliata di ogni opzione e un mucchio di più, fare riferimento alla sezione [Profili di libri di carico][cargo profiles].

#### Disabilita La Compressione Degli Asset Di Tauri

Per impostazione predefinita, Tauri utilizza Brotli per comprimere gli asset nel binario finale. Brotli incorpora una tabella di ricerca grande (~170KiB) per ottenere ottimi risultati, ma se le risorse che hai incorporato sono più piccole di questo o comprimono male, il binario risultante può essere più grande di qualsiasi risparmio.

La compressione può essere disabilitata impostando `funzioni predefinite` a `false` e specificando tutto tranne la funzione `compressione`:

```toml
[dependencies]
tauri = { version = "...", features = ["objc-exception", "wry"], default-features = false }
```

#### Funzioni Di Compressione Ruggine Instabile

:::cautela
I seguenti suggerimenti sono tutte caratteristiche instabili e richiedono una catena di strumenti notturna. Vedere la documentazione [Caratteristiche instabili][cargo unstable features] per maggiori informazioni su ciò che questo comporta.
:::

I seguenti metodi comportano l'utilizzo di caratteristiche del compilatore instabile e richiedono la ruggine notturna toolchain. Se non hai aggiunto il componente notturno + `rust-src` per la notte, prova quanto segue:

```shell
rustup toolchain install nightly
rustup component add rust-src --toolchain nightly
```

La Rust Standard Library viene precompilata. Ciò significa che Rust è più veloce da installare, ma anche che il compilatore non può ottimizzare la Libreria Standard. È possibile applicare le opzioni di ottimizzazione per il resto del binario + dipendenze al std con un flag instabile. Questo contrassegno richiede di specificare il tuo bersaglio, quindi conosci il triplo di destinazione che stai mirando.

```shell
cargo +nightly build --release -Z build-std --target x86_64-unknown-linux-gnu
```

Se stai usando `panic = "abort"` nelle ottimizzazioni del profilo di rilascio, è necessario assicurarsi che la cassa `panic_abort` sia compilata con std. Inoltre, una funzione di std extra può ridurre ulteriormente la dimensione binaria. Le seguenti disposizioni si applicano a entrambi:

```shell
cargo +nightly build --release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort --target x86_64-unknown-linux-gnu
```

Vedere la documentazione unstable per maggiori dettagli su [`-Z build-std`][cargo build-std] e [`-Z build-std-features`][cargo build-std-features].

### Stripping

Usa le utility strip per rimuovere i simboli di debug dalla tua app compilata.

La tua app compilata include i cosiddetti "Simboli di debug" che includono la funzione e i nomi delle variabili. I tuoi utenti finali probabilmente non si occuperanno dei Simboli di debug, quindi questo è un modo abbastanza sicuro per salvare alcuni bytes!

Il modo più semplice è usare la famosa utility `strip` per rimuovere queste informazioni di debug.

```shell
strip target/release/my_application
```

Vedi la tua pagina di manpage `strip` locale per maggiori informazioni e flag che possono essere utilizzati per specificare quali informazioni vengono spogliate dal binario.

:::info

Rust 1.59 ora ha una versione integrata di `strip`! Può essere abilitato aggiungendo quanto segue al tuo `Cargo.toml`:

```toml
[profile.release]
strip = true # Striscia automaticamente i simboli dal binario.
```

:::

### UPX

UPX, **Ultimate Packer per eXecutables**, è un dinosauro tra i pacchetti binari. Questo kit di 23 anni, ben curato è GPL-v2 con licenza con una dichiarazione d'uso piuttosto liberale. La nostra comprensione della licenza è che è possibile utilizzarla per qualsiasi scopo (commerciale o altro) senza dover modificare la licenza a meno che non si modifichi il codice sorgente di UPX.

Forse il pubblico di destinazione ha internet molto lento, o la tua app deve adattarsi a un piccolo bastone USB, e tutti i passaggi di cui sopra non hanno portato al risparmio di cui hai bisogno. Non temere, come abbiamo un ultimo trucco le maniche:

[UPX][] comprime il tuo binario e crea un eseguibile autoestraente che si decomprime al runtime.

:::cautela
Dovresti sapere che questa tecnica potrebbe contrassegnare il tuo binario come un virus su Windows e macOS - quindi usa a tua discrezione, e come sempre, convalidare con [Frida][] e fare test di distribuzione reale!
:::

#### Utilizzo su macOS

<!-- Add additional platforms -->

```
brew install upx
yarn tauri build
upx --ultra-brute src-tauri/target/release/bundle/macos/app. pp/Contents/macOS/app

                        Ultimate Packer for eXecutables
                            Copyright (C) 1996 - 2018
UPX 3. 5 Markus Oberhumer, Laszlo Molnar & John Reiser 26 agosto 2018

        Formato Formato formato file
    -------------------- ------ ----------- -----------
    963140 ->    274448 28. 0% macho/amd64 app
```

[Macro]: https://doc.rust-lang.org/book/ch19-06-macros.html
[cargo-expand]: https://github.com/dtolnay/cargo-expand
[rollup-plugin-graph]: https://github.com/ondras/rollup-plugin-graph
[Vite]: https://vitejs.dev
[webpack]: https://webpack.js.org
[rollup]: https://rollupjs.org/guide/en/
[7]: https://rollupjs.org/guide/en/
[8]: https://rollupjs.org/guide/en/
[rollup-plugin-terser]: https://github.com/TrySound/rollup-plugin-terser
[rollup-plugin-uglify]: https://github.com/TrySound/rollup-plugin-uglify
[terser]: https://terser.org
[esbuild]: https://esbuild.github.io
[TypeScript]: https://www.typescriptlang.org
[Moment.js]: https://momentjs.com
[you-dont-need-momentjs]: https://github.com/you-dont-need/You-Dont-Need-Momentjs
[Http Archive]: https://httparchive.org
[http archive report, image bytes]: https://httparchive.org/reports/page-weight#bytesImg
[imagemin is unmaintained]: https://github.com/imagemin/imagemin/issues/385
[GIMP]: https://www.gimp.org
[Photoshop]: https://www.adobe.com/de/products/photoshop.html
[vite-imagetools]: https://github.com/JonasKruckenberg/imagetools
[vite-plugin-imagemin]: https://github.com/vbenjs/vite-plugin-imagemin
[image-minimizer-webpack-plugin]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin
[Squoosh]: https://squoosh.app
[Immagini Responsive]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
[Perché è un eseguibile di ruggine di grandi dimensioni?]: https://lifthrasiir.github.io/rustlog/why-is-a-rust-executable-large.html
[Minimizing Rust Binary Size]: https://github.com/johnthagen/min-sized-rust
[cargo unstable features]: https://doc.rust-lang.org/cargo/reference/unstable.html#unstable-features
[cargo profiles]: https://doc.rust-lang.org/cargo/reference/profiles.html
[cargo build-std]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std
[cargo build-std-features]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std-features
[Bundlephobia]: https://bundlephobia.com
[Frida]: https://frida.re/docs/home/
[UPX]: https://github.com/upx/upx
