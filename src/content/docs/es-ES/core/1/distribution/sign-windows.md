---
sidebar_label: Firma de código de Windows
sidebar_position: 2
---

# Windows - Guía de firma de código localmente & con acciones de GitHub

## Introducción

El código de firma de tu aplicación permite a los usuarios saber que han descargado el ejecutable oficial de tu aplicación y no algún malware de terceros que plantea como tu aplicación. Aunque no es necesario, mejora la confianza de los usuarios en tu aplicación.

## Prerrequisitos

- Windows - probablemente puede usar otras plataformas, pero este tutorial utiliza características nativas de Powershell.
- Una aplicación Tauri en funcionamiento
- Certificado de firma de código - puede adquirir uno de estos en los servicios listados en [documentos de Microsoft][]. Es probable que haya autoridades adicionales para los certificados que no estén incluidos en esa lista, por favor compártelos usted mismo y escoja uno bajo su propio riesgo.
  - Por favor, asegúrese de obtener un **código firmando el certificado** , los certificados SSL no funcionan!

Esta guía asume que usted tiene un código estándar certificado de firma> Si usted tiene un certificado EV, que generalmente involucra un token de hardware, por favor siga la documentación de su emisor en su lugar.

:::note

Si firma la aplicación con un certificado EV, recibirá una reputación inmediata con Microsoft SmartScreen y no mostrará ninguna advertencia a los usuarios.

Si opta por un certificado OV, que generalmente es más barato y está disponible para las personas, Microsoft SmartScreen seguirá mostrando una advertencia a los usuarios cuando descarguen la aplicación. Puede tomar algún tiempo hasta que su certificado construya suficiente reputación. Puede optar por [enviar su aplicación][] a Microsoft para su revisión manual. Aunque no está garantizado, si la aplicación no contiene ningún código malicioso, Microsoft puede conceder reputación adicional y potencialmente eliminar la advertencia para ese archivo de carga específico.

:::

## Comenzando

Hay algunas cosas que tenemos que hacer para que Windows esté preparado para firmar código. Esto incluye convertir nuestro certificado a un formato específico, instalar este certificado y decodificar la información requerida del certificado.

### A. Convierte tu `.cer` a `.pfx`

1. Necesitarás lo siguiente:

   - archivo de certificado (la mina es `cert.cer`)
   - archivo de clave privada (el mío es `private-key.key`)

2. Abra un indicador de comandos y cambie al directorio actual usando `cd Documents/Certs`

3. Convierte tu `.cer` a un `.pfx` usando `openssl pkcs12 -export -in cert.cer -inkey private-key.key -out certificate.pfx`

4. Se le debe pedir que introduzca una contraseña de exportación **¡NO LA INFORMÁNDA!**

### B. Importa tu archivo `.pfx` en el almacén de claves.

Ahora necesitamos importar nuestro archivo `.pfx`.

1. Asigne su contraseña de exportación a una variable usando `$WINDOWS_PFX_PASSWORD = 'MYPASSWORD'`

2. Ahora importa el certificado usando `Import-PfxCertificate -FilePath Certs/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_PFX_PASSWORD -Force -AsPlainText)`

### C. Preparar variables

1. Necesitamos la impresión SHA-1 del certificado; puedes obtenerla usando `openssl pkcs12 -info -in certificate.pfx` y buscar abajo

```
Atributos Bag
    localKeyID: A1 B1 A2 B2 A3 B3 A4 B4 A5 B5 A6 B6 A7 B7 A8 B8 A9 B9 A0 B0
```

2. Capturará el `localKeyID` pero sin espacios, en este ejemplo, sería `A1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0`. Este es nuestro `certificado Thumbprint`.

