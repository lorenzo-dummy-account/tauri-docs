# Splashscreen

Se la pagina web potrebbe richiedere del tempo per caricare, o se è necessario eseguire una procedura di inizializzazione in Rust prima di visualizzare la finestra principale, uno splashscreen potrebbe migliorare l'esperienza di caricamento per l'utente.

### Configurazione

Innanzitutto, crea un `splashscreen.html` nel tuo `distDir` che contiene il codice HTML per uno splashscreen. Quindi, aggiorna il tuo `tauri.conf.json` così:

```diff
"windows": [
  {
    "title": "Tauri App",
    "width": 800,
    "height": 600,
    "ridimensionabile": true,
    "schermo intero": falso,
+ "visibile": false // Nascondi la finestra principale per impostazione predefinita
  },
  // Aggiungi la finestra splashscreen
+ {
+ "width": 400,
+ "height": 200,
+ "decorazioni": false,
+ "url": "splashscreen. tml",
+ "label": "splashscreen"
+ }
]
```

Ora, la tua finestra principale sarà nascosta e la finestra della schermata iniziale verrà visualizzata quando la tua app viene lanciata. Successivamente, avrai bisogno di un modo per chiudere la schermata iniziale e mostrare la finestra principale quando l'app è pronta. Come fai questo dipende da quello che stai aspettando prima di chiudere lo splashscreen.

### In attesa della pagina web

Se stai aspettando il tuo codice web, vorrai creare un comando `close_splashscreen` [](command).

```rust src-tauri/main.rs
use tauri::Manager;
// Create the command:
// This command must be async so that it doesn't run on the main thread.
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Chiudi splashscreen
  if let Some(splashscreen) = window. et_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Mostra la finestra principale
  window.get_window("main").unwrap(). come() nwrap();
}

// Registra il comando:
fn main() {
  tauri::Builder::default()
    // Aggiungi questa riga
    . nvoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}

```

Poi, puoi chiamarlo dal tuo JS:

```js
// Con il pacchetto npm di Tauri API:
import { invoke } da '@tauri-apps/api/tauri'
// Con lo script globale di Tauri:
const invoke = window.__TAURI__.invoke

documento. ddEventListener('DOMContentLoaded', () => {
  // Attendi il caricamento della finestra, ma puoi
  // eseguire questa funzione su qualsiasi trigger vuoi
  invoke('close_splashscreen')
})
```

### In attesa di Rust

Se stai aspettando l'esecuzione del codice Rust, mettilo nel `setup` function handler in modo da avere accesso all'istanza `App`:

```rust src-tauri/main.rs
use tauri::Manager;
fn main() {
  tauri::Builder::default()
    . etup(<unk> app<unk> {
      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main"). nwrap();
      // eseguiamo il codice di inizializzazione su una nuova attività in modo che l'app non congeli
      tauri::async_runtime::spawn(async move {
        // inizializza la tua app qui invece di dormire :)
        println! "Inizializzazione. .");
        std::thread::sleep(std::time::Duration::from_secs(2));
        stampato! "Inizializzazione effettuata. );

        // Dopo che è fatto, chiudere la schermata iniziale e visualizzare la finestra principale
        splashscreen_window. lose().unwrap();
        main_window.show(). nwrap();
      });
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```
