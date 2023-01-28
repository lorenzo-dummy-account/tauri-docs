# Eventi

Il sistema di eventi Tauri è una comunicazione multi-produttore multi-consumer primitiva che permette il passaggio di messaggi tra il frontend e il backend. È analogo al sistema di comando, ma un controllo di tipo payload deve essere scritto sul gestore di eventi e semplifica la comunicazione dal backend al frontend, lavorare come un canale.

Un'applicazione Tauri può ascoltare ed emettere eventi globali e specifici per le finestre. L'uso dal frontend e il backend è descritto di seguito.

## Frontend

Il sistema di eventi è accessibile sul frontend sui moduli `event` e `window` del pacchetto `@tauri-apps/api`.

### Eventi globali

Per utilizzare il canale globale degli eventi, importare il modulo `event` e utilizzare le funzioni `emit` e `listen`:

```js
import { emit, listen } from '@tauri-apps/api/event'

// listen to the `click` event and get a function to remove the event listener
// there is also a `once` function that subscribes to an event and automatically unsubscribes the listener on the first event
const unlisten = await listen('click', (event) => {
  // evento. vent è il nome dell'evento (utile se vuoi usare un singolo callback fn per più tipi di eventi)
  // evento. ayload è l'oggetto payload
})

// emette l'evento `click` con l'oggetto payload
emit('click', {
  theMessage: 'Tauri is awesome! ,
})
```

### Eventi specifici per Windows

Gli eventi specifici per le finestre sono esposti sul modulo `window`.

```js
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'

// emette un evento che sono visibili solo alla finestra corrente
appWindow.emit('event', { message: 'Tauri is awesome!' })

// crea una nuova finestra di vista web ed emette un evento solo a quella finestra
const webview = new WebviewWindow('window')
webview.emit('event')
```

## Backend

Sul backend, il canale globale degli eventi è esposto sulla struttura `App` , e gli eventi specifici per le finestre possono essere emessi usando il tratto `Finestra`.

### Eventi globali

```rust
use tauri::Manager;

// il tipo di payload deve implementare `Serialize` e `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  tauri::Builder::default()
    . etup(<unk> app<unk> {
      // ascolta il `event-name` (emesso su qualsiasi finestra)
      let id = app. isten_global("event-name", <unk> event<unk> {
        println!("got event-name with payload {:?}", evento. ayload());
      });
      // non ascolta l'evento usando il file `id` restituito nella funzione `listen_global`
      // un'API `once_global` è esposta anche sull'app `App`
      . nlisten(id);

      // emette l'evento `event-name` a tutte le finestre di visualizzazione web sul frontend
      app. mit_all("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```

### Eventi specifici per Windows

Per utilizzare il canale evento specifico per la finestra, è possibile ottenere un oggetto `Window` su un gestore di comando o con la funzione `get_window`:

```rust
use tauri::{Manager, Window};

// il tipo di payload deve implementare `Serialize` e `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

// init a background process on the command, ed emette eventi periodici solo alla finestra che ha usato il comando
#[tauri::command]
fn init_process(window: Window) {
  std::thread::spawn(move <unk> <unk> {
    loop {
      window. mit("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
    }
  });
}

fn main() {
  tauri::Builder::default()
    . etup(<unk> app<unk> {
      // `main` ecco l'etichetta della finestra; è definito nella creazione della finestra o sotto `tauri. onf.json`
      // il valore predefinito è `main`. nota che deve essere univoco
      let main_window = app.get_window("main"). nwrap();

      // ascolta il `event-name` (emesso nella finestra `main`)
      let id = main_window. isten("event-name", <unk> event<unk> {
        println!("got window event-name with payload {:?}", evento. ayload());
      });
      // non ascolta l'evento usando il file `id` restituito nella funzione `listen`
      // un'API `once` è esposta anche nella struttura `Window`
      main_window. nlisten(id);

      // emette l'evento `event-name` nella finestra `main`
      main_window. mit("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
      Ok(())
    })
    . nvoke_handler(tauri::generate_handler![init_process])
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```
