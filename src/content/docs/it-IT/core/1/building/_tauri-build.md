importa comando da '@theme/Command'

# Intestazione temporanea per fissare il rendering

<!-- The above heading is here because fragments aren't really supported in the context of Astro Content Collections -->

Per costruire e raggruppare la tua applicazione Tauri in un singolo eseguibile esegui semplicemente il seguente comando:

<Command name="build" />

Genererà il tuo frontend (se configurato, vedi [`beforeBuildCommand`][beforebuildcommand]), compila il binario Rust, raccogliere tutti i binari e le risorse esterne e infine produrre pacchetti e installatori specifici per piattaforme pulite.

[beforebuildcommand]: ../../api/config.md#buildconfig.beforebuildcommand
