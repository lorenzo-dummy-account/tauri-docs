# Eventos

El sistema de eventos Tauri es un sistema multiproductor primitivo de comunicación multiconsumidor que permite pasar mensajes entre el frontend y el backend. Es análogo al sistema de comandos, pero una comprobación de tipo de carga debe ser escrita en el controlador de eventos y simplifica la comunicación desde el backend hasta el frontend, trabajando como un canal.

Una aplicación Tauri puede escuchar y emitir eventos globales y específicos para la ventana. Uso desde el frontend y el backend se describe a continuación.

## Frontend

El sistema de eventos es accesible en el frontend en los módulos `event` y `window` del paquete `@tauri-apps/api`.

### Eventos globales

Para utilizar el canal global de eventos, importe el módulo `event` y utilice las funciones `emit` y `listen`:

```js
importar { emit, listen } de '@tauri-apps/api/event'

// escuchar el evento `clic` y obtener una función para eliminar el listener del evento
// también hay una función `una vez` que se suscribe a un evento y automáticamente anula la la suscripción del oyente en el primer evento
const unlisten = await listen('click', (event) => {
  // evento. vent es el nombre del evento (útil si desea usar un fn de callback único para varios tipos de eventos)
  // evento. ayload es el objeto de carga útil
})

// emite el evento `click` con la carga útil del objeto
emit('click', {
  theMessage: '¡Tauri es increíble! ,
})
```

### Eventos específicos de la ventana

Los eventos específicos de la ventana están expuestos en el módulo `window`.

```js
importar { appWindow, WebviewWindow } desde '@tauri-apps/api/window'

// emitir un evento que solo son visibles para la ventana actual
appWindow.emit('event', { message: 'Tauri is awesome!' })

// crea una nueva ventana de webview y emite un evento sólo a esa ventana
const webview = new WebviewWindow('window')
webview.emit('event')
```

## Backend

En el backend, el canal global de eventos está expuesto en la estructura `App` , y los eventos específicos de la ventana pueden ser emitidos usando el rasgo `Window`.

### Eventos globales

```rust
usa tauri::Manager;

// el tipo de carga útil debe implementar `Serialize` y `Clone`.
#[derivado(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  tauri::Builder::default()
    . etup(|app| {
      // escuchar el `event-name` (emitido en cualquier ventana)
      let id = app. isten_global("event-name", |event| {
        println!("got event-name with payload {:?}", event. ayload());
      });
      // anula la escucha del evento usando el `id` devuelto en la función `listen_global`
      // una API `once_global` también está expuesta en la estructura `App`
      app. nlisten(id);

      // emite el evento `event-name` a todas las ventanas de la vista web en el frontend
      app. mit_all("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error al ejecutar la aplicación");
}
```

### Eventos específicos de la ventana

Para usar el canal de eventos específico de la ventana, se puede obtener un objeto `Window` en un manejador de comandos o con la función `get_window`:

```rust
use tauri::{Manager, Window};

// el tipo de carga útil debe implementar `Serialize` y `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

// init a background process on the command, y emite eventos periódicos sólo a la ventana que usó el comando
#[tauri::command]
fn init_process(window: Window) {
  std::thread::spawn(move || {
    loop {
      window. mit("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
    }
  });
}

fn main() {
  tauri::Builder::default()
    . etup(|app| {
      // `main` aquí está la etiqueta de ventana; se define en la creación de la ventana o bajo `tauri. onf.json`
      // el valor por defecto es `main`. ten en cuenta que debe ser único
      let main_window = app.get_window("main"). nwrap();

      // escucha el `event-name` (emitido en la ventana `main`)
      let id = main_window. isten("event-name", |event| {
        println!("got window event-name with payload {:?}", event. ayload());
      });
      // anule la escucha del evento usando el `id` devuelto en la función `listen`
      // una API `once` también está expuesta en la estructura `Window` struct
      main_window. nlisten(id);

      // emite el evento `event-name` a la ventana `main`
      main_window. mit("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
      Ok(())
    })
    . nvoke_handler(tauri::generate_handler![init_process])
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```
