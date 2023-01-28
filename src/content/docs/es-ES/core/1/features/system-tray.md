# Bandeja del sistema

Sistema de aplicación nativo.

### Configurar

Configurar el objeto `systemTray` en `tauri.conf.json`:

```json
{
  "tauri": {
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
}
```

El `iconAsTemplate` es un valor booleano que determina si la imagen representa un [Template Image][] en macOS.

#### Configuración de Linux

En Linux, necesita instalar uno de los paquetes `libayatana-appindicator` o `libappindicator3`. Tauri determina qué paquete usar en tiempo de ejecución, siendo `libayatana` el preferido si ambos están instalados.

Por defecto, el paquete Debian (`.deb` file) añadirá una dependencia en `libayatana-appindicator3-1`. Para crear un paquete Debian orientado a `libappindicator3`, establezca la variable de entorno `TAURI_TRAY` a `libappindicator3`.

El paquete AppImage incrusta automáticamente la librería de bandeja instalada, y también puede utilizar la variable de entorno `TAURI_TRAY` para seleccionarla manualmente.

:::info

`libappindicator3` no está mantenida y no existe en algunas distribuciones como `debian11`, pero `libayatana-appindicator` no existe en versiones anteriores.

:::

### Creando una bandeja de sistema

Para crear una bandeja de sistema nativa, importe el tipo `SystemTray`:

```rust
usar tauri::SystemTray;
```

Inicializar una nueva instancia de bandeja:

```rust
let bandeja = SystemTray::new();
```

### Configurando un menú contextual de la bandeja del sistema

Opcionalmente, puede añadir un menú contextual que es visible cuando el icono de la bandeja está pulsado con el botón derecho. Importar el `System TrayMenu`, `SystemTrayMenuItem` y `CustomMenuItem` tipos:

```rust
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
```

Crear el `System TrayMenu`:

```rust
// aquí `"quit".to_string()` define el id del elemento de menú, y el segundo parámetro es la etiqueta del elemento de menú.
let quit = CustomMenuItem::new("quit".to_string(), "Salir");
let hide = CustomMenuItem::new("ocultar".to_string(), "Ocultar");
let tray_menu = SystemTrayMenu::new()
  .add_item(quit)
  .add_native_item(SystemTrayMenuItem::Separator)
  .add_item(hide);
```

Añadir el menú de bandeja a la instancia de `SystemTray`:

```rust
let tray = SystemTray::new().with_menu(tray_menu);
```

### Configurar la bandeja del sistema de aplicaciones

La instancia creada `SystemTray` puede establecerse usando la API `system_tray` en la estructura `tauri::Builder`:

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insertar los elementos del menú aquí
  let system_tray = SystemTray::new()
    . ith_menu(tray_menu);
  tauri::Builder::default()
    .system_tray(system_tray)
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

### Escuchando eventos de la bandeja del sistema

Cada `elemento personalizado` activa un evento cuando se hace clic. También, Tauri emite eventos de iconos de bandeja. Utilice la API `on_system_tray_event` para manejarlas:

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // inserta los elementos del menú aquí
  tauri::Builder::default()
    . ystem_tray(SystemTray::new().with_menu(tray_menu))
    . n_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        tamaño: _,
..
      } => {
        println!("bandeja del sistema recibió un clic izquierdo");
      }
      SystemTrayEvent::Right Click {
        position: _,
        size: _,
..
      } => {
        println!("bandeja del sistema recibió un clic derecho");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
..
      } => {
        println!("bandeja del sistema recibió un doble clic");
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        id coincidente. s_str() {
          "quit" => {
            std::process::exit(0);
          }
          "ocultar" => {
            let window = app. et_window("main").unwrap();
            window. ide(). nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

### Actualizando bandeja del sistema

La estructura `AppHandle` tiene un método `tray_handle` , que devuelve un handle a la bandeja del sistema permitiendo actualizar el icono de la bandeja y los elementos del menú contextual:

#### Actualizando elementos del menú contextual

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // inserta los elementos del menú aquí
  tauri::Builder::default()
    . ystem_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        // obtiene un handle para el elemento de menú pulsado
        // nota que `tray_handle` puede ser llamado en cualquier lugar,
        // solo obtiene una instancia de `AppHandle` con `app. andle()` en el gancho de configuración
        // y muévelo a otra función o hilo
        dejar item_handle = app. ray_handle().get_item(&id);
        match id. s_str() {
          "hide" => {
            let window = app. et_window("main"). nwrap();
            window.hide(). nwrap();
            // también puedes `set_selected`, `set_enabled` y `set_native_image` (solo macOS).
            item_handle.set_title("Mostrar"). nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

#### Actualizar icono de la bandeja

Ten en cuenta que necesitas añadir la función `icon-ico` o `icon-png` a la dependencia de tauri en tu Cargo. oml para poder usar `Icon::Raw`

```rust
app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../ruta/to/miicon.ico").to_vec())).unwrap();
```

### Mantener la aplicación funcionando en segundo plano después de cerrar todas las ventanas

Por defecto, tauri cierra la aplicación cuando se cierra la última ventana. Si tu aplicación debe ejecutarse en segundo plano, puedes llamar a `api.prevent_close()` así:

```rust
tauri::Builder::default()
  .build(tauri::generate_context!())
  .expect("error mientras se construía la aplicación tauri")
  .run(|_app_handle, event| match event {
    tauri::RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    _ => {}
});
```

[Template Image]: https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc
