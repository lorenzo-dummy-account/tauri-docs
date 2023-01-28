# Calling Rust from the frontend pero en español

Tauri proporciona un sistema de `command` simple pero poderoso para llamar a las funciones de Rust desde su aplicación web. Los comandos pueden aceptar argumentos y devolver valores. También pueden devolver errores y ser `async` .

## Ejemplo básico

Los comandos se definen en su archivo `src-tauri/src/main.rs` . Para crear un comando, simplemente agregue una función y anótela con `#[tauri::command]` :

```rust
#[tauri::command]
fn my_custom_command() {
  println!("I was invoked from JS!");
}
```

Tendrá que proporcionar una lista de sus comandos a la función de construcción de la siguiente manera:

```rust
// Also in main.rs
fn main() {
  tauri::Builder::default()
    // This is where you pass in your commands
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

Ahora, puede invocar el comando desde su código JS:

```js
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'
// When using the Tauri global script (if not using the npm package)
// Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
const invoke = window.__TAURI__.invoke

// Invoke the command
invoke('my_custom_command')
```

## pasar argumentos

Sus controladores de comandos pueden tomar argumentos:

```rust
#[tauri::command]
fn my_custom_command(invoke_message: String) {
  println!("I was invoked from JS, with this message: {}", invoke_message);
}
```

Los argumentos deben pasarse como un objeto JSON con claves camelCase:

```js
invoke('my_custom_command', { invokeMessage: 'Hello!' })
```

Los argumentos pueden ser de cualquier tipo, siempre que implementen [`serde::Deserialize`] .

## Devolviendo datos

Los controladores de comandos también pueden devolver datos:

```rust
#[tauri::command]
fn my_custom_command() -> String {
  "Hello from Rust!".into()
}
```

La función de `invoke` devuelve una promesa que se resuelve con el valor devuelto:

```js
invoke('my_custom_command').then((message) => console.log(message))
```

Los datos devueltos pueden ser de cualquier tipo, siempre que implemente [`serde::Serialize`] .

## Manejo de errores

Si su controlador puede fallar y necesita poder devolver un error, haga que la función devuelva un `Result` :

```rust
#[tauri::command]
fn my_custom_command() -> Result<String, String> {
  // If something fails
  Err("This failed!".into())
  // If it worked
  Ok("This worked!".into())
}
```

Si el comando devuelve un error, la promesa se rechazará, de lo contrario, se resuelve:

```js
invoke('my_custom_command')
  .then((message) => console.log(message))
  .catch((error) => console.error(error))
```

## Comandos asíncronos

:::Nota

Los comandos asíncronos se ejecutan en un hilo separado usando [`async_runtime::spawn`] . Los comandos sin la palabra clave *async* se ejecutan en el subproceso principal a menos que se definan con *#[tauri::command(async)]* .

:::

Si su comando necesita ejecutarse de forma asíncrona, simplemente declárelo como `async` :

```rust
#[tauri::command]
async fn my_custom_command() {
  // Call another async function and wait for it to finish
  let result = some_async_function().await;
  println!("Result: {}", result);
}
```

Dado que invocar el comando de JS ya devuelve una promesa, funciona como cualquier otro comando:

```js
invoke('my_custom_command').then(() => console.log('Completed!'))
```

## Accediendo a la Ventana en Comandos

Los comandos pueden acceder a la instancia de `Window` que invocó el mensaje:

```rust
#[tauri::command]
async fn my_custom_command(window: tauri::Window) {
  println!("Window: {}", window.label());
}
```

## Acceso a un identificador de aplicación en los comandos

Los comandos pueden acceder a una instancia de `AppHandle` :

```rust
#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle) {
  let app_dir = app_handle.path_resolver().app_dir();
  use tauri::GlobalShortcutManager;
  app_handle.global_shortcut_manager().register("CTRL + U", move || {});
}
```

## Accediendo al estado administrado

Tauri puede administrar el estado usando la función de `manage` en `tauri::Builder` . Se puede acceder al estado en un comando usando `tauri::State` :

```rust
struct MyState(String);

#[tauri::command]
fn my_custom_command(state: tauri::State<MyState>) {
  assert_eq!(state.0 == "some state value", true);
}

fn main() {
  tauri::Builder::default()
    .manage(MyState("some state value".into()))
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## Creación de varios comandos

El `tauri::generate_handler!` macro toma una serie de comandos. Para registrar varios comandos, no puede llamar a invoque_handler varias veces. Solo se utilizará la última llamada. ¡Debes pasar cada comando a una sola llamada de `tauri::generate_handler!` .

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
    .invoke_handler(tauri::generate_handler![cmd_a, cmd_b])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## Ejemplo completo

Cualquiera o todas las características anteriores se pueden combinar:

```rust

struct Database;

#[derive(serde::Serialize)]
struct CustomResponse {
  message: String,
  other_val: usize,
}

async fn some_other_function() -> Option<String> {
  Some("response".into())
}

#[tauri::command]
async fn my_custom_command(
  window: tauri::Window,
  number: usize,
  database: tauri::State<'_, Database>,
) -> Result<CustomResponse, String> {
  println!("Called from {}", window.label());
  let result: Option<String> = some_other_function().await;
  if let Some(message) = result {
    Ok(CustomResponse {
      message,
      other_val: 42 + number,
    })
  } else {
    Err("No result".into())
  }
}

fn main() {
  tauri::Builder::default()
    .manage(Database {})
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

```js
// Invocation from JS

invoke('my_custom_command', {
  number: 42,
})
  .then((res) =>
    console.log(`Message: ${res.message}, Other Val: ${res.other_val}`)
  )
  .catch((e) => console.error(e))
```


[`async_runtime::spawn`]: https://docs.rs/tauri/1/tauri/async_runtime/fn.spawn.html
[`serde::Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`serde::Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html