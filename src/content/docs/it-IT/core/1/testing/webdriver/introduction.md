---
sidebar_position: 1
title: Introduzione
---

:::cautelaAttualmente in pre-alpha
Il supporto al driver web per Tauri è ancora in pre-alfa. Lo strumento che vi è dedicato, come il [tauri-driver][], è ancora in sviluppo attivo e può cambiare se necessario nel tempo. Inoltre, solo Windows e Linux sono attualmente supportati.
:::

[WebDriver][] è un'interfaccia standardizzata per interagire con documenti web destinati principalmente a test automatizzati. Tauri supporta l'interfaccia [WebDriver][] sfruttando il server [WebDriver][] della piattaforma nativa sotto un wrapper cross-platform [`tauri-driver`][].

## Dipendenze Di Sistema

Installa l'ultimo [`tauri-driver`][] o aggiorna un'installazione esistente eseguendo:

```shell
cargo install tauri-driver
```

Poiché attualmente utilizziamo il server nativo [WebDriver][] della piattaforma, ci sono alcuni requisiti per l'esecuzione di [`tauri-driver`][] su piattaforme supportate. Il supporto della piattaforma è attualmente limitato a Linux e Windows.

### Linux

Utilizziamo `WebKitWebDriver` su piattaforme Linux. Verifica se questo binario esiste già (comando `quale WebKitWebDriver`) come alcune distribuzioni lo raggruppano con il normale pacchetto WebKit. Altre piattaforme possono avere un pacchetto separato per loro, ad esempio come `webkit2gtk-driver` su distribuzioni basate su Debian.

### Finestre

Assicurati di prendere la versione di [Microsoft Edge Driver][] che corrisponde alla versione di Windows Edge che l'applicazione è in fase di costruzione e testata. Questa dovrebbe essere quasi sempre l'ultima versione stabile sulle installazioni di Windows aggiornate. Se le due versioni non corrispondono, potresti provare la tua suite di test WebDriver appesa durante il tentativo di connetterti.

Il download contiene un binario chiamato `msedgedriver.exe`. [`tauri-driver`][] looks for that binary in the `$PATH` so make sure it's either available on the path or use the `--native-driver` option on [`tauri-driver`][]. Si consiglia di scaricare questo automaticamente come parte del processo di configurazione CI per garantire il bordo, e le versioni del driver Edge rimangono sincronizzate sulle macchine Windows CI. Una guida su come farlo potrebbe essere aggiunta in un secondo momento.

## Esempio Di Applicazione

La sezione [successiva](example/setup) della guida mostra passo dopo passo come creare un'applicazione di esempio minimale che è testata con WebDriver.

Se si preferisce vedere il risultato della guida e guardare oltre un codebase minimo finito che lo utilizza, puoi guardare su https://github. om/chippers/hello_tauri. Questo esempio viene fornito anche con uno script CI per testare con le azioni GitHub , ma potresti essere ancora interessato alla guida [WebDriver CI](ci) in quanto spiega il concetto un po 'di più.

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[tauri-driver]: https://crates.io/crates/tauri-driver
[Microsoft Edge Driver]: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
