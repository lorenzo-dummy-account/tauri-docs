---
sidebar_label: firma de código macOS
sidebar_position: 4
---

# Firmar código aplicaciones macOS

Esta guía proporciona información sobre la firma de código y notarización de aplicaciones macOS.

:::note

Si no está utilizando Acciones de GitHub para realizar compilaciones de DMG de OSX, necesitará asegurarse de que la variable de entorno <i>CI=true</i> existe. Para más información, consulte [tauri-apps/tauri#592][].

:::

## Requisitos

- macOS 10.13.6 o posterior
- Xcode 10 o posterior
- Una cuenta de desarrollador de Apple inscrita en el [programa de desarrollo de Apple][]

Para obtener más información, por favor lea el artículo del desarrollador sobre [notarizar software macOS antes de la distribución][].

## tl;dr

El proceso de firma y notarización de código Tauri se configura a través de las siguientes variables de entorno:

- `APPLE_SIGNING_IDENTITY`: el nombre de la entrada del llavero que contiene el certificado de firma.
- `APPLE_CERTIFICATE`: cadena base64 del certificado `.p12` , exportada desde el llavero. Útil si no tiene el certificado en el llavero (por ejemplo, máquinas IC).
- `APPLE_CERTIFICATE_PASSWORD`: la contraseña para el certificado `.p12`.
- `APPLE_ID` y `APPLE_PASSWORD`: tu email de cuenta de Apple y una [contraseña específica de la aplicación][]. Sólo es necesario para notarizar la aplicación.
- `APPLE_API_ISSUER` y `APPLE_API_KEY`: autenticación con una clave API de App Store Connect en lugar del ID de Apple. Sólo es necesario si notarializa la aplicación.
- `APPLE_PROVIDER_SHORT_NAME`: Nombre corto del proveedor del equipo. Si tu Apple ID está conectado a varios equipos, tiene que especificar el nombre corto del proveedor del equipo que desea utilizar para notarizar su aplicación. Puede listar los proveedores de su cuenta usando `xcrun altool --list-providers -u "AC_USERNAME" -p "AC_PASSWORD"` como se explica en el flujo de trabajo [de notarización](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow).

## Firmando aplicaciones Tauri

El primer paso para firmar una aplicación macOS es obtener un certificado de firma del Programa de desarrollo de Apple.

### Creando un certificado de firma

Para crear un nuevo certificado de firma, usted debe generar un archivo de Certificado de Solicitud de Firma de Logisticas de su computadora Mac. [Crear una solicitud de firma de certificado][] describe la creación de un CSR.

En tu cuenta de desarrollador de Apple, ve a los certificados [, ID & Página de perfiles][] y haga clic en el botón `Crear un certificado` para abrir la interfaz para crear un nuevo certificado. Elija el tipo de certificado apropiado (`Apple Distribution` para enviar aplicaciones a la App Store, y `Developer ID Application` para enviar aplicaciones fuera de la App Store). Sube tu CSR, y se creará el certificado.

:::note

Solo el `titular de la cuenta` del desarrollador de Apple puede crear certificados de _aplicación de ID de desarrollador_. Pero se puede asociar con un ID de Apple diferente creando un CSR con una dirección de correo electrónico de usuario diferente.

:::

### Descargando certificado

En [Certificados, IDs & Página de perfiles][], haga clic en el certificado que desea utilizar y haga clic en el botón `Descargar` Guarda un archivo `.cer` que instala el certificado en el llavero una vez abierto. El nombre de la entrada del llavero representa la `firma de identidad`, el cual también se puede encontrar ejecutando `seguridad find-identity -v -p codesignning`.

:::note

Un certificado de firma sólo es válido si está asociado con tu ID de Apple. Un certificado no válido no aparecerá en la pestaña <i>Keychain Access > My Certificates</i> o en la salida <i>security find-identity -v -p codesign</i>.

:::

### Firmando la aplicación Tauri

La configuración de la firma se proporciona al bundler Tauri a través de variables de entorno. Necesita configurar el certificado a utilizar y una configuración de autenticación opcional para notarizar la aplicación.

#### Certificar variables de entorno

- `APPLE_SIGNING_IDENTITY`: esta es la `firma de identidad` que resaltamos anteriormente. Debe definirse para firmar aplicaciones tanto localmente como en máquinas IC.

Adicionalmente, simplificar el proceso de firma de código en CI, Tauri puede instalar el certificado en el llavero para usted si define las variables de entorno `APPLE_CERTIFICATE` y `APPLE_CERTIFICATE_PASSWORD`.

1. Abre la aplicación `Keychain Access` y encuentra la entrada del llavero de tu certificado.
2. Expande la entrada, haga doble clic en el elemento clave y seleccione `Exportar "$KEYNAME"`.
3. Seleccione la ruta para guardar el archivo `.p12` y defina la contraseña del certificado exportado.
4. Convertir el archivo `.p12` a base64 corriendo el siguiente script en la terminal: `openssl base64 -in /path/to/certificate.p12 -out certificate-base64.txt`.
5. Establece el contenido del archivo `certificate-base64.txt` a la variable de entorno `APPLE_CERTIFICATE`.
6. Establezca la contraseña del certificado a la variable de entorno `APPLE_CERTIFICATE_PASSWORD`.

#### Variables de entorno de autenticación

Estas variables sólo son necesarias para notarizar la aplicación.

:::note

La notarización es necesaria cuando se utiliza un certificado de <i>aplicación de ID de desarrollador</i>.

:::

- `APPLE_ID` and `APPLE_PASSWORD`: to authenticate with your Apple ID, set the `APPLE_ID` to your Apple account email (example: `export APPLE_ID=tauri@icloud.com`) and the `APPLE_PASSWORD` to an [app-specific password][] for the Apple account.
- `APPLE_API_ISSUER` y `APPLE_API_KEY`: alternativamente, puede autenticarse usando una clave API de App Store Connect. Abra la página [de acceso y usuarios de la App Store][], seleccione la pestaña `Keys` , haga clic en el botón `Añadir` y seleccione un nombre y el acceso de `Desarrollador`. El `APPLE_API_ISSUER` (`Emisor ID`) se presenta encima de la tabla de llaves, y la `APPLE_API_KEY` es el valor en la columna `Key ID` en esa tabla. También necesita descargar la clave privada, que sólo se puede hacer una vez y sólo es visible después de una recarga de página (el botón se muestra en la fila de la tabla para la clave recién creada). El archivo de clave privada debe guardarse en `./private_keys`, `~/private_keys`, `~/. rivate_keys` o `~/.appstoreconnect/private_keys`, como se indica en el comando `xcrun altool --help`.

### Construyendo la aplicación

El bundler Tauri firma y notariza automáticamente tu aplicación con todas estas variables de entorno al ejecutar el comando `tauri build`.

### Ejemplo

El siguiente ejemplo usa Acciones de GitHub para firmar una aplicación usando la acción [Tauri][].

Primero definimos las variables de entorno que enumeramos arriba como secretos en GitHub.

:::note

Puedes ver <a href="https://docs.github.com/en/actions/reference/encrypted-secrets">esta guía</a> para aprender sobre los secretos de GitHub.

:::

Una vez que hemos establecido los secretos de GitHub, creamos un flujo de trabajo de publicación de GitHub en `.github/workflows/main.yml`:

```yml
name: 'publish'
on:
  push:
    branches:
      - release

jobs:
  publish-tauri:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v2
        with:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install app dependencies and build it
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ENABLE_CODE_SIGNING: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        with:
          tagName: app-v__VERSION__ # the action automatically replaces \_\_VERSION\_\_ with the app version
          releaseName: 'App v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: verdadero
          elease: falso
```

El flujo de trabajo extrae los secretos de GitHub y los define como variables de entorno antes de construir la aplicación usando la acción Tauri. La salida es una versión de GitHub con la aplicación macOS firmada y notariizada.

[tauri-apps/tauri#592]: https://github.com/tauri-apps/tauri/issues/592
[programa de desarrollo de Apple]: https://developer.apple.com/programs/
[notarizar software macOS antes de la distribución]: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
[contraseña específica de la aplicación]: https://support.apple.com/en-ca/HT204397
[app-specific password]: https://support.apple.com/en-ca/HT204397
[Crear una solicitud de firma de certificado]: https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request
[, ID & Página de perfiles]: https://developer.apple.com/account/resources/certificates/list
[Certificados, IDs & Página de perfiles]: https://developer.apple.com/account/resources/certificates/list
[de acceso y usuarios de la App Store]: https://appstoreconnect.apple.com/access/users
[Tauri]: https://github.com/tauri-apps/tauri-action
