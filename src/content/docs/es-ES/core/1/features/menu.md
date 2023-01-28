# Menú de ventana

Los menús de aplicación nativa se pueden adjuntar a una ventana.

### Creando un menú

Para crear un menú de ventana nativa, importe los tipos de `Menú`, `Submenú`, `MenuItem` y `menú personalizado`. El elemento de menú `` contiene una colección de elementos específicos de la plataforma (actualmente no implementados en Windows). The `CustomMenuItem` allows you to create your own menu items and add special functionality to them.

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
```

Crear una instancia de `Menú`:

```rust
// aquí `"quit".to_string()` define el id del elemento de menú, y el segundo parámetro es la etiqueta del elemento de menú.
let quit = CustomMenuItem::new("quit".to_string(), "Salir");
let close = CustomMenuItem::new("close".to_string(), "Cerrar");
let submenu = Submenu::new("Archivo", Menu::new().add_item(quit). dd_item(close));
let menu = Menu::new()
  .add_native_item(MenuItem::Copia)
  .add_item(CustomMenuItem::new("ocultar", "Ocultar"))
  .add_submenu(submenu);
```

### Añadir el menú a todas las ventanas

El menú definido puede establecerse en todas las ventanas utilizando el `menu` API en la estructura `tauri::Builder`:

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
  let menu = Menu::new(); // configure el menú
  tauri::Builder::default()
    . esu(menu)
    .run(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

### Agregando el menú a una ventana específica

Puede crear una ventana y configurar el menú a utilizar. Esto permite definir un conjunto de menú específico para cada ventana de la aplicación.

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri::WindowBuilder;

fn main() {
  let menu = Menu::new(); // configure el menú
  tauri::Builder::default()
    . etup(|app| {
      WindowBuilder::new(
        app,
        "main-window". o_string(),
        tauri::WindowUrl::App("index.html". nto()),
      )
      .menu(menu)
      . uild()?;
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

### Escuchando eventos en elementos de menú personalizados

Cada `elemento personalizado` activa un evento cuando se hace clic. Utilice la `on_menu_event` API para manejarlos, ya sea en el global `tauri::Builder` o en una ventana específica.

#### Escuchar los eventos en los menús globales

```rust
use tauri::{CustomMenuItem, Menu, MenuItem};

fn main() {
  let menu = Menu::new(); // configure el menú
  tauri::Builder::default()
    . enu(menu)
    .on_menu_event(|event| {
      evento de partida. enu_item_id() {
        "quit" => {
          std::process::exit(0);
        }
        "close" => {
          evento. ().close(). nwrap();
        }
        _ => {}
      }
    })
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

#### Escuchar eventos en los menús de ventanas

```rust
use tauri::{CustomMenuItem, Menu, MenuItem};
use tauri::{Manager, WindowBuilder};

fn main() {
  let menu = Menu::new(); // configure el menú
  tauri::Builder::default()
    . etup(|app| {
      let window = WindowBuilder::new(
        app,
        "main-window". o_string(),
        tauri::WindowUrl::App("index. tml".into()),
      )
      . esu(menu)
      .build()?;
      let window_ = window. lone();
      window. n_menu_event(mover |event| {
        evento de partida. enu_item_id() {
          "quit" => {
            std::process::exit(0);
          }
          "close" => {
            window_. perdida(). nwrap();
          }
          _ => {}
        }
      });
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

### Actualizando elementos del menú

La estructura `Window` tiene un método `menu_handle` , que permite actualizar elementos del menú:

```rust
fn main() {
  let menu = Menu::new(); // configure el menú
  tauri::Builder::default()
    . enu(menu)
    .setup(|app| {
      let main_window = app.get_window("main"). nwrap();
      let menu_handle = main_window. esu_handle();
      std::thread::spawn(move || {
        // también puedes `set_selected`, `set_enabled` y `set_native_image` (sólo macOS).
        menu_handle.get_item("item_id").set_title("New title");
      });
      Ok(())
    })
}
```
