# Llamar a Rust desde el frontend

Tauri proporciona un sistema de comando `simple pero potente` para llamar a funciones de Rust desde tu aplicación web. Los comandos pueden aceptar argumentos y devolver valores. También pueden devolver errores y ser `asíncronos`.

## Ejemplo básico

Los comandos están definidos en el archivo `src-tauri/src/main.rs`. Para crear un comando, simplemente añade una función y anotarla con `#[tauri::command]`:

```rust
#[tauri::command]
fn my_custom_command() {
  println!("¡Fui invocado desde JS!");
}
```

Tendrás que proporcionar una lista de tus comandos a la función del constructor así:

```rust
// También en main. s
fn main() {
  tauri::Builder::default()
    // Aquí es donde pasas tus comandos
    . nvoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("fallo al ejecutar la aplicación");
}
```

Ahora, puedes invocar el comando desde tu código JS:

```js
// Cuando se utiliza el paquete npm de la API Tauri:
importar { invoke } de '@tauri-apps/api/tauri'
// Cuando se utiliza el script global Tauri (si no se utiliza el paquete npm)
// Asegúrese de establecer `build. ithGlobalTauri` en `tauri.conf.json` a true
const invoke = window.__TAURI__.invoke

// Invoca el comando
invoke('my_custom_command')
```

## Pasando argumentos

Sus controladores de comandos pueden tomar argumentos:

```rust
#[tauri::command]
fn my_custom_command(invoke_message: String) {
  println!("Fui invocado desde JS, con este mensaje: {}", invoke_message);
}
```

Los argumentos deben pasarse como un objeto JSON con claves camelCase:

```js
invoke('my_custom_command', { invokeMessage: 'Hola!' })
```

Los argumentos pueden ser de cualquier tipo, siempre que implementen [`serde::Deserialize`][].

## Devolviendo datos

Los manejadores de comandos también pueden devolver datos:

```rust
#[tauri::command]
fn my_custom_command() -> String {
  "Hola de Rust!".into()
}
```

La función `invocar` devuelve una promesa que se resuelve con el valor devuelto:

```js
invoke('my_custom_command').then((mensaje) => console.log(message))
```

Los datos devueltos pueden ser de cualquier tipo, siempre y cuando implemente [`serde::Serialize`][].

## Manejo de errores

Si su manejador puede fallar y necesita ser capaz de devolver un error, haga que la función devuelva un `Resultado`:

```rust
#[tauri::command]
fn my_custom_command() -> Result<String, String> {
  // Si algo falla
  Err("¡Esto falló!". nto())
  // Si funcionó
  Ok("Esto funcionó!".into())
}
```

Si la orden devuelve un error, la promesa rechazará, de lo contrario, resuelve:

```js
invoke('my_custom_command')
  .then((mensaje) => console.log(message))
  .catch((error) => console.error(error))
```

## Comandos Async

:::note

Los comandos de sincronización se ejecutan en un hilo separado usando [`async_runtime::spawn`][]. Los comandos sin la palabra clave _async_ son ejecutados en el hilo principal a menos que sean definidos con _#[tauri::command(async)]_.

:::

Si tu comando necesita ejecutarse de forma asíncrona, simplemente declararlo como `async`:

```rust
#[tauri::command]
async fn my_custom_command() {
  // Llama a otra función asíncrona y espera a que termine
  let result = some_async_function(). wait;
  println!("Resultado: {}", resultado);
}
```

Dado que invocar el comando de JS ya devuelve una promise, funciona como cualquier otro comando:

```js
invoke('my_custom_command').then(() => console.log('¡Completado!'))
```

## Acceder a la ventana en comandos

Los comandos pueden acceder a la instancia de `Ventana` que invocó el mensaje:

```rust
#[tauri::command]
async fn my_custom_command(window: tauri::Window) {
  println!("Window: {}", window.label());
}
```

## Acceder a un AppHandle en Comandos

Los comandos pueden acceder a una instancia de `AppHandle`:

```rust
#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle) {
  let app_dir = app_handle.path_resolver().app_dir();
  use tauri::GlobalShortcutManager;
  app_handle.global_shortcut_manager().register("CTRL + U", move || {});
}
```

## Acceder al estado administrado

Tauri puede administrar estado usando la función `Administrar` en `tauri::Builder`. Se puede acceder al estado en un comando usando `tauri::State`:

```rust
struct MyState(String);

#[tauri::command]
fn my_custom_command(state: tauri::State<MyState>) {
  assert_eq!(state. == "algún valor de estado", true);
}

fn main() {
  tauri::Builder::default()
    . anage(MyState("some state value".into()))
    .invoke_handler(tauri::generate_handler![my_custom_command])
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

## Creando múltiples comandos

El macro `tauri::generate_handler!` toma un array de comandos. Para registrar comandos múltiples, no puede llamar a invoke_handler varias veces. Solo se usará la última llamada. ¡Debes pasar cada comando a una sola llamada de `tauri::generate_handler!`.

```rust
#[tauri::command]
fn cmd_a() -> String {
    "Comando a"
}
#[tauri::command]
fn cmd_b() -> Cadena {
    "Comando b"
}

fn main() {
  tauri::Builder::default()
    . nvoke_handler(tauri::generate_handler![cmd_a, cmd_b])
    .run(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

## Ejemplo completo

Todas o todas las características anteriores pueden ser combinadas:

```rust main.rs

struir base de datos;

#[derive(serde::Serialize)]
struct CustomResponse {
  message: String,
  other_val: usize,
}

async fn some_other_function() -> Opción<String> {
  Some("response". nto())
}

#[tauri::command]
asíncrona fn my_custom_command(
  window: tauri::Window,
  number: usizar,
  database: tauri::State<'_, Database>,
) -> Result<CustomResponse, String> {
  println! "Llamado desde {}", ventana. abel());
  let result: Opción<String> = some_other_function(). espera;
  if let Some(message) = result {
    Ok(CustomResponse {
      message,
      other_val: 42 + número,
    })
  } else {
    Err("No resultado". nto())
  }
}

fn main() {
  tauri::Builder::default()
    . anage(Database {})
    . nvoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

```js
// Invocación de JS

invoke('my_custom_command', {
  number: 42,
})
  . hen((res) =>
    consola. og(`Mensaje: ${res.message}, Otro Val: ${res.other_val}`)
  )
  .catch((e) => console.error(e))
```

[`async_runtime::spawn`]: https://docs.rs/tauri/1/tauri/async_runtime/fn.spawn.html
[`serde::Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`serde::Deserialize`]: https://docs.serde.rs/serde/trait.Deserialize.html