3. Necesitamos el algoritmo de resumen de SHA utilizado para tu certificado (Hugerencia: es probable que sea `sha256`

4. También necesitamos una URL de marca de tiempo; este es un servidor de tiempo utilizado para verificar la hora de la firma del certificado. Estoy usando `http://timestamp.comodoca.com`, pero cualquiera de los que obtuviste tu certificado también tiene uno.

## Prepara el archivo `tauri.conf.json`

1. Ahora que tenemos nuestra `certificateThumbprint`, `digestAlgorithm`, & `timestampUrl` abriremos el `tauri. onf.json`.

2. En el `tauri.conf.json` buscará el `tauri` -> `paquete` -> `ventanas` sección. Verás, hay tres variables para la información que hemos capturado. Llénalo como abajo.

```json tauri.conf.json
"windows": {
        "certificateThumbprint": "A1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com"
}
```

3. Guardar y ejecutar `yarn | yarn build`

4. En la salida de la consola, debería ver la siguiente salida.

```
info: firmar aplicación
info: ejecutar signtool "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041. \\x64\\signtool.exe"
info: "Done Agding additional Store\r\nSuccessfully signed: APPLICATION FILE PATH HERE
```

Lo que muestra que has firmado con éxito el `.exe`.

¡Y eso es todo! Has firmado correctamente tu archivo .exe.

## BONUS: Firma tu aplicación con Acciones de GitHub.

También podemos crear un flujo de trabajo para firmar la aplicación con acciones de GitHub.

### GitHub Secrets

Necesitamos añadir algunos secretos de GitHub para la configuración correcta de la acción de GitHub. Estos pueden ser nombrados como quieras.

- Puede ver la guía de [secretos cifrados][] sobre cómo agregar secretos de GitHub.

Los secretos que utilizamos son los siguientes

|    GitHub Secrets    |                                                            Valor de variable                                                             |
|:--------------------:|:----------------------------------------------------------------------------------------------------------------------------------------:|
|     CERTIFICATE      | Versión codificada en Base64 de su certificado .pfx, puede hacerse usando este comando `certutil -encode certificate.pfx base64cert.txt` |
| CERTIFICATE_PASSWORD |                                 Certificar contraseña de exportación usada al crear el certificado .pfx                                  |

### Modificaciones de flujo de trabajo

1. Tenemos que añadir un paso en el flujo de trabajo para importar el certificado en el entorno Windows. Este flujo de trabajo completa lo siguiente

   1. Asignar secretos de GitHub a variables de entorno
   2. Crear un nuevo directorio `de certificados`
   3. Importar `WINDOWS_CERTIFICATE` en tempCert.txt
   4. Use `certutil` para decodificar el tempCert.txt de base64 en un archivo `.pfx`.
   5. Eliminar tempCert.txt
   6. Importar el `. fx` archivo en la tienda Cert de Windows & convierte el `WINDOWS_CERTIFICATE_PASSWORD` a una cadena segura para ser usada en el comando de importación.

2. Utilizaremos la [`tauri-action` publicar plantilla][].

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
        platform: [macos-latest, ubuntu-más tarde, windows-latest]

    runs-on: ${{ matrix.platform }}
    pasos:
      - usos: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v1
        with:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install webkit2gtk (ubuntu only)
        if: matrix. latform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-4.
      - nombre: instalar dependencias de aplicaciones y construirlas
        run: yarn && yarn build
      - usos: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        con:
          tagName: app-v__VERSION__ # la acción reemplaza automáticamente \_\_VERSION\_\_ con la versión de la aplicación
          releaseName: 'App v__VERSION__'
          releaseBody: 'Ver los activos para descargar esta versión e instalar.'
          releaseDraft: verdadero
          elease: falso
```

3. Justo por encima de `-name: instalar dependencias de aplicaciones y construirlas` querrás añadir el siguiente paso

```yml
- nombre: importar certificado de windows
  si: matrix. latform == 'windows-latest'
  env:
    WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
    WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  run: |
    New-Item -ItemType directory -Path certificate
    Set-Content -Path certificate/tempCert. xt -Valor $env:WINDOWS_CERTIFICATE
    certutil -decode certificate/tempCert.txt certificate/certificate.pfx
    Remove-Item -certificado de ruta -include tempCert. xt
    CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String -String $env:WINDOWS_CERTIFICATE_PASSWORD -Force -AsPlainText)
```

4. Guarda y envía un mensaje a tu repo.

5. Su flujo de trabajo ahora puede importar su certificado de Windows e importarlo al runner de GitHub, ¡permitiendo la firma automática de código!

[documentos de Microsoft]: https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-cert-manage
[enviar su aplicación]: https://www.microsoft.com/en-us/wdsi/filesubmission/
[secretos cifrados]: https://docs.github.com/en/actions/reference/encrypted-secrets
[`tauri-action` publicar plantilla]: https://github.com/tauri-apps/tauri-action
