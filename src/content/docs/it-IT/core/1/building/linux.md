---
sidebar_position: 4
---

import TauriBuild da './\_tauri-build.md'

# Pacchetto Linux

## Limitazioni

Le librerie di base come glibc spesso rompono la compatibilità con i sistemi più vecchi. Per questo motivo, è necessario costruire l'applicazione Tauri utilizzando il sistema base più antico che si intende supportare. Un sistema relativamente vecchio come Ubuntu 18.04 è più adatto di Ubuntu 22.04, come il binario compilato su Ubuntu 22. 4 avrà un requisito più elevato della versione di glibc, così quando viene eseguito su un sistema più vecchio, affronterai un errore di runtime come `/usr/lib/libc. o.6: versione 'GLIBC_2.33' non trovata`. Si consiglia di utilizzare un contenitore Docker o Azioni GitHub per costruire l'applicazione Tauri per Linux.

Per maggiori informazioni, consulta i problemi [tauri-apps/tauri#1355][] e [rust-lang/rust#57497][]in aggiunta alla [Guida AppImage][].

## Debian

Tauri permette alla tua app di essere confezionata come un file `.deb` (pacchetto Debian). Il Tauri CLI raggruppa le tue applicazioni binarie e risorse aggiuntive in questo formato se crei su Linux. Si prega di notare che i pacchetti `.deb` possono **essere creati solo su Linux** poiché la cross-compilation non funziona ancora.

Il pacchetto Debian stock generato dal bundler Tauri ha tutto il necessario per spedire la tua applicazione alle distribuzioni Linux basate su Debian, definire le icone della propria applicazione, generare un file Desktop e specificare le dipendenze `libwebkit2gtk-4. -37` e `libgtk-3-0`, insieme a `libappindicator3-1` se la tua app utilizza il vassoio di sistema.

:::note
Le applicazioni GUI su macOS e Linux non ereditano i `$PATH` dai tuoi dotfiles di shell (`. ashrc`, `.bash_profile`, `.zshrc`, etc). Dai un'occhiata alla cassa [fix-path-env-rs](https://github.com/tauri-apps/fix-path-env-rs) di Tauri per risolvere questo problema.
:::

<TauriBuild />

### File Personalizzati

Tauri espone alcune configurazioni per il pacchetto Debian nel caso in cui sia necessario un maggiore controllo.

Se la tua app dipende da ulteriori dipendenze di sistema, puoi specificarle in `tauri.conf.json > tauri > bundle > deb > dipende`.

Per includere file personalizzati nel pacchetto Debian, è possibile fornire un elenco di file o cartelle in `tauri. onf.json > tauri > bundle > deb > files`. L'oggetto di configurazione mappa il percorso nel pacchetto Debian al percorso del file system relativo al tauri `. file onf.json`. Ecco una configurazione di esempio:

```json
{
  "tauri": {
    "bundle": {
      "deb": {
        "files": {
          "/usr/share/README. d": "../README.md", // copia il file README.md in /usr/share/README. d
          "usr/share/assets": ".. assets/" // copia l'intera directory delle attività in /usr/share/assets
        }
      }
    }
  }
}
```

Se hai bisogno di raggruppare i file in modo multipiattaforma, controlla i meccanismi [risorsa][] e [sidecar][] di Tauri.

## AppImage

AppImage è un formato di distribuzione che non si basa sui pacchetti installati dal sistema e raggruppa invece tutte le dipendenze e i file necessari per l'applicazione. Per questo motivo, il file di output è più grande ma più facile da distribuire poiché è supportato su molte distribuzioni Linux e può essere eseguito senza installazione. L'utente ha solo bisogno di rendere il file eseguibile (`chmod a+x MyProject. ppImage`) e può quindi eseguirlo (`./MyProject.AppImage`).

AppImages sono convenienti, semplificando il processo di distribuzione se non è possibile creare un pacchetto mirato al gestore dei pacchetti della distribuzione. Ancora, si dovrebbe utilizzare con attenzione in quanto la dimensione del file cresce da 2-6MBs gamma a 70+MBs.

:::cautela

Se la tua app riproduce audio/video devi abilitare `tauri.conf.json > tauri > bundle > appimage > bundleMediaFramework`. Questo aumenterà la dimensione del pacchetto AppImage per includere i file `gstreamer` necessari per la riproduzione multimediale. Questo flag è attualmente supportato solo sui sistemi di generazione Ubuntu.

:::

[risorsa]: resources.md
[sidecar]: sidecar.md
[tauri-apps/tauri#1355]: https://github.com/tauri-apps/tauri/issues/1355
[rust-lang/rust#57497]: https://github.com/rust-lang/rust/issues/57497
[Guida AppImage]: https://docs.appimage.org/reference/best-practices.html#binaries-compiled-on-old-enough-base-system
