---
title: Domande Frequenti
sidebar_position: 10
description: Correzioni per problemi comuni
---

## Come posso usare i cambiamenti Tauri inediti?

Per utilizzare Tauri da GitHub (versione bordo sanguinante) è necessario modificare il file `Cargo.toml` e aggiornare il tuo CLI e API.

<details>
  <summary>Estrarre la cassa di Ruggine dalla fonte</summary>

Aggiungi questo al tuo file `Cargo.toml`:

```toml title=Cargo.toml
[patch.crates-io]
tauri = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
tauri-build = { git = "https://github.com/tauri-apps/tauri", branch = "dev" }
```

Questo obbligherà tutte le tue dipendenze ad utilizzare `tauri` e `tauri-build` da Git invece di crates.io.

</details>

<details>
  <summary>Usare il Tauri CLI dalla sorgente</summary>

Se si utilizza il Cargo CLI, è possibile installarlo direttamente da GitHub:

```shell
cargo install --git https://github.com/tauri-apps/tauri --branch dev tauri-cli
```

Se stai usando il pacchetto `@tauri-apps/cli` , dovrai clonare il repo e costruirlo:

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/cli/node
yarn
yarn build
```

Per usarlo, esegui direttamente con il nodo:

```shell
node /path/to/tauri/tooling/cli/node/tauri.js dev
node /path/to/tauri/tooling/cli/node/tauri.js build
```

In alternativa, puoi eseguire direttamente la tua app con Carica:

```shell
cd src-tauri
cargo run --no-default-features # invece di tauri dev
cargo build # invece di tauri build - non bundle la tua app anche se
```

</details>

<details>
  <summary>Usare l'API Tauri dalla sorgente</summary>

Si consiglia di utilizzare anche il pacchetto API Tauri da sorgente quando si utilizza la cassa Tauri da GitHub (anche se potrebbe non essere necessario). Per generarlo dal sorgente, eseguire il seguente script:

```shell
git clone https://github.com/tauri-apps/tauri
git checkout dev
cd tauri/tooling/api
yarn
yarn build
```

Ora è possibile collegarlo utilizzando filato:

```shell
cd dist
yarn link
cd /path/to/your/project
yarn link @tauri-apps/api
```

Oppure puoi cambiare il tuo package.json per puntare direttamente alla cartella dist:

```json title=package.json
{
  "dependencies": {
    "@tauri-apps/api": "/path/to/tauri/tooling/api/dist"
  }
}
```

</details>

## Dovrei usare il Nodo o il Cargo? {#node-or-cargo}

Anche se l'installazione del CLI attraverso Cargo è l'opzione preferita, deve compilare l'intero binario da zero quando lo installi. Se sei in un ambiente CI o su una macchina molto lenta stai meglio a scegliere un altro metodo di installazione.

Come il CLI è scritto in Rust, è naturalmente disponibile attraverso [crates.io][] e installabile con Cargo.

Compiliamo anche il CLI come addon nativo Node.js e lo distribuiamo [via npm][]. Ciò presenta diversi vantaggi rispetto al metodo di installazione del carico:

1. Il CLI è precompilato, portando a tempi di installazione molto più rapidi
2. È possibile inserire una versione specifica nel file package.json
3. Se si sviluppano strumenti personalizzati intorno a Tauri, è possibile importare il CLI come normale modulo JavaScript
4. È possibile installare la CLI utilizzando un gestore JavaScript

## Lista Browserlist Consigliata

Si consiglia di utilizzare `es2021`, `ultime 3 versioni di Chrome`e `safari13` per la tua lista browser e gli obiettivi di generazione. Tauri sfrutta il motore di rendering nativo del sistema operativo (WebKit su macOS, WebView2 su Windows e WebKitGTK su Linux).

## Costruisci Conflitto con l'Homebrew su Linux

Homebrew su Linux include il proprio `pkg-config` (un'utilità per trovare librerie sul sistema). Questo può causare conflitti durante l'installazione dello stesso pacchetto `pkg-config` per Tauri (di solito installato attraverso il gestore di pacchetti come `apt`). Quando si tenta di costruire un'app Tauri cercherà di invocare `pkg-config` e finirà per invocare quella dall'Homebrew. Se Homebrew non è stato utilizzato per installare le dipendenze di Tauri, questo può causare errori.

Gli errori _di solito_ contengono messaggi lungo le linee di errore `: non è stato possibile eseguire il comando di build personalizzato per X` - `Il pacchetto Y non è stato trovato nel percorso di ricerca pkg-config.`. Si noti che potresti vedere errori simili se le dipendenze richieste non sono installate affatto.

Ci sono due soluzioni a questo problema:

1. [Disinstalla Homebrew][]
2. Imposta la variabile di ambiente `PKG_CONFIG_PATH` per puntare alla corretta `pkg-config` prima di costruire un'app Tauri

[crates.io]: https://crates.io/crates/tauri-cli
[via npm]: https://www.npmjs.com/package/@tauri-apps/cli
[Disinstalla Homebrew]: https://docs.brew.sh/FAQ#how-do-i-uninstall-homebrew
