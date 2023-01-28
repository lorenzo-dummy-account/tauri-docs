# Tauri Plugins

I plugin consentono di agganciare il ciclo di vita dell'applicazione Tauri e introdurre nuovi comandi.

## Usare un plugin

Per usare un plugin, basta passare l'istanza del plugin al metodo `plugin` dell'app:

```rust
fn main() {
  tauri::Builder::default()
    .plugin(my_awesome_plugin::init())
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

## Scrittura di un plugin

I plugin sono estensioni riutilizzabili dell'API Tauri che risolvono problemi comuni. Sono anche un modo molto conveniente per strutturare la tua base di codice!

Se hai intenzione di condividere il tuo plugin con altri, forniamo un modello pronto! Con il tauri-cli installato appena eseguito:

```shell
plugin tauri init --name fantastico
```

### Pacchetto API

Per impostazione predefinita, i consumatori del tuo plugin possono chiamare comandi forniti in questo modo:

```js
import { invoke } from '@tauri-apps/api'
invoke('plugin:awesome<unk> do_something')
```

dove `impressionante` sarà sostituito dal tuo nome del plugin.

Questo non è molto conveniente, tuttavia, quindi è comune per i plugin fornire un cosiddetto pacchetto API __, un pacchetto JavaScript che fornisce un comodo accesso ai tuoi comandi.

> Un esempio di questo è il [tauri-plugin-store](https://github.com/tauri-apps/tauri-plugin-store), che fornisce una comoda struttura di classe per accedere a un negozio. È possibile impalcare un plugin tauri con allegato pacchetto API javascript in questo modo:

```shell
tauri plugin init --name fantastico --api
```

## Scrittura di un plugin

Usando `tauri::plugin::Builder` puoi definire plugin simili a come definisci la tua app:

```rust
use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

// i gestori di comandi personalizzati del plugin se scegli di estendere l'API:

#[tauri::command]
// questo sarà accessibile con `invoke('plugin:awesome<unk> initialize')`.
// dove `awesome` è il nome del plugin.
fn initialize() {}

#[tauri::command]
// questo sarà accessibile con `invoke('plugin:awesome<unk> do_something')`.
fn do_something() {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    .invoke_handler(tauri::generate_handler![initialize, do_something])
    .build()
}
```

I plugin possono configurare e mantenere lo stato, proprio come la tua app può:

```rust
use tauri::{
  plugin::{Builder, TauriPlugin},
  AppHandle, Manager, Runtime, State,
};

#[derive(Default)]
struct MyState {}

#[tauri::command]
// questo sarà accessibile con `invoke('plugin:awesome<unk> do_something')`.
fn do_something<R: Runtime>(_app: AppHandle<R>, state: State<'_, MyState>) {
  // puoi accedere a `MyState` qui!
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    . nvoke_handler(tauri::generate_handler![do_something])
    . etup(<unk> app_handle<unk> {
      // setup plugin specific state qui
      app_handle. anage(MyState::default());
      Ok())
    })
    .build()
}
```

### Convenzioni

- La cassa esporta un metodo `init` per creare il plugin.
- I plugin dovrebbero avere un nome chiaro con il prefisso `tauri-plugin-`.
- Includi `tauri-plugin` keyword in `Cargo.toml`/`package.json`.
- Documenta il tuo plugin in inglese.
- Aggiungi un'app di esempio che mostra il tuo plugin.

### Avanzate

Invece di affidarsi alla struttura `tauri::plugin::TauriPlugin` restituita da `tauri::plugin::Builder::build`puoi implementare tu stesso `tauri::plugin::Plugin`. Questo consente di avere il pieno controllo sui dati associati.

Si noti che ogni funzione sul tratto `Plugin` è opzionale, tranne la funzione `nome`.

```rust
use tauri::{plugin::{Plugin, Result as PluginResult}, Runtime, PageLoadPayload, Window, Invoke, AppHandle};

struct MyAwesomePlugin<R: Runtime> {
  invoke_handler: Box<dyn Fn(Invoke<R>) + Invia + Sincronizza>,
  // stato plugin, campi di configurazione
}

// i gestori di comandi personalizzati del plugin se si sceglie di estendere l'API.
#[tauri::command]
// questo sarà accessibile con `invoke('plugin:awesome<unk> initialize')`.
// dove `awesome` è il nome del plugin.
fn initialize() {}

#[tauri::command]
// questo sarà accessibile con `invoke('plugin:awesome<unk> do_something')`.
fn do_something() {}

impl<R: Runtime> MyAwesomePlugin<R> {
  // puoi aggiungere campi di configurazione qui,
  // vedi https://doc. ust-lang.org/1.0.0/style/ownership/builders. tml
  pub fn new() -> Self {
    Self {
      invoke_handler: Box::new(tauri::generate_handler! inizializza, do_something]),
    }
  }
}

impl<R: Runtime> Plugin<R> per MyAwesomePlugin<R> {
  /// Il nome del plugin. Deve essere definito e usato nelle chiamate `invoke`.
  fn name(&self) -> &'static str {
    "awesome"
  }

  /// Lo script JS per valutare l'inizializzazione.
  /// Utile quando il plugin è accessibile tramite `window`
  /// o deve eseguire un'attività JS sull'inizializzazione dell'app
  /// e. . "finestra. wesomePlugin = { ... the plugin interface }"
  fn initialization_script(&self) -> Opzione<String> {
    None
  }

  /// inizializza il plugin con la configurazione fornita su `tauri. onf.json > plugin > $yourPluginName` o il valore predefinito.
  fn initialize(&mut self, app: &AppHandle<R>, config: serde_json::Value) -> PluginResult<()> {
    Ok(())
  }

  /// Callback invocato quando la finestra è creata.
  fn created(&mut self, window: Window<R>) {}

  /// Callback invocato quando la webview esegue la navigazione.
  fn on_page_load(&mut self, window: Window<R>, payload: PageLoadPayload) {}

  /// Estendi il gestore di richiami.
  fn extend_api(&mut self, message: Invoke<R>) {
    (self.invoke_handler)(message)
  }
}
```
