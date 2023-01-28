---
sidebar_position: 8
---

# Incrustar archivos adicionales

Puede que necesite incluir archivos adicionales en el paquete de su aplicación que no son parte de su frontend (su `distDir`) directamente o que son demasiado grandes para ser incrustados en el binario. Llamamos a estos archivos `recursos`.

Para empaquetar los archivos de su elección, puedes añadir la propiedad `resources` al objeto `tauri > paquete` en tu tauri `. archivo onf.json`.

Vea más sobre la configuración de tauri.conf.json [aquí][tauri.bundle].

`recursos` espera una lista de archivos de cadenas de destino con rutas absolutas o relativas. Soporta patrones de glob en caso de que necesite incluir varios archivos de un directorio.

Aquí hay una muestra para ilustrar la configuración. Este no es un archivo `tauri.conf.json`:

```json title=tauri.conf.json
{
  "tauri": {
    "bundle": {
      "resources": [
        "/absolute/path/to/textfile. xt",
        "relative/path/to/jsonfile. hijo",
        "recursos/*"
      ]
    },
    "allowlist": {
      "fs": {
        "scope": ["$RESOURCE/*"]
      }
    }
  }
}
```

:::note

Las rutas absolutas y las rutas que contienen componentes padre (`../`) sólo pueden permitirse a través de `"$RESOURCE/*"`. Rutas relativas como `"path/to/file.txt"` pueden permitirse explícitamente a través de `"$RESOURCE/path/to/file.txt"`.

:::

## Accediendo a archivos en JavaScript

En este ejemplo queremos empaquetar archivos i18n json adicionales que se ven así:

```json title=de.json
{
  "hello": "Guten Tag!",
  "bye": "Auf Wiedersehen!"
}
```

En este caso, almacenamos estos archivos en un directorio `lang` junto al `tauri.conf.json`. Para esto sumamos `"lang/*"` a `recursos` y `$RESOURCE/lang/*` al ámbito fs como se muestra arriba.

Ten en cuenta que debes configurar la lista permitida para habilitar `ruta > todos` y [`fs` APIs][] que necesitas. en este ejemplo `fs > readTextFile`.

```javascript
importar { resolveResource } desde '@tauri-apps/api/path'
// alternativamente, usar `window.__TAURI__.path. esolveResource`
importar { readTextFile } desde '@tauri-apps/api/fs'
// alternativamente, usar `window.__TAURI__.fs.readTextFile`

// `lang/de.json` es el valor especificado en `tauri. onf.json > tauri > bundle > resources`
const resourcePath = await resolveResource('lang/de.json')
const langDe = JSON. arse(await readTextFile(resourcePath))

console.log(langDe.hello) // Esto imprimirá 'Guten Tag!' en la consola de devtools
```

## Acceder a archivos en Rust

Esto se basa en el ejemplo anterior. En el lado de Rust necesitas una instancia del [`PathResolver`][] que puedes obtener de [`App`][] y [`AppHandle`][]:

```rust
tauri::Builder::default()
  .setup(|app| {
    let resource_path = app.path_resolver()
      .resolve_resource("lang/de. hijo")
      . xpect("failed to resolve resource");

    let file = std::fs::File::open(&resource_path). nwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    println!("{}", lang_de. et("hola").unwrap()); // Esto imprimirá 'Guten Tag!' en el terminal

    Ok(())
})
```

```rust
#[tauri::command]
fn hola(handle: tauri::AppHandle) -> String {
   let resource_path = handle. ath_resolver()
      .resolve_resource("lang/de.json")
      . xpect("failed to resolve resource");

    let file = std::fs::File::open(&resource_path). nwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    lang_de.get("hola").unwrap()
}
```

[tauri.bundle]: ../../api/config.md#tauri.bundle
[`fs` APIs]: ../../api/js/fs/
[`PathResolver`]: https://docs.rs/tauri/latest/tauri/struct.PathResolver.html
[`App`]: https://docs.rs/tauri/latest/tauri/struct.App.html
[`AppHandle`]: https://docs.rs/tauri/latest/tauri/struct.AppHandle.html
