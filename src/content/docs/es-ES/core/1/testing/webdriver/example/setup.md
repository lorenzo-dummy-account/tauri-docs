importar HelloTauriWebdriver desde '@site/static/img/webdriver/hello-tauri-webdriver.png'

# Ejemplo de configuración

Esta aplicación de ejemplo se centra exclusivamente en añadir pruebas de WebDriver a un proyecto ya existente. Para tener un proyecto a probar en las siguientes dos secciones, configuraremos una aplicación Tauri extremadamente mínima para su uso en nuestra prueba. No usaremos la CLI de Tauri, ninguna dependencia del frontend o pasos de construcción, y no incluiremos la aplicación después de . Esto es para mostrar exactamente una suite mínima para mostrar la adición de pruebas WebDriver a una aplicación existente.

Si solo quieres ver el proyecto de ejemplo terminado que utiliza lo que se mostrará en esta guía de ejemplo, entonces puedes ver https://github. om/chippers/hola_tauri.

## Inicializando un proyecto de Carga

Queremos crear un nuevo proyecto de Cargo binario para albergar esta aplicación de ejemplo. Podemos hacer esto fácilmente desde la línea de comando con `cargamento new hello-tauri-webdriver --bin`, el cual nos hará andar un proyecto mínimo de Carga binaria para nosotros. Este directorio servirá como directorio de trabajo para el resto de esta guía, así que asegúrate de que los comandos que ejecutas están dentro de este nuevo directorio `hola-tauri-webdriver/`.

## Creando un Índice Mínimo

Crearemos un archivo HTML mínimo para actuar como el front-end de nuestra aplicación de ejemplo. También usaremos algunas cosas de este frontend más adelante durante nuestras pruebas de WebDriver.

Primero, vamos a crear nuestro distDir `Tauri` que sabemos que necesitaremos una vez que construyamos la porción de Tauri de la aplicación. `mkdir dist` debe crear un nuevo directorio llamado `dist/` en el cual vamos a colocar el siguiente `index.html` archivo.

`dist/index.html`:

```html
¡<! OCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>¡Hola Tauri!</title>
    <style>
      cuerpo {
        /* Añadir un bonito esquema de color */
        color de fondo: #222831;
        color: #ecececec;

        /* Hacer el cuerpo del tamaño exacto de la ventana */
        margen: 0;
        altura: 100vh;
        ancho: 100vw;

        /* Niños centrados vertical y horizontalmente de la etiqueta corpóreo */
        pantalla: flex;
        justificar-contenido: centro;
        elementos: centro;
      }
    </style>
  </head>
  <body>
    <h1>Hola, ¡Tauri!</h1>
  </body>
</html>
```

## Añadiendo Tauri al Proyecto de Mercancía

A continuación, añadiremos elementos necesarios para convertir nuestro proyecto de Carga en un proyecto Tauri. En primer lugar, es añadir las dependencias al Manifiesto de Mercancía (`Cargo. oml`) para que Cargo sepa extraer nuestras dependencias mientras se construye.

`Cargo.toml`:

```toml
[package]
name = "hola-tauri-webdriver"
version = "0.1.0"
edition = "2021"
rust-version = "1. 6"

# Necesario configurar algunas cosas para Tauri en tiempo de construcción
[build-dependencies]
tauri-build = "1"

# La dependencia actual de Tauri, junto con `custom-protocol` para servir las páginas.
[dependencies]
tauri = { versión = "1", features = ["custom-protocol"] }

# Hacer que --release construya un binario pequeño (opt-level = "s") y rápido (lto = true).
# Esto es completamente opcional, pero muestra que es posible probar la aplicación tan cerca de la
# configuración típica de la liberación. Nota: esto ralentizará la compilación.
[profile.release]
incremental = false
codegen-units = 1
/etc= "abort"
opt-level = "s"
lto = true
```

Hemos añadido un `[build-dependency]` como puede que hayas notado. Para usar la dependencia de compilación, debemos usarla desde un script de compilación. Crearemos uno ahora en `build.rs`.

`build.rs`:

```rust
fn main() {
    // Solo observa el directorio `dist/` para recompilar, evitando cambios innecesarios
    // cuando cambiamos archivos en otros subdirectorios del proyecto.
    println!("cargo:rerun-if-changed=dist");

    // Ejecuta los ayudante-time Tauri
    tauri_build::build()
}
```

Nuestro Proyecto de Carga ahora sabe cómo instalar y construir nuestras dependencias Tauri con toda esa configuración. Vamos a terminar de hacer este ejemplo mínimo una aplicación Tauri configurando Tauri en el código del proyecto actual. Editaremos el archivo `src/main.rs` para añadir esta funcionalidad de Tauri.

`src/main.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("cannot run Tauri application");
}
```

Pretty simple, ¿verdad?

## Tauri Configuration

Vamos a necesitar 2 cosas para construir con éxito la aplicación. Primero, necesitamos un archivo de iconos. Puedes usar cualquier PNG para esta siguiente parte y copiarlo en `icon.png`. Normalmente, esto se proporcionará como parte del andamio cuando utilices la CLI de Tauri para crear un proyecto. Para obtener el icono por defecto de Tauri, podemos descargar el icono utilizado por el repositorio de ejemplo de Hello Tauri con el comando curl `"https://github. om/chippers/hello_tauri/raw/main/icon.png" --output icon.png`.

Necesitaremos un `tauri.conf.json` para establecer algunos valores de configuración importantes para Tauri. Again, this would typically come from the `tauri init` scaffolding command, but we will be creating our own minimal config here.

`tauri.conf.json`:

```json
{
  "build": {
    "distDir": "dist"
  },
  "tauri": {
    "bundle": {
      "identifier": "studio. auri.hello_tauri_webdriver",
      "icon": ["icono. ng"]
    },
    "allowlist": {
      "all": false
    },
    "windows": [
      {
        "width": 800,
        "height": 600,
        "resizable": true,
        "pantalla completa": false
      }
    ]
  }
}
```

Voy a repasar algunas de ellas. Puede ver el directorio `dist/` que hemos creado anteriormente como la propiedad `distDir`. establecemos un identificador de paquete para que la aplicación construida tenga un id único y establezca el icono `. ng` como el único icono . No estamos usando ninguna API o características de Tauri, así que las deshabilitamos en `lista de permisos` configurando `"todos": false`. Los valores de la ventana sólo establecen una sola ventana para ser creada con algunos valores por defecto razonables.

En este punto, tenemos una aplicación básica de Hello World que debería mostrar un saludo simple cuando se ejecuta.

## Ejecutar la aplicación de ejemplo

Para asegurarnos de que lo hicimos bien, ¡vamos a construir esta aplicación! Ejecutaremos esto como una aplicación `--release` porque también ejecutaremos nuestras pruebas WebDriver con un perfil de lanzamiento. Ejecuta `cargo run --release`, y después de compilar, deberíamos ver la siguiente aplicación aparecer.

<div style={{textAlign: 'center'}}>
  <img src={HelloTauriWebdriver}/>
</div>

_Nota: Si está modificando la aplicación y quiere utilizar Devtools, luego ejecutarlo sin `--release` y "Inspeccionar elemento " debería estar disponible en el menú de clic derecho._

Ahora deberíamos estar listos para empezar a probar esta aplicación con algunos frameworks WebDriver . Esta guía pasará sobre [WebdriverIO](webdriverio) y [Selenium](selenium) en ese orden.
