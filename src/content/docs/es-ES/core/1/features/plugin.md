# Tauri Plugins

Los plugins te permiten conectar en el ciclo de vida de la aplicación Tauri e introducir nuevos comandos.

## Usando un Plugin

Para utilizar un plugin, simplemente pase la instancia del plugin al método `plugin` de la aplicación:

```rust
fn main() {
  tauri::Builder::default()
    .plugin(my_awesome_plugin::init())
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

## Escribir un Plugin

Los plugins son extensiones reutilizables a la API de Tauri que resuelven problemas comunes. También son una manera muy conveniente de estructurar tu código base!

Si usted tiene la intención de compartir su plugin con otros, proporcionamos una plantilla lista! Con el tauri-cli instalado acaba de ejecutarse:

```shell
tauri plugin init --name impresionante
```

### Paquete API

Por defecto los consumidores de tu plugin pueden llamar comandos proporcionados así:

```js
importar { invoke } desde '@tauri-apps/api'
invoke('plugin:awesome|do_something')
```

donde `impresionante` será reemplazado por el nombre de tu plugin.

Sin embargo, esto no es muy conveniente, por lo que es común que los plugins proporcionen un _paquete API_, un paquete JavaScript que proporciona acceso conveniente a sus comandos.

> Un ejemplo de esto es el [tauri-plugin-store](https://github.com/tauri-apps/tauri-plugin-store), que proporciona una estructura de clase conveniente para acceder a una tienda. Puedes hacer scaffold un plugin tauri con el paquete javascript API adjunto como este:

```shell
tauri plugin init --name increíble --api
```

## Escribir un Plugin

Usando la `tauri::plugin::Builder` puedes definir plugins similares a cómo defines tu aplicación:

```rust
use tauri::{
  plugin::{Builder, TauriPlugin},
  Ejecutar tiempo,
};

// los manejadores de comandos personalizados del plugin si eliges extender la API:

#[tauri::command]
// esto será accesible con `invoke('plugin:awesome|initialize')`.
// donde `awesome` es el nombre del plugin.
fn initialize() {}

#[tauri::command]
// esto será accesible con `invoke('plugin:awesome|do_something')`.
fn do_something() {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    .invoke_handler(tauri::generate_handler![initialize, do_something])
    .build()
}
```

Los plugins pueden configurar y mantener el estado, al igual que tu aplicación puede:

```rust
use tauri::{
  plugin::{Builder, TauriPlugin},
  AppHandle, Manager, Runtime, State,
};

#[derive(Default)]
struct MyState {}

#[tauri::command]
// esto será accesible con `invoke('plugin:awesome|do_something')`.
fn do_something<R: Runtime>(_app: AppHandle<R>, estado: Estado<'_, MyState>) {
  // ¡puedes acceder a `MyState` aquí!
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    . nvoke_handler(tauri::generate_handler![do_something])
    . etup(|app_handle| {
      // configurar el estado específico del plugin aquí
      app_handle. anage(MyState::default());
      Ok(())
    })
    .build()
}
```

### Convenciones

- El crate exporta un método `init` para crear el plugin.
- Los complementos deben tener un nombre claro con prefijo `tauri-plugin-`.
- Incluye `tauri-plugin` palabra clave en `Cargo.toml`/`package.json`.
- Documentar su plugin en inglés.
- Añade un ejemplo de aplicación mostrando tu plugin.

### Avanzado

En lugar de depender de la estructura `tauri::plugin::TauriPlugin` devuelta por `tauri::plugin::Builder::build`, puedes implementar la `tauri::plugin::Plugin` tú mismo. Esto le permite tener control total sobre los datos asociados.

Tenga en cuenta que cada función del trait `Plugin` es opcional, excepto la función `name`.

```rust
use tauri::{plugin::{Plugin, Result as PluginResult}, Ejecutar, PageLoadPayload, Window, Invocar, AppHandle};

struct MyAwesomePlugin<R: Runtime> {
  invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
  // Estado del plugin, campos de configuración
}

// los controladores de comandos personalizados plugin si elige extender la API.
#[tauri::command]
// esto será accesible con `invoke('plugin:awesome|initialize')`.
// donde `awesome` es el nombre del plugin.
fn initialize() {}

#[tauri::command]
// esto será accesible con `invoke('plugin:awesome|do_something')`.
fn do_something() {}

impl<R: Runtime> MyAwesomePlugin<R> {
  // puedes añadir campos de configuración aquí,
  // ver https://doc. ust-lang.org/1.0.0/style/ownership/builders. tml
  pub fn new() -> Self {
    Self {
      invoke_handler: Box::new(tauri::generate_handler! inicializar, do_something]),
    }
  }
}

impl<R: Runtime> Plugin<R> para MyAwesomePlugin<R> {
  /// El nombre del plugin. Debe definirse y utilizarse en las llamadas `invoke`.
  fn name(&self) -> &'static str {
    "awesome"
  }

  /// El script JS a evaluar en la inicialización.
  /// Útil cuando tu plugin es accesible a través de `window`
  /// o necesita realizar una tarea JS en la inicialización de la aplicación
  /// e. . "ventana. wesomePlugin = { ... the plugin interface }"
  fn initialization_script(&self) -> Opción<String> {
    None
  }

  /// inicializa el plugin con la configuración proporcionada en `tauri. onf.json > plugins > $yourPluginName` o el valor por defecto.
  fn inicializar(&silenciar a si mismo, app: &AppHandle<R>, config: serde_json::Value) -> PluginResult<()> {
    Ok(())
  }

  /// Callback invocado cuando se crea la Ventana.
  fn created(&mut self, window: Window<R>) {}

  /// Callback invocado cuando la vista web realiza la navegación.
  fn on_page_load(&mut self, window: Window<R>, payload: PageLoadPayload) {}

  /// Extiende el manejador de invocación.
  fn extend_api(&mut sí mismo, mensaje: Invoke<R>) {
    (self.invoke_handler)(message)
  }
}
```
