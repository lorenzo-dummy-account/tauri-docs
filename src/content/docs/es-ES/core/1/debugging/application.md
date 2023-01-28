importar comando de '@theme/Command'

# Depuración de la aplicación

Con todas las piezas en movimiento en Tauri, puede encontrarse con un problema que requiere depuración. Hay muchas ubicaciones donde se imprimen los detalles de errores, y Tauri incluye algunas herramientas para hacer el proceso de depuración más sencillo.

## Consola de Rust

El primer lugar para buscar errores es en la Consola de Polvo. Esto es en el terminal donde corrió, por ejemplo, `dev tauri`. Puedes usar el siguiente código para imprimir algo en esa consola desde dentro de un archivo de Rust:

```rust
println!("Mensaje de Rust: {}", msg);
```

A veces puedes tener un error en tu código de Rust y el compilador de Rust puede darte mucha información. Si, por ejemplo, `tauri dev` falla, puede volver a ejecutarlo en Linux y macOS:

```shell
RUST_BACKTRACE=1 dev tauri
```

o le gusta esto en Windows:

```shell
establecer RUST_BACKTRACE=1
dev tauri
```

Este comando te da un rastro de pila granular. En general, el compilador de Rust le ayuda dándole información detallada sobre el problema, como:

```
error[E0425]: no se puede encontrar el valor `sol` en este ámbito
  --> src/main. s:11:5
   |
11 | sun += i.to_string().parse::<u64>(). nwrap();
   | ^^^ help: existe una variable local con un nombre similar: `suma`

error: abortando debido al error anterior

Para más información sobre este error, intente `rustc --explain E0425`.
```

## WebView Console

Haga clic con el botón derecho del ratón en la vista web y elija `Elemento de inspección`. Esto abre un inspector web similar a las herramientas de desarrollo de Chrome o Firefox a las que estás acostumbrado. También puede utilizar el acceso directo `Ctrl + Shift + i` en Linux y Windows, y `Comando + Opción + i` en macOS para abrir el inspector.

El inspector es específico de la plataforma, renderizando el webkit2gtk WebInspector en Linux, el inspector de Safari en macOS y las Microsoft Edge DevTools en Windows.

### Abriendo Devtools programáticamente

You can control the inspector window visibility by using the [`Window::open_devtools`][] and [`Window::close_devtools`][] functions:

```rust
use tauri::Manager;
tauri::Builder::default()
  . etup(|app| {
    #[cfg(debug_assertions)] // sólo incluye este código en compilaciones de depuración
    {
      let window = app. et_window("main").unwrap();
      window.open_devtools();
      window. lose_devtools();
    }
    Ok(())
});
```

### Utilizando el Inspector en la producción

De forma predeterminada, el inspector sólo está habilitado en construcciones de desarrollo y depuración a menos que lo habilite con una característica de Carga.

#### Crear una compilación de depuración

Para crear una compilación de depuración, ejecute el comando `tauri build --debug`.

<Command name="build --debug" />

Al igual que los procesos normales de compilación y dev, la construcción toma algún tiempo la primera vez que ejecuta este comando, pero es significativamente más rápida en las ejecuciones posteriores. La aplicación empaquetada final tiene la consola de desarrollo habilitada y se coloca en `src-tauri/target/debug/bundle`.

También puede ejecutar una aplicación construida desde el terminal, dándote las notas del compilador de Rust (en caso de errores) o los mensajes de tu `println`. Ir al archivo `src-tauri/target/(release|debug)/[nombre de la aplicación]` y ejecutarlo directamente en tu consola o hacer doble clic en el ejecutable en el sistema de archivos (Nota: la consola se cierra en errores con este método).

#### Activar Característica Devtools

:::advertencia

La API de devtools es privada en macOS. El uso de APIs privadas en macOS impide que tu aplicación sea aceptada en la App Store.

:::

Para habilitar las herramientas de desarrollo en compilaciones de producción, debe habilitar la función `devtools` Cargo en el archivo `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "...", features = ["...", "devtools"] }
```

## Depurando el proceso del núcleo

El proceso del núcleo está alimentado por Rust para que puedas usar GDB o LLDB para depurarlo. Puede seguir la guía [Depuración en código VS][] para aprender cómo utilizar la extensión de código LLDB VS para depurar el proceso central de las aplicaciones Tauri.

[Depuración en código VS]: ./vs-code.md
[`Window::open_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.open_devtools
[`Window::close_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.close_devtools
