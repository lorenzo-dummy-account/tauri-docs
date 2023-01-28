---
sidebar_position: 3
---

import TauriBuild da './\_tauri-build.md'

# macOS Bundle

Le applicazioni Tauri per macOS sono distribuite con un [Pacchetto Applicazioni][] (`. file pp` ) o Apple Disk Image ( file`.dmg`). Il Tauri CLI raggruppa automaticamente il codice dell'applicazione in questi formati, fornendo opzioni per codesign e notarizzare l'applicazione. Si prega di notare che i pacchetti `.app` e `.dmg` possono **essere creati solo su macOS** poiché la cross-compilation non funziona ancora.

:::note

Le applicazioni GUI su macOS e Linux non ereditano i `$PATH` dai tuoi dotfiles di shell (`. ashrc`, `.bash_profile`, `.zshrc`, etc). Dai un'occhiata alla cassa [fix-path-env-rs][] di Tauri per risolvere questo problema.

:::

<TauriBuild />

## Impostazione di una versione minima di sistema

La versione minima del sistema operativo richiesta per l'esecuzione di un'app Tauri in macOS è `10.13`. Se hai bisogno di supporto per le nuove API macOS come `window.print` che sono supportate solo dalla versione macOS `11.` in poi, è possibile modificare il [`tauri.bundle.macOS.minimumSystemVersion`][]. Questo a sua volta imposterà la proprietà `Info.plist` [LSMinimumSystemVersion][] e la variabile `MACOSX_DEPLOYMENT_TARGET`.

## Obiettivi Binari

È possibile compilare l'applicazione targeting Apple Silicon, computer Mac basati su Intel, o binari macOS universali. Per impostazione predefinita, il CLI costruisce un binario mirato all'architettura della tua macchina. Se si desidera costruire per un obiettivo diverso, è necessario prima installare il target di ruggine mancante per quel obiettivo eseguendo `l'obiettivo di ruggine aggiungere aarch64-apple-darwin` o `obiettivo di ruggine aggiungere x86_64-apple-darwin`, allora puoi costruire la tua app usando il flag `--target`:

- `tauri build --target aarch64-apple-darwin`: si rivolge alle macchine in silicio Apple.
- `tauri build --target x86_64-apple-darwin`: si rivolge alle macchine basate su Intel.
- `tauri build --target universal-apple-darwin`: produce un [binario macOS universale][] che viene eseguito sia su silicio Apple che su Mac basati su Intels.

Mentre le macchine in silicio Apple possono eseguire applicazioni compilate per Mac basati su Intel, attraverso un livello di traduzione chiamato [Rosetta][], questo porta ad una riduzione delle prestazioni a causa delle traduzioni delle istruzioni del processore. È pratica comune consentire all'utente di scegliere il target corretto durante il download dell'app, ma puoi anche scegliere di distribuire un [Universal Binary][universal macos binary]. I binari universali includono sia gli eseguibili `aarch64` che `x86_64` , che ti danno la migliore esperienza su entrambe le architetture. Notare, tuttavia, che questo aumenta la dimensione del fascio in modo significativo.

## Personalizzazione Pacchetto Applicazione

Il file di configurazione Tauri fornisce le seguenti opzioni per personalizzare il pacchetto di applicazioni:

- **Nome del pacchetto:** Il nome leggibile della tua app. Configurato dalla proprietà [`package.productName`][].
- **Versione del pacchetto:** Versione della tua app. Configurato dalla proprietà [`package.version`][].
- **Categoria dell'applicazione:** La categoria che descrive la tua app. Configurato dalla proprietà [`tauri.bundle.category`][]. Puoi vedere un elenco di categorie macOS [qui][macos app categories].
- **Copyright:** Una stringa di copyright associata alla tua app. Configurato dalla proprietà [`tauri.bundle.copyright`][].
- **Bundle icon:** L'icona della tua app. Utilizza il primo file `.icns` elencato nell'array [`tauri.bundle.icon`][].
- **Versione minima di sistema:** Configurata dalla proprietà [`tauri.bundle.macOS.minimumSystemVersion`][].
- **File di licenza DMG:** Una licenza che viene aggiunta al file `.dmg`. Configurare dalla proprietà [`tauri.bundle.macOS.license`][].
- **[File Entitlements.plist][]:** I diritti controllano quali API avrà accesso alla tua app. Configurato dalla proprietà [`tauri.bundle.macOS.rights`][].
- **Dominio eccezionale:** un dominio insicuro che la tua applicazione può accedere come un `localhost` o un dominio `http` remoto. Si tratta di una configurazione di convenienza intorno `NSAppTransportSecurity > NSExceptionDomains` settando `NSExceptionAllowsInsecureHTTPLoads` e `NSIncludesSottodomini` a true. Vedere [`tauri.bundle.macOS.exceptionDominio`][] per ulteriori informazioni.

:::info

Queste opzioni generano il pacchetto di applicazioni [File Info.plist][]. È possibile estendere il file generato con il proprio file `Info.plist` memorizzato nella cartella Tauri (`src-tauri` per impostazione predefinita). Il CLI unisce entrambi i file `.plist` in produzione, e il livello principale lo incorpora nel binario durante lo sviluppo.

:::

[Pacchetto Applicazioni]: https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html
[`tauri.bundle.macOS.minimumSystemVersion`]: ../../api/config.md#macconfig.minimumsystemversion
[LSMinimumSystemVersion]: https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion
[binario macOS universale]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[universal macos binary]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[Rosetta]: https://support.apple.com/en-gb/HT211861
[macos app categories]: https://developer.apple.com/app-store/categories/
[`package.productName`]: ../../api/config.md#packageconfig.productname
[`package.version`]: ../../api/config.md#packageconfig.version
[`tauri.bundle.category`]: ../../api/config.md#bundleconfig.category
[`tauri.bundle.copyright`]: ../../api/config.md#bundleconfig.copyright
[`tauri.bundle.icon`]: ../../api/config.md#bundleconfig.icon
[`tauri.bundle.macOS.license`]: ../../api/config.md#bundleconfig.icon
[File Entitlements.plist]: https://developer.apple.com/documentation/bundleresources/entitlements
[`tauri.bundle.macOS.rights`]: ../../api/config.md#macconfig.entitlements
[`tauri.bundle.macOS.exceptionDominio`]: ../../api/config.md#macconfig.exceptiondomain
[File Info.plist]: https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html
[fix-path-env-rs]: https://github.com/tauri-apps/fix-path-env-rs
