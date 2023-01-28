# Haciendo tu propio CLI

Tauri permite a tu aplicación tener un CLI a través de [clap](https://github.com/clap-rs/clap), un analizador robusto de argumentos de línea de comandos. Con una simple definición de CLI en su tauri.conf `. el archivo son` , puede definir su interfaz y leer su argumento coincide con el mapa en JavaScript y/o Rust.

## Configuración Base

Bajo `tauri.conf.json`, tiene la siguiente estructura para configurar la interfaz:

```json title=src-tauri/tauri.conf.json
{
  "tauri": {
    "cli": {
      "description": "", // descripción del comando que se muestra en ayuda
      "longDescription": "", // descripción larga del comando que se muestra en la ayuda
      "beforeHelp": "", // contenido a mostrar antes del texto de ayuda
      "afterHelp": "", // contenido a mostrar después del texto de ayuda
      "args": [], // lista de argumentos del comando, lo explicaremos después
      "subcomandos": {
        "subcomando-nombre": {
          // configura un subcomando accesible
          // con `. app subcommand-name --arg1 --arg2 --etc`
          // configuración como la anterior, con "description", "args", etc.
        }
      }
    }
  }
}
```

:::note

Todas las configuraciones JSON aquí son sólo muestras, muchos otros campos han sido omitidos por la claridad.

:::

## Añadiendo argumentos

El array `args` representa la lista de argumentos aceptados por su comando o subcomando. Puedes encontrar más detalles sobre la forma de configurarlos [aquí][tauri config].

### Argumentos Posicionales

Un argumento posicional se identifica por su posición en la lista de argumentos. Con la siguiente configuración:

```json tauri.conf.json
{
  "args": [
    {
      "name": "source",
      "index": 1,
      "takesValue": true
    },
    {
      "name": "destination",
      "index": 2,
      "takesValue": verdadero
    }
  ]
}
```

Los usuarios pueden ejecutar tu aplicación como `./app tauri.txt dest. xt` y el mapa de coincidencias definirá `fuente` como `"tauri. xt"` y `destino` como `"dest.txt"`.

### Argumentos con nombre

Un argumento nombrado es un par (clave, valor) donde la clave identifica el valor. Con la siguiente configuración:

```json tauri.conf.json
{
  "args": [
    {
      "name": "type",
      "short": "t",
      "takesValue": true,
      "múltiple": true,
      "possibleValues": ["foo", "bar"]
    }
  ]
}
```

Los usuarios pueden ejecutar tu aplicación como `./app --type foo bar`, `. app -t foo -t barra` o `. app --type=foo,bar` y el arg coincide con el mapa definirá el tipo `` como `["foo", "bar"]`.

### Marcar argumentos

Un argumento de bandera es una clave independiente cuya presencia o ausencia proporciona información a la aplicación. Con la siguiente configuración:

```json tauri.conf.json
{
  "args": [
    "name": "verbose",
    "short": "v",
    "multipleOccurrences": true
  ]
}
```

Users can run your app as `./app -v -v -v`, `./app --verbose --verbose --verbose` or `./app -vvv` and the arg matches map will define `verbose` as `true`, with `occurrences = 3`.

## Subcomandos

Algunas aplicaciones CLI tienen interfaces adicionales como subcomandos. Por ejemplo, la `git` CLI tiene `rama git`, `git commit` y `git push`. Puede definir interfaces anidadas adicionales con el array `subcomandos`:

```json tauri.conf.json
{
  "cli": {
...
    "subcommands": {
      "branch": {
        "args": []
      },
      "push": {
        "args": []
      }
    }
  }
}
```

Su configuración es la misma que la configuración de la aplicación raíz, con la descripción ``, `longDescription`, `argumentos`, etc.

## Leyendo las partidas

### Oxidado

```rust
fn main() {
  tauri::Builder::default()
    .setup(|app| {
      match app.get_cli_matches() {
        // `matches` aquí hay una estructura con { args, subcommand }.
        // `args` es `HashMap<String, ArgData>` donde `ArgData` es una estructura con { value, occurrences }.
        // `subcommand` es `Option<Box<SubcommandMatches>>` donde `SubcommandMatches` es una estructura con { name, matches }.
        Ok(matches) => {
          println! "{:?}", matches)
        }
        Err(_) => {}
      }
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error mientras se ejecuta la aplicación tauri");
}
```

### JavaScript

```js
importar { getMatches } de '@tauri-apps/api/cli'

getMatches().then((matches) => {
  // hacer algo con las { args, subcommand } coincidencias
})
```

## Documentación completa

Puede encontrar más información sobre la configuración de CLI [aquí][tauri config].

[tauri config]: ../../api/config.md#tauri
