---
sidebar_position: 1
---

importa comando da '@theme/Command'

# Pubblicazione App

### 1. Costruisci La Tua App Web

Ora che sei pronto a confezionare il tuo progetto, devi eseguire il comando di build del tuo framework o bundler (supponendo che ne stai usando uno, ovviamente).

:::note

Ogni quadro ha i suoi strumenti editoriali. Non rientra nel campo di applicazione del presente documento trattarli tutti o tenerli aggiornati.

:::

### 2. Raggruppa la tua applicazione con Tauri

<Command name="build" />

Questo comando incorpora i tuoi asset web in un singolo binario con il tuo codice Rust. Il binario stesso si troverà in `src-tauri/target/release/[nome app]`e gli installatori si troveranno in `src-tauri/target/release/bundle/`.

Come il comando `tauri dev` , la prima volta che esegui questo, ci vuole un po 'di tempo per raccogliere le casse di ruggine e costruire tutto - ma sulle corse successive, ha solo bisogno di ricostruire il codice della tua applicazione, che è molto più veloce.
