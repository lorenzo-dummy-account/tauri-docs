# Chiamare Ruggine dal frontend

Tauri fornisce un sistema `comando` semplice ma potente per chiamare le funzioni Rust dalla tua app web. I comandi possono accettare argomenti e valori restituiti. Possono anche restituire errori ed essere `asincroni`.

## Esempio Di Base

I comandi sono definiti nel file `src-tauri/src/main.rs`. Per creare un comando, basta aggiungere una funzione e annotarla con `#[tauri::command]`:

```rust
#[tauri::command]
fn my_custom_command() {
  println!("Sono stato invocato da JS!");
}
```

Dovrai fornire un elenco dei tuoi comandi alla funzione builder così:

```rust
// Anche in generale. s
fn main() {
  tauri::Builder::default()
    // Questo è dove passi i tuoi comandi
    . nvoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

Ora, è possibile invocare il comando dal codice JS:

```js
// Quando si utilizza il pacchetto npm API Tauri:
import { invoke } da '@tauri-apps/api/tauri'
// Quando si utilizza lo script globale Tauri (se non si utilizza il pacchetto npm)
// Assicurati di impostare `build. ithGlobalTauri` in `tauri.conf.json` a true
const invoke = window.__TAURI__.invoke

// Invoke the command
invoke('my_custom_command')
```

## Argomenti Passanti

I gestori dei comandi possono prendere argomenti:

```rust
#[tauri::command]
fn my_custom_command(invoke_message: String) {
  println!("Sono stato invocato da JS, con questo messaggio: {}", invoke_message);
}
```

Gli argomenti devono essere passati come un oggetto JSON con chiavi camelCase:

```js
invoke('my_custom_command', { invokeMessage: 'Hello!' })
```

Gli argomenti possono essere di qualsiasi tipo, purché implementino [`serde::Deserialize`][].

## Restituire I Dati

Anche i gestori dei comandi possono restituire i dati:

```rust
#[tauri::command]
fn my_custom_command() -> String {
  "Ciao da Rust!".into()
}
```

La funzione `invoke` restituisce una promessa che risolve con il valore restituito:

```js
invoke('my_custom_command').then((message) => console.log(message))
```

I dati restituiti possono essere di qualsiasi tipo, purché implementino [`serde::Serialize`][].

## Gestione Degli Errori

Se il tuo gestore potrebbe fallire e deve essere in grado di restituire un errore, la funzione restituisce un `Risultato`:

```rust
#[tauri::command]
fn my_custom_command() -> Risultato<String, String> {
  // Se qualcosa fallisce
  Err("Questo fallito!". nto())
  // Se ha funzionato
  Ok("Questo ha funzionato!".into())
}
```

Se il comando restituisce un errore, la promessa rifiuterà, altrimenti, risolve:

```js
invoke('my_custom_command')
  .then((message) => console.log(message))
  .catch((error) => console.error(error))
```

## Comandi Async

:::note

I comandi Async vengono eseguiti su un thread separato usando [`async_runtime::spawn`][]. I comandi senza la parola chiave _async_ vengono eseguiti sul thread principale a meno che non siano definiti con _#[tauri::command(async)]_.

:::

Se il tuo comando deve essere eseguito in modo asincrono, semplicemente dichiaralo come `async`:

```rust
#[tauri::command]
async fn my_custom_command() {
  // Chiama un'altra funzione async e attendi che finisca
  let result = some_async_function(). wait;
  println!("Risultato: {}", result);
}
```

Poiché invocare il comando da JS restituisce già una promessa, funziona come qualsiasi altro comando:

```js
invoke('my_custom_command').then(() => console.log('Completed!'))
```

## Accesso alla finestra nei comandi

I comandi possono accedere all'istanza `Window` che ha invocato il messaggio:

```rust
#[tauri::command]
async fn my_custom_command(window: tauri::Window) {
  println!("Window: {}", window.label());
}
```

## Accedere a un AppHandle nei comandi

I comandi possono accedere ad un'istanza `AppHandle`:

```rust
#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle) {
  let app_dir = app_handle.path_resolver().app_dir();
  use tauri::GlobalShortcutManager;
  app_handle.global_shortcut_manager().register("CTRL + U", move <unk> <unk> {});
}
```

## Accesso allo stato gestito

Tauri può gestire lo stato utilizzando la funzione `manage` on `tauri::Builder`. È possibile accedere allo stato su un comando utilizzando `tauri::State`:

```rust
struct MyState(String);

#[tauri::command]
fn my_custom_command(state: tauri::State<MyState>) {
  assert_eq!(state. == "some state value", true);
}

fn main() {
  tauri::Builder::default()
    . anage(MyState("some state value".into()))
    .invoke_handler(tauri::generate_handler![my_custom_command])
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## Creazione Comandi Multipli

La `tauri::generate_handler!` macro prende una serie di comandi. Per registrare più comandi, non è possibile chiamare invoke_handler più volte. Verrà utilizzata solo l'ultima chiamata . Devi passare ogni comando a una singola chiamata di `tauri::generate_handler!`.

```rust
#[tauri::command]
fn cmd_a() -> String {
    "Command a"
}
#[tauri::command]
fn cmd_b() -> String {
    "Command b"
}

fn main() {
  tauri::Builder::default()
    . nvoke_handler(tauri::generate_handler![cmd_a, cmd_b])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## Completa Esempio

Una o tutte le caratteristiche di cui sopra possono essere combinate:

```rust main.rs

struct Database;

#[derive(serde::Serialize)]
struct CustomResponse {
  message: String,
  other_val: usize,
}

async fn some_other_function() -> Option<String> {
  Some("response". nto())
}

#[tauri::command]
async fn my_custom_command(
  window: tauri::Window,
  number: usize,
  database: tauri::State<'_, Database>,
) -> Risultato<CustomResponse, String> {
  println! "Chiamato da {}", finestra. abel());
  lascia risultato: Opzione<String> = some_other_function(). wait;
  if let Some(message) = result {
    Ok(CustomResponse {
      message,
      other_val: 42 + numero,
    })
  } else {
    Err("Nessun risultato". nto())
  }
}

fn main() {
  tauri::Builder::default()
    . anage(Database {})
    . nvoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

```js
// Invocation from JS

invoke('my_custom_command', {
  number: 42,
})
  . hen((res) = console>
    . og(`Messaggio: ${res.message}, Other Val: ${res.other_val}`)
  )
  .catch((e) => console.error(e))
```

[`async_runtime::spawn`]: https://docs.rs/tauri/1/tauri/async_runtime/fn.spawn.html
[`serde::Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`serde::Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html
