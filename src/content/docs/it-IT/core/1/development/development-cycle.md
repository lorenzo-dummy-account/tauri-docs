---
sidebar_position: 2
---

importa comando da '@theme/Command'

# Ciclo Di Sviluppo

### 1. Avvia il tuo server Dev

Ora che avete tutto impostato, si dovrebbe avviare il server di sviluppo delle applicazioni fornito dal tuo framework o bundler UI (supponendo che ne stai utilizzando uno, naturalmente).

:::note

Ogni quadro ha i suoi strumenti di sviluppo. Non rientra nel campo di applicazione del presente documento coprirli tutti o rimanere aggiornati.
:::

### 2. Avvia Finestra Di Sviluppo Tauri

<Command name="dev" />

La prima volta che si esegue questo comando, il gestore di pacchetti Rust richiede diversi minuti per scaricare e costruire tutti i pacchetti richiesti. Dal momento che sono memorizzati nella cache, le build successive sono molto più veloci, poiché solo il tuo codice deve essere ricostruito.

Una volta che Rust ha finito di costruire, si apre la vista web, mostrando la tua app web. È possibile apportare modifiche alla tua app web, e se il vostro strumento lo consente, la vista web dovrebbe aggiornarsi automaticamente, proprio come un browser. Quando si apportano modifiche ai file Rust, vengono ricostruiti automaticamente, e la tua app si riavvia automaticamente.

:::info Su Cargo.toml e Controllo Sorgente

Nel tuo repository del progetto, SHOULD commit "src-tauri/Cargo.lock" insieme al "src-tauri/Cargo.toml" per git perché Cargo utilizza il file di blocco per fornire build deterministiche. Di conseguenza, si raccomanda di controllare tutte le applicazioni nel loro Cargo.lock. NON DEVE commettere la cartella "src-tauri/target" o uno qualsiasi dei suoi contenuti.

:::
