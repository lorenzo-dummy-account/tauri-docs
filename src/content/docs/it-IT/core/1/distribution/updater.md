---
sidebar_position: 5
---

# Aggiornatore

## Configurazione

Una volta che il progetto Tauri è pronto, è necessario configurare l'aggiornatore.

Aggiungi questo in tauri.conf.json

```json
"updater": {
    "active": true,
    "endpoints": [
        "https://releases.myapp.com/{{target}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "YOUR_UPDATER_SIGNATURE_БKEY_HERE"
}
```

Le chiavi richieste sono "attive", "endpoints" e "pubkey"; altre sono opzionali.

"active" deve essere un booleano. Per impostazione predefinita, è impostato su false.

"endpoints" deve essere un array. La stringa `{{target}}` e `{{current_version}}` vengono automaticamente sostituite nell'URL che consente di determinare [lato server](#update-server-json-format) se un aggiornamento è disponibile. Se vengono specificati più endpoint, l'aggiornatore si ripiegherà se un server non risponde entro il timeout predefinito.

"dialog" se presente deve essere un booleano. Per impostazione predefinita, è impostato su true. Se abilitato, [eventi](#events) sono disattivati come l'aggiornatore gestisce tutto. Se hai bisogno degli eventi personalizzati, DEVE spegnere la finestra di dialogo integrata.

"pubkey" deve essere una chiave pubblica valida generata con Tauri CLI. Vedi [Aggiornamenti firma](#signing-updates).

### Aggiorna Richieste

Tauri è indifferente alla richiesta che l'applicazione client prevede per il controllo degli aggiornamenti.

`Accetta: applicazione/json` viene aggiunto alle intestazioni della richiesta perché Tauri è responsabile dell'analisi della risposta.

Per i requisiti imposti alle risposte e al formato del corpo di un aggiornamento, risposta vedere [Supporto server](#server-support).

La tua richiesta di aggiornamento deve _almeno_ includere un identificatore di versione in modo che il server possa determinare se è richiesto un aggiornamento per questa specifica versione.

Può anche includere altri criteri di identificazione, come la versione del sistema operativo, per consentire al server di consegnare come fine-grained un aggiornamento come si desidera.

Come si include l'identificatore di versione, o altri criteri è specifico per il server da cui si richiedono gli aggiornamenti. Un approccio comune è quello di utilizzare i parametri di query, [Configurazione](#configuration) mostra un esempio.

### Dialogo integrato

Per impostazione predefinita, l'aggiornatore utilizza un'API di dialogo integrata da Tauri.

![Nuovo Aggiornamento](https://i.imgur.com/UMilB5A.png)

Le note di rilascio della finestra di dialogo sono rappresentate dall'aggiornamento `nota` fornito dal [server](#server-support). Se l'utente accetta, l'aggiornamento viene scaricato e installato. In seguito, viene richiesto all'utente di riavviare l'applicazione.

### API Javascript

:::cautela
È necessario _disabilitare la finestra di dialogo integrata_ nella configurazione [tauri](#configuration); Altrimenti, l'API javascript NON funzionerà.
:::

```js
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
try {
  const { shouldUpdate, manifest } = await checkUpdate()
  if (shouldUpdate) {
    // display dialog
    await installUpdate()
    // install complete, riavvia l'app
    attendi il relaunch()
  }
} catch (error) {
  console. og(errore)
}
```

### Eventi

:::cautela

È necessario _disabilitare la finestra di dialogo integrata_ nella configurazione [tauri](#configuration); Altrimenti, gli eventi non vengono emessi.

:::

Per sapere quando un aggiornamento è pronto per essere installato, è possibile iscriversi a questi eventi:

#### Inizializza l'aggiornatore e controlla se è disponibile una nuova versione

##### Se è disponibile una nuova versione, viene emesso l'evento `tauri://update-available`.

Event: `tauri://update`

#### Ruggine

```rust
window.emit("tauri://update".to_string(), None);
```

#### Javascript

```js
importa { emit } da '@tauri-apps/api/event'
emit('tauri://update')
```

#### Ascolta l'evento Nuovo aggiornamento disponibile

Evento: `tauri://update-available`

Dati emessi:

```
versione Versione annunciata dal server
date Data annunciata dal server
corpo Nota annunciata dal server
```

#### Ruggine

```rust
window.listen("tauri://update-available".to_string(), move <unk> msg<unk> {
  println!("New version available: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-available', function (res) {
  console.log('New version available: ', res)
})
```

#### Emit Install and Download events

È necessario emettere questo evento per inizializzare il download e ascoltare il [progresso di installazione](#listen-install-progress).

Event: `tauri://update-install`

#### Ruggine

```rust
window.emit("tauri://update-install".to_string(), None);
```

#### Javascript

```js
importa { emit } da '@tauri-apps/api/event'
emit('tauri://update-install)
```

#### Ascolta il progresso di installazione

Event: `tauri://update-status`

Dati emessi:

```
stato [ERROR/PENDING/DONE]
error String/null
```

PENDING viene emesso quando il download viene avviato e FATTO quando l'installazione è completata. È quindi possibile chiedere di riavviare l'applicazione.

ERROR viene emesso quando c'è un errore con l'aggiornatore. Si consiglia di ascoltare questo evento anche se la finestra di dialogo è abilitata.

#### Ruggine

```rust
window.listen("tauri://update-status".to_string(), move <unk> msg<unk> {
  println!("New status: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-status', function (res) {
  console.log('New status: ', res)
})
```

## Supporto Server

Il tuo server dovrebbe determinare se è necessario un aggiornamento in base alla [Richiesta di aggiornamento](#update-requests) i problemi del tuo client.

Se è richiesto un aggiornamento, il tuo server dovrebbe rispondere con un codice di stato di [200 OK][] e includere il [aggiornamento JSON](#update-server-json-format) nel corpo.

Se non è richiesto alcun aggiornamento, il server deve rispondere con un codice di stato di [204 No Content][].

### Aggiorna Formato Server JSON

Quando è disponibile un aggiornamento, Tauri si aspetta il seguente schema in risposta alla richiesta di aggiornamento fornita:

```json
{
  "url": "https://mycompany.example.com/myapp/releases/myrelease.tar.gz",
  "version": "0.0.1",
  "notes": "Theses are some release notes",
  "pub_date": "2020-09-18T12:29:53+01:00",
  "signature": ""
}
```

Le chiavi richieste sono "url", "versione" e "firma"; le altre sono opzionali.

"pub_date" se presente deve essere formattato secondo [RFC 3339][date and time on the internet: timestamps].

"signature" è il contenuto del file `.sig` che è stato generato dal CLI di Tauri. Vedere [Firma gli aggiornamenti](#signing-updates) per le istruzioni su come configurare le chiavi richieste.

### Aggiorna Formato File JSON

La tecnica di aggiornamento alternativo utilizza un file JSON semplice, memorizzando i metadati di aggiornamento su S3, gist o un altro archivio di file statici. Tauri controlla contro il campo versione, e se la versione del processo in esecuzione è inferiore a quella riportata di JSON e la piattaforma è disponibile, innesca un aggiornamento. Il formato di questo file è dettagliato di seguito:

```json
{
  "version": "v1.0. ",
  "note": "Versione di prova",
  "pub_date": "2020-06-22T19:25:57Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.app.tar. z"
    },
    "darwin-aarch64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1. .0/silicon/app.app.tar. z"
    },
    "linux-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.AppImage.tar. z"
    },
    "windows-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.x64.msi.zip"
    }
  }
}
```

Nota che ogni chiave della piattaforma è nel formato `OS-ARCH` , dove `OS` è uno dei `linux`, `darwin` o `windows`, and `ARCH` is one of `x86_64`, `aarch64`, `i686` o `armv7`.

## Bundler (Artefatti)

Il bundler Tauri genera automaticamente gli artefatti di aggiornamento se l'aggiornatore è abilitato in `tauri.conf. son` I tuoi artefatti di aggiornamento vengono automaticamente firmati se il bundler può individuare le tue chiavi private e pubbliche.

La firma è il contenuto del file generato `.sig`. La firma può essere caricata su GitHub in modo sicuro o resa pubblica se la chiave privata è sicura.

Puoi vedere come è [in bundle con CI][artifacts updater workflow] e un [esempio tauri.conf.json][].

### macOS

Su macOS, creiamo un .tar.gz da tutta l'applicazione. (.app)

```
target/release/bundle
l’onorevole Mark macos
    l’onorevole app.app.app
    l’articolo app.app.tar.gz (aggiornamento bundle)
    l’onorevole app.app.tar.gz.sig
```

### Finestre

Su Windows, creiamo un .zip dal MSI; quando scaricato e convalidato, eseguiamo l'installazione di MSI.

```
target/release/bundle
l’onorevole Msi
    l’articolo 64.msi
    l’articolo 64.msi (update bundle)
    l’articolo 64.msi.zip (update bundle) 
 l’articolo 64.msi.zip.sig
```

### Linux

Su Linux, creiamo un .tar.gz dall'AppImage.

```
target/release/bundle
l’onorevole l’onorevole appimage
    l’onorevole app.app.AppImage
    l’articolo app.AppImage.tar.gz (update bundle)
    l’articolo app.AppImage.tar.gz.sig
```

## Aggiornamenti firma

Offriamo una firma integrata per garantire che l'aggiornamento sia sicuro per essere installato.

Per firmare i tuoi aggiornamenti, hai bisogno di due cose.

La chiave pubblica __ (pubkey) dovrebbe essere aggiunta all'interno del tuo `tauri.conf.json` per convalidare l'archivio di aggiornamento prima dell'installazione.

La _chiave privata_ (privkey) viene utilizzata per firmare il tuo aggiornamento e non dovrebbe MAI essere condivisa con nessuno. Inoltre, se hai perso questa chiave, NON sarai in grado di pubblicare un nuovo aggiornamento alla base utente corrente. È fondamentale salvarlo in un luogo sicuro, e si può sempre accedervi.

Per generare le chiavi, è necessario utilizzare il Tauri CLI:

```shell
tauri signer generate -w ~/.tauri/myapp.key
```

Hai diverse opzioni disponibili

```
Genera coppia di tasti per firmare i file

USAGE:
    tauri signer generate [OPTIONS]

OPZIONI:
    -f, --force Sovrascrivi la chiave privata anche se esiste sul percorso specificato
    -h, --help Stampa informazioni di aiuto
    -p, --password <PASSWORD>        Imposta la password della chiave privata durante la firma
    -V, --version Stampa informazioni di versione
    -w, --write-keys <WRITE_KEYS>    Scrivi la chiave privata su un file
```

---

Variabili di ambiente usate per firmare con il bundler Tauri ``:<br/> Se impostate, il bundler genera e firma automaticamente gli artefatti dell'aggiornatore.<br/> `TAURI_PRIVATE_KEY` Percorso o Stringa della tua chiave privata<br/> `TAURI_KEY_PASSWORD` Password della tua chiave privata (opzionale)

[200 OK]: http://tools.ietf.org/html/rfc2616#section-10.2.1
[204 No Content]: http://tools.ietf.org/html/rfc2616#section-10.2.5
[date and time on the internet: timestamps]: https://datatracker.ietf.org/doc/html/rfc3339#section-5.8
[artifacts updater workflow]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/.github/workflows/artifacts-updater.yml#L44
[esempio tauri.conf.json]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/examples/updater/src-tauri/tauri.conf.json#L52
