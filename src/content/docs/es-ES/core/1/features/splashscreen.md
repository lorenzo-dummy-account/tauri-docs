# Pantalla platija

Si su página web puede tardar algún tiempo en cargar, o si necesita ejecutar un procedimiento de inicialización en Rust antes de mostrar su ventana principal, una pantalla de presentación podría mejorar la experiencia de carga para el usuario.

### Configurar

Primero, cree un `splashscreen.html` en su `distDir` que contenga el código HTML para una pantalla de presentación. Luego, actualice su `tauri.conf.json` así:

```diff
"windows": [
  {
    "title": "Tauri App",
    "ancho": 800,
    "altura": 600,
    "resizable": true,
    "fullscreen": falso,
+ "visible": false // Ocultar la ventana principal por defecto
  },
  // Agregar la ventana de splashscreen
+ {
+ "width": 400,
+ "altura": 200,
+ "decoraciones": falso,
+ "url": "splashscreen. tml",
+ "etiqueta": "splashscreen"
+ }
]
```

Ahora, la ventana principal se ocultará y la ventana se mostrará cuando se inicie la aplicación. A continuación, necesitarás una forma de cerrar la pantalla de presentación y mostrar la ventana principal cuando tu aplicación esté lista. La forma en que lo haga depende de lo que esté esperando antes de cerrar la pantalla de presentación.

### Esperando a la página web

Si estás esperando tu código web, querrás crear un comando `close_splashscreen` [](command).

```rust src-tauri/main.rs
use tauri::Manager;
// Crea el comando:
// Este comando debe ser asíncrono para que no se ejecute en el hilo principal.
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Cerrar splashscreen
  if let Some(splashscreen) = window. et_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Muestra la ventana principal
  window.get_window("main").unwrap(). cómo(). nwrap();
}

// Registrar el comando:
fn main() {
  tauri::Builder::default()
    // Añadir esta línea
    . nvoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!())
    .expect("fallo al ejecutar la aplicación");
}

```

Entonces, puedes llamarlo desde tu JS:

```js
// Con el paquete npm de la API Tauri:
importar { invoke } de '@tauri-apps/api/tauri'
// Con el script global Tauri:
const invoke = window.__TAURI__.invoke

documento. ddEventListener('DOMContentLoaded', () => {
  // Esto esperará a que la ventana se carge, pero podrías
  // ejecutar esta función en cualquier disparador que desee
  invoke('close_splashscreen')
})
```

### Esperando a la Rust

Si estás esperando a que se ejecute el código de Rust, ponlo en el manejador de función `setup` para que tengas acceso a la instancia `App`:

```rust src-tauri/main.rs
use tauri::Manager;
fn main() {
  tauri::Builder::default()
    . etup(|app| {
      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main"). nwrap();
      // realizamos el código de inicialización en una nueva tarea para que la aplicación no congela
      tauri::async_runtime::spawn(async move {
        // inicializa tu aplicación aquí en lugar de dormir :)
        println! "Inicializando. .");
        std::thread::sleep(std::time::Duration::from_secs(2));
        println! "Terminó la inicialización. );

        // Después de haber terminado, cierre la pantalla de presentación y muestre la ventana principal
        splashscreen_window. lose().unwrap();
        main_window.show(). nwrap();
      });
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("fallo al ejecutar la aplicación");
}
```
