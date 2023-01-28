---
sidebar_position: 5
---

# Actualización

## Configuración

Una vez que tengas preparado tu proyecto Tauri, necesitas configurar el actualizador.

Añadir esto en tauri.conf.json

```json
"updater": {
    "active": true,
    "endpoints": [
        "https://releases.myapp.com/{{target}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "YOUR_UPDATER_SIGNATURE_PUBKEY_HERE"
}
```

Las teclas requeridas son "activas", "endpoints" y "pubkey"; otras son opcionales.

"activo" debe ser un booleano. De forma predeterminada, se establece en falso.

"endpoints" debe ser una matriz. La cadena `{{target}}` y `{{current_version}}` son reemplazados automáticamente en la URL que le permite determinar el lado del servidor [](#update-server-json-format) si hay una actualización disponible. Si se especifican varios extremos, el actualizador retrocederá si un servidor no responde dentro del tiempo de espera predefinido.

"diálogo" si está presente debe ser un booleano. De forma predeterminada, se establece en verdadero. Si está activado, [eventos](#events) están desactivados ya que el actualizador maneja todo. Si necesita los eventos personalizados, DEBE desactivar el diálogo incorporado.

"pubkey" debe ser una clave pública válida generada con Tauri CLI. Ver [Firmar actualizaciones](#signing-updates).

### Actualizar solicitudes

Tauri es indiferente a la solicitud que la aplicación cliente proporciona para la verificación de actualización.

`Aceptar: application/json` se añade a las cabeceras de solicitud porque Tauri es responsable de analizar la respuesta.

Para los requisitos impuestos en las respuestas y el formato del cuerpo de una actualización, vea [el soporte técnico del servidor](#server-support).

Su solicitud de actualización debe _al menos_ incluir un identificador de versión para que el servidor pueda determinar si se requiere una actualización para esta versión específica.

También puede incluir otros criterios de identificación, como la versión del sistema operativo, para permitir al servidor entregar una actualización tan fina como le gustaría.

Cómo incluir el identificador de versión, u otros criterios son específicos del servidor desde el que solicita actualizaciones. Un enfoque común es usar parámetros de consulta, [Configuración](#configuration) muestra un ejemplo.

### Diálogo integrado

De forma predeterminada, el actualizador utiliza una API de diálogo integrada de Tauri.

![Nueva actualización](https://i.imgur.com/UMilB5A.png)

Las notas del lanzamiento del cuadro de diálogo están representadas por la actualización `nota` proporcionada por el servidor [](#server-support). Si el usuario acepta, la actualización se descarga e instala. Después, se le pide al usuario que reinicie la aplicación.

### API de Javascript

:::caution
Necesitas _desactivar el cuadro de diálogo integrado_ en tu configuración [tauri](#configuration); de lo contrario, la API de javascript NO funcionará.
:::

```js
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
try {
  const { shouldUpdate, manifest } = await checkUpdate()
  if (shouldUpdate) {
    // mostrar el cuadro de diálogo
    await installUpdate()
    // instalar complete, reinicie la aplicación
    await ontunch()
  }
} catch (error) {
  consola. og(error)
}
```

### Eventos

:::precaución

Necesita _desactivar el diálogo integrado_ en la configuración [de tauri](#configuration); de lo contrario, los eventos no se emiten.

:::

Para saber cuándo una actualización está lista para ser instalada, puedes suscribirte a estos eventos:

#### Inicializar el actualizador y comprobar si hay una nueva versión disponible

##### Si una nueva versión está disponible, el evento `tauri://update-available` es emitido.

Event: `tauri://update`

#### Oxidado

```rust
window.emit("tauri://update".to_string(), ✫ );
```

#### Javascript

```js
importar { emit } desde '@tauri-apps/api/event'
emit('tauri://update')
```

#### Escucha el evento de la nueva actualización disponible

Evento: `tauri://update-available`

Datos emitidos:

```
versión anunciada por la fecha
del servidor anunciada por la nota
del cuerpo del servidor anunciada por el servidor
```

#### Oxidado

```rust
window.listen("tauri://update-available".to_string(), mover |msg| {
  println!("Nueva versión disponible: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-available', function (res) {
  console.log('Nueva versión disponible: ', res)
})
```

#### Emitir instalación y descarga de eventos

Necesitas emitir este evento para inicializar la descarga y escuchar el [progreso de instalación](#listen-install-progress).

Event: `tauri://update-install`

#### Oxidado

```rust
window.emit("tauri://update-install".to_string(), Ninguno);
```

#### Javascript

```js
importar { emit } desde '@tauri-apps/api/event'
emit('tauri://update-install')
```

#### Escucha el progreso de la instalación

Event: `tauri://update-status`

Datos emitidos:

```
status [ERROR/PENDING/DONE]
error String/null
```

PENDING se emite cuando se inicia la descarga y se realiza cuando se completa la instalación. Luego puede pedir que se reinicie la aplicación.

ERROR se emite cuando hay un error con el actualizador. Sugerimos escuchar este evento incluso si el diálogo está habilitado.

#### Oxidado

```rust
window.listen("tauri://update-status".to_string(), mover |msg| {
  println!("Nuevo estado: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-status', function (res) {
  console.log('Nuevo estado: ', res)
})
```

## Soporte de Servidor

Su servidor debe determinar si es necesaria una actualización basada en la [Solicitud de actualización](#update-requests) que su cliente tiene problemas.

Si se requiere una actualización, tu servidor debe responder con un código de estado de [200 OK][] e incluir la [actualización JSON](#update-server-json-format) en el cuerpo.

Si no se requiere ninguna actualización, su servidor debe responder con un código de estado de [204 Sin contenido][].

### Actualizar el formato JSON del servidor

Cuando una actualización está disponible, Tauri espera el siguiente esquema en respuesta a la solicitud de actualización proporcionada:

```json
{
  "url": "https://mycompany.example.com/myapp/releases/myrelease.tar.gz",
  "version": "0.0.1",
  "notes": "Theses are some release notes",
  "pub_date": "2020-09-18T12:29:53+01:00",
  "signature": ""
}
```

Las claves requeridas son "url", "version" y "signature"; las otras son opcionales.

"pub_date" si está debe estar formateado de acuerdo con [RFC 3339][date and time on the internet: timestamps].

"signature" es el contenido del archivo `.sig` que fue generado por el CLI de Tauri. Consulte [Firmar Actualizaciones](#signing-updates) para obtener instrucciones sobre cómo configurar las claves requeridas.

### Actualizar archivo JSON Formato

La técnica de actualización alternativa utiliza un archivo JSON plano, almacenando sus metadatos de actualización en S3, gist u otro almacenamiento de archivos estático. Tauri comprueba contra el campo de versión, y si la versión del proceso en ejecución es menor que la reportada y la plataforma está disponible activa una actualización. El formato de este archivo se detalla a continuación:

```json
{
  "version": "v1.0. ",
  "notes": "Test version",
  "pub_date": "2020-06-22T19:25:57Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.app.tar. z"
    },
    "darwin-aarch64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1. .0/silicon/app.app.tar. z"
    },
    "linux-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.AppImage.tar. z"
    },
    "windows-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.x64.msi.zip"
    }
  }
}
```

Tenga en cuenta que cada clave de plataforma está en el formato `OS-ARCH` , donde `SO` es uno de `linux`, `darwin` o `windows`, y `ARCH` es uno de `x86_64`, `aarch64`, `i686` o `armv7`.

## Bundler (Artefactos)

El bundler de Tauri genera automáticamente artefactos de actualización si el actualizador está habilitado en `tauri.conf. son` Los artefactos de actualización se firman automáticamente si el bundler puede localizar sus claves públicas y privadas.

La firma es el contenido del archivo `.sig`. La firma se puede subir a GitHub de forma segura o hacer pública si su clave privada está segura.

Puede ver cómo está [empaquetado con el CI][artifacts updater workflow] y una [muestra tauri.conf.json][].

### macOS

En macOS, creamos un .tar.gz desde toda la aplicación. (.app)

```
objetivo/release/bundle
Ninguno/macos
    Ningunidad-app.app
    Ninguno.app.app.tar.gz (paquete de actualización)
    Ninguno: app.app.tar.gz.sig
```

### Ventanas

En Windows, creamos un .zip desde el MSI; al descargar y validar, ejecutamos la instalación de MSI.

```
target/release/bundle
Ningito/msi
    Ningunidad-app.x64.msi
    Ninguno: app.x64.msi.zip (paquete de actualizaciones)
    Ninguno: app.x64.msi.zip.sig
```

### Linux

En Linux, creamos un .tar.gz desde AppImage.

```
target/release/bundle
Ningundo appimage
    Ningun.AppImage
    ✫ app.AppImage.tar.gz (paquete de actualizaciones)
    Parliament, app.AppImage.tar.gz.sig
```

## Actualizaciones

Ofrecemos una firma integrada para asegurarse de que su actualización es segura para ser instalada.

Para firmar tus actualizaciones, necesitas dos cosas.

La _Public-key_ (pubkey) debe ser añadida dentro de su `tauri.conf.json` para validar el archivo de actualización antes de instalar.

La _clave privada_ (privkey) se utiliza para firmar su actualización y NUNCA debe ser compartida con nadie. Además, si pierde esta clave, NO podrá publicar una nueva actualización a la base de usuarios actual. Es crucial guardarlo en un lugar seguro, y siempre puedes acceder a él.

Para generar tus claves, necesitas usar la CLI de Tauri:

```shell
tauri signer generate -w ~/.tauri/myapp.key
```

Tienes varias opciones disponibles

```
Genera un par de claves para los archivos de signos

USAGE:
    tauri signer generate [OPTIONS]

OPCIONES:
    -f, --force Sobreescribir clave privada incluso si existe en la ruta especificada
    -h, --help Imprimir información de ayuda
    -p, --password <PASSWORD>        Establecer contraseña de clave privada al firmar
    -V, --version Imprimir información de versión
    -w, --write-keys <WRITE_KEYS>    Escribe la clave privada en un archivo
```

---

Variables de entorno usadas para firmar con el Tauri `bundler`:<br/> Si están configuradas, el bundler genera automáticamente y firma los artefactos del actualizador.<br/> `TAURI_PRIVATE_KEY` Ruta o Cadena de su clave privada<br/> `TAURI_KEY_PASSWORD` Su contraseña de clave privada (opcional)

[200 OK]: http://tools.ietf.org/html/rfc2616#section-10.2.1
[204 Sin contenido]: http://tools.ietf.org/html/rfc2616#section-10.2.5
[date and time on the internet: timestamps]: https://datatracker.ietf.org/doc/html/rfc3339#section-5.8
[artifacts updater workflow]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/.github/workflows/artifacts-updater.yml#L44
[muestra tauri.conf.json]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/examples/updater/src-tauri/tauri.conf.json#L52
