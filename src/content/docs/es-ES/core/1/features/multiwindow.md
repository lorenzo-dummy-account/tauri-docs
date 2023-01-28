# Ventana múltiple

Administrar múltiples ventanas en una sola aplicación.

## Creando una ventana

Una ventana puede ser creada estáticamente desde el archivo de configuración Tauri o en tiempo de ejecución.

### Ventana estática

Se pueden crear múltiples ventanas con el array de configuración de [tauri.windows][]. El siguiente fragmento JSON demuestra cómo crear estáticamente varias ventanas a través de la configuración:

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
        "url": "index. tml"
      }
    ]
  }
}
```

Tenga en cuenta que la etiqueta de ventana debe ser única y se puede utilizar en tiempo de ejecución para acceder a la instancia de la ventana. La lista completa de opciones de configuración disponibles para ventanas estáticas puede encontrarse en la documentación de [WindowConfig][].

### Ejecutar ventana de tiempo

También puede crear ventanas en tiempo de ejecución a través de la capa Rust o a través de la API Tauri.

#### Crear una ventana en Rust

Se puede crear una ventana en tiempo de ejecución usando la estructura [WindowBuilder][].

Para crear una ventana, debe tener una instancia de la ejecución de [App][] o una [AppHandle][].

##### Crea una ventana usando la instancia de [App][]

La instancia de [App][] se puede obtener en el gancho de configuración o después de una llamada a [Builder::build][].

```rust Using the setup hook
tauri::Builder::default()
  . etup(|app| {
    let docs_window = tauri::WindowBuilder::new(
      app,
      "externo", /* la etiqueta única de ventana */
      tauri::WindowUrl::External("https://tauri. pp/".parse(). nwrap())
    ). uild()?
    let local_window = tauri::WindowBuilder::new(
      aplicación,
      "local",
      tauri::WindowUrl::App("index. tml".into())
    ).build()?;
    Ok(())
})
```

Usar el gancho de instalación asegura que las ventanas estáticas y los plugins de Tauri estén inicializados. Alternativamente, puedes crear una ventana después de construir la [App][]:

```rust Using the built app
let app = tauri::Builder::default()
  .build(tauri::generate_context!())
  . xpect("error al construir la aplicación tauri");

let docs_window = tauri::WindowBuilder::new(
  &app,
  "external", /* la etiqueta única de ventana */
  tauri::WindowUrl::External("https://tauri. pp/".parse().unwrap())
).build(). xpect("failed to build window");

let local_window = tauri::WindowBuilder::new(
  &app,
  "local",
  tauri::WindowUrl::App("index. tml".into())
).build()?;
```

Este método es útil cuando no puede mover la propiedad de los valores al cierre de la configuración.

##### Crea una ventana usando una instancia de [AppHandle][]

Se puede obtener una instancia de [AppHandle][] usando la función [`App::handle`] o directamente inyectada en comandos de Tauri.

```rust Create a window in a separate thread
tauri::Builder::default()
  .setup(|app| {
    let handle = app. andle();
    std::thread::spawn(move || {
      let local_window = tauri::WindowBuilder::new(
        &handle,
        "local",
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
    "external", /* la etiqueta única de ventana */
    tauri::WindowUrl::External("https://tauri. pp/".parse().unwrap())
  ).build().unwrap();
}
```

:::info

Al crear ventanas en un comando Tauri, asegúrese de que la función de comando es `asíncrona` para evitar un punto muerto en Windows debido al problema [wry#583][].

:::

#### Crear una ventana en JavaScript

Utilizando la API de Tauri puede crear fácilmente una ventana en tiempo de ejecución importando la clase [WebviewWindow][].

```js Create a window using the WebviewWindow class
import { WebviewWindow } from '@tauri-apps/api/window'
const webview = new WebviewWindow('theUniqueLabel', {
  url: 'path/to/page. tml',
})
// desde que la ventana de webview se crea de forma asincrónica,
// Tauri emite `tauri://created` y `tauri://error` para notificarte de la respuesta de creación
vista web. nce('tauri://created', function () {
  // ventana de vista web creada con éxito
})
vista web. nce('tauri://error', function (e) {
  // se ha producido un error durante la creación de la ventana de webview
})
```

## Acceder a una ventana en tiempo de ejecución

La instancia de la ventana puede ser consultada usando su etiqueta y el método [get_window][] en Rust o [WebviewWindow.getByLabel][] en JavaScript.

```rust Using get_window
use tauri::Manager;
tauri::Builder::default()
  .setup(|app| {
    let main_window = app.get_window("main").unwrap();
    Ok(())
})
```

Ten en cuenta que debes importar [tauri::Manager][] para usar el método [get_window][] en instancias [App][] o [AppHandle][].

```js Using WebviewWindow.getByLabel
importar { WebviewWindow } desde '@tauri-apps/api/window'
const mainWindow = WebviewWindow.getByLabel('main')
```

## Comunicándose con otras ventanas

La comunicación de la ventana se puede hacer utilizando el sistema de eventos. Consulte la [Guía de eventos][] para obtener más información.

[tauri.windows]: ../../api/config.md#tauriconfig.windows
[WindowConfig]: ../../api/config.md#windowconfig
[WindowBuilder]: https://docs.rs/tauri/1.0.0/tauri/window/struct.WindowBuilder.html
[App]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[AppHandle]: https://docs.rs/tauri/1.0.0/tauri/struct.AppHandle.html
[Builder::build]: https://docs.rs/tauri/1.0.0/tauri/struct.Builder.html#method.build
[get_window]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html#method.get_window
[wry#583]: https://github.com/tauri-apps/wry/issues/583
[WebviewWindow]: ../../api/js/window.md#webviewwindow
[WebviewWindow.getByLabel]: ../../api/js/window.md#getbylabel
[tauri::Manager]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html
[Guía de eventos]: ./events.md
