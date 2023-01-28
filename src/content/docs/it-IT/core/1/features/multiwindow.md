# Multiwindow

Gestisci più finestre su una singola applicazione.

## Creare una finestra

Una finestra può essere creata staticamente dal file di configurazione Tauri o in esecuzione.

### Finestra statica

È possibile creare più finestre con l'array di configurazione [tauri.windows][]. La seguente snippet JSON mostra come creare staticamente diverse finestre attraverso la configurazione:

```json tauri.conf.json
{
  "tauri": {
    "windows": [
      {
        "label": "external",
        "title": "Tauri Docs",
        "url": "https://tauri. pp"
      },
      {
        "label": "local",
        "title": "Tauri",
        "url": "indice. tml"
      }
    ]
  }
}
```

Si noti che l'etichetta della finestra deve essere unica e può essere utilizzata in runtime per accedere all'istanza della finestra. L'elenco completo delle opzioni di configurazione disponibili per le finestre statiche si trova nella documentazione [WindowConfig][].

### Finestra di esecuzione

È inoltre possibile creare finestre in esecuzione tramite il livello Ruggine o tramite l'API Tauri.

#### Crea una finestra in Ruggine

Una finestra può essere creata in esecuzione utilizzando la struttura [WindowBuilder][].

Per creare una finestra, devi avere un'istanza dell'app [][] o di una [AppHandle][] in esecuzione.

##### Crea una finestra usando l'istanza [App][]

L'istanza [App][] può essere ottenuta nell'hook di configurazione o dopo una chiamata a [Builder::build][].

```rust Using the setup hook
tauri::Builder::default()
  . etup(<unk> app<unk> {
    let docs_window = tauri::WindowBuilder::new(
      app,
      "esterno", /* l'etichetta unica della finestra */
      tauri::WindowUrl::External("https://tauri. pp/".parse(). nwrap())
    ). uild()?
    lascia local_window = tauri::WindowBuilder::new(
      app,
      "local",
      tauri::WindowUrl::App("index. tml".into())
    ).build()?;
    Ok(())
})
```

Usando l'hook di setup si assicura che le finestre statiche e i plugin Tauri siano inizializzati. In alternativa, puoi creare una finestra dopo aver creato l'app [][]:

```rust Using the built app
let app = tauri::Builder::default()
  .build(tauri::generate_context!())
  . xpect("errore durante la costruzione dell'applicazione tauri");

let docs_window = tauri::WindowBuilder::new(
  &app,
  "external", /* l'etichetta unica della finestra */
  tauri::WindowUrl::External("https://tauri. pp/".parse().unwrap())
).build(). xpect("non è riuscito a costruire la finestra");

lascia local_window = tauri::WindowBuilder::new(
  &app,
  "local",
  tauri::WindowUrl::App("index. tml".into())
).build()?;
```

Questo metodo è utile quando non è possibile spostare la proprietà dei valori alla chiusura dell'installazione.

##### Crea una finestra usando un'istanza [AppHandle][]

Un'istanza [AppHandle][] può essere ottenuta utilizzando la funzione [`App::handle`] o direttamente iniettata nei comandi Tauri.

```rust Create a window in a separate thread
tauri::Builder::default()
  .setup(<unk> app<unk> {
    let handle = app. andle();
    std::thread::spawn(move <unk> <unk> {
      let local_window = tauri::WindowBuilder::new(
        &handle,
        "locale",
        tauri::WindowUrl::App("index. tml".into())
      ).build()?;
    });
    Ok(())
})
```

```rust Create a window in a Tauri command
#[tauri::command]
async fn open_docs(handle: tauri::AppHandle) {
  let docs_window = tauri::WindowBuilder::new(
    &handle,
    "external", /* l'etichetta unica della finestra */
    tauri::WindowUrl::External("https://tauri. pp/".parse().unwrap())
  ).build().unwrap();
}
```

:::info

Quando si creano finestre in un comando Tauri, assicurati che la funzione di comando sia `async` per evitare un blocco su Windows a causa del problema [wry#583][].

:::

#### Crea una finestra in JavaScript

Utilizzando l'API Tauri è possibile creare facilmente una finestra in esecuzione importando la classe [WebviewWindow][].

```js Create a window using the WebviewWindow class
import { WebviewWindow } from '@tauri-apps/api/window'
const webview = new WebviewWindow('theUniqueLabel', {
  url: 'path/to/page. tml',
})
// dal momento che la finestra di visualizzazione web viene creata in modo asincrono,
// Tauri emette il `tauri://created` e `tauri://error` per notificarti la risposta alla creazione
webview. nce('tauri://created', function () {
  // webview window created successfully
})
webview. nce('tauri://error', function (e) {
  // si è verificato un errore durante la creazione della finestra webview
})
```

## Accesso a una finestra in esecuzione

L'istanza della finestra può essere interrogata usando la sua etichetta e il metodo [get_window][] su Rust o [WebviewWindow.getByLabel][] su JavaScript.

```rust Using get_window
use tauri::Manager;
tauri::Builder::default()
  .setup(<unk> app<unk> {
    let main_window = app.get_window("main").unwrap();
    Ok(())
})
```

Nota che devi importare [tauri::Manager][] per utilizzare il metodo [get_window][] su [App][] o [AppHandle][] istanze.

```js Using WebviewWindow.getByLabel
import { WebviewWindow } from '@tauri-apps/api/window'
const mainWindow = WebviewWindow.getByLabel('main')
```

## Comunicare con altre finestre

La comunicazione delle finestre può essere fatta usando il sistema degli eventi. Vedi la [Guida per gli eventi][] per maggiori informazioni.

[tauri.windows]: ../../api/config.md#tauriconfig.windows
[WindowConfig]: ../../api/config.md#windowconfig
[WindowBuilder]: https://docs.rs/tauri/1.0.0/tauri/window/struct.WindowBuilder.html
[4]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[5]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[App]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[9]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[10]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[AppHandle]: https://docs.rs/tauri/1.0.0/tauri/struct.AppHandle.html
[Builder::build]: https://docs.rs/tauri/1.0.0/tauri/struct.Builder.html#method.build
[get_window]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html#method.get_window
[wry#583]: https://github.com/tauri-apps/wry/issues/583
[WebviewWindow]: ../../api/js/window.md#webviewwindow
[WebviewWindow.getByLabel]: ../../api/js/window.md#getbylabel
[tauri::Manager]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html
[Guida per gli eventi]: ./events.md
