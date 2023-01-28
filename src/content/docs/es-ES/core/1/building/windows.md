---
sidebar_position: 2
---

importar comando de '@theme/Command'

# Instalador de Windows

Las aplicaciones Tauri para Windows se distribuyen como Microsoft Installers (`.msi` files). El Tauri CLI agrupa su aplicación binaria y recursos adicionales. Tenga en cuenta que `.msi` instaladores sólo pueden **ser creados en Windows** porque la compilación cruzada aún no funciona. Esta guía proporciona información sobre las opciones de personalización disponibles para el instalador.

Para construir y empaquetar su aplicación Tauri en un solo ejecutable, simplemente ejecute el siguiente comando:

<Command name="build" shell="powershell"/>

Construirá tu Frontend, compilará el binario de Rust y recogerá todos los binarios y recursos externos y finalmente producirá paquetes e instaladores específicos de la plataforma.

## Construcción de 32 bits o ARM

El CLI de Tauri compila su ejecutable usando la arquitectura de su máquina de forma predeterminada. Suponiendo que se está desarrollando en una máquina de 64 bits, la CLI producirá aplicaciones de 64 bits.

Si necesita soportar máquinas de **32-bit** , puedes compilar tu aplicación con un **diferente** [Rust target][platform support] usando el parámetro `--target`:

```powershell
tauri build --target i686-pc-windows-msvc
```

De forma predeterminada, Rust sólo instala toolchains para el objetivo de su máquina, así que primero necesita instalar la toolchain de Windows de 32 bits: `rustup target add i686-pc-windows-msvc`.

Si necesita compilar para **ARM64** primero necesita instalar herramientas de compilación adicionales. Para ello, abra `Visual Studio Installer`, haga clic en "Modificar" y en la pestaña "Componentes Individuales" instale las herramientas de construcción "C++ ARM64". En el momento de escribir el nombre exacto en VS2022 es `MSVC v143 - VS 2022 C++ herramientas de construcción ARM64 (Último)`.  
Ahora puede añadir el objetivo de rust con `rustup add aarch64-pc-windows-msvc` y luego utilizar el método mencionado anteriormente para compilar su aplicación:

```powershell
tauri build --target aarc64-pc-windows-msvc
```

## Soportando Windows 7

Por defecto, el instalador de Microsoft no funciona en Windows 7 porque necesita descargar el bootstrapper de Webview2 si no está instalado (que podría fallar si TLS 1. no está activado en el sistema operativo). Tauri incluye una opción para incrustar el Bootstrapper de Webview2 (ver la sección [Incrustar la Bootstrapper de Webview2](#embedded-bootstrapper) a continuación).

Además, para utilizar la API de notificación en Windows 7, necesita habilitar la función `windows7-compat` Cargo:

```toml title="Cargo.toml"
[dependencies]
tauri = { version = "1", features = [ "windows7-compat" ] }
```

## Opciones de instalación de Webview2

El instalador de Windows por defecto descarga el bootstrapper de Webview2 y lo ejecuta si el tiempo de ejecución no está instalado. Alternativamente, puede incrustar el Bootstrapper, incrustar el instalador offline, o usar una versión fija en tiempo de ejecución de Webview2. Vea la siguiente tabla para una comparación entre estos métodos:

| Método de instalación                                | ¿Necesita conexión a Internet? | Tamaño adicional del instalador | Notas                                                                                                                                        |
|:---------------------------------------------------- |:------------------------------ |:------------------------------- |:-------------------------------------------------------------------------------------------------------------------------------------------- |
| [`descargar Bootstrapper`](#downloaded-bootstrapper) | Sí                             | 0 MB                            | `Predeterminado` <br /> Resultados en un tamaño más pequeño del instalador, pero no se recomienda para la implementación de Windows 7. |
| [`embedBootstrapper`](#embedded-bootstrapper)        | Sí                             | ~1,8MB                          | Mejor soporte para Windows 7.                                                                                                                |
| [`instalador sin conexión`](#offline-installer)      | Nu                             | ~127MB                          | Incorpora el instalador Webview2. Recomendado para entornos sin conexión                                                                     |
| [`versión fija`](#fixed-version)                     | Nu                             | ~180MB                          | Incorpora una versión fija de Webview2                                                                                                       |
| [`saltar`](#skipping-installation)                   | Nu                             | 0 MB                            | ⚠️ No recomendado <br /> No instala Webview2 como parte del instalador de Windows.                                                     |

:::info

En Windows 10 (versión de abril de 2018 o posterior) y Windows 11, el tiempo de ejecución de Webview2 se distribuye como parte del sistema operativo.

:::

### Bootstrapper descargado

Esta es la configuración predeterminada para construir el instalador de Windows. Descargue el bootstrapper y ejecutarlo. Requiere conexión a internet pero da como resultado un menor tamaño del instalador. Esto no se recomienda si va a distribuir a Windows 7.

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "downloadBootstrapper"
        }
      }
    }
  }
}
```

### Embedded Bootstrapper

Para incrustar el Bootstrapper de Webview2, configure el [webviewInstallMode][] a `embedBootstrapper`. Esto aumenta el tamaño del instalador en alrededor de 1.8MB, pero aumenta la compatibilidad con sistemas Windows 7.

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "embedBootstrapper"
        }
      }
    }
  }
}
```

### Instalador sin conexión

Para incrustar el Bootstrapper de Webview2, configure el [webviewInstallMode][] a `offlineInstaller`. Esto aumenta el tamaño del instalador en alrededor de 127MB, pero permite que su aplicación se instale incluso si no hay conexión a Internet.

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "offlineInstaller"
        }
      }
    }
  }
}
```

### Versión fija

Usar el tiempo de ejecución proporcionado por el sistema es ideal para la seguridad, ya que los parches de vulnerabilidad de la vista web son administrados por Windows. Si desea controlar la distribución Webview2 en cada una de sus aplicaciones (bien para gestionar los parches de liberación o bien para distribuir aplicaciones en entornos donde una conexión a Internet puede no estar disponible) Tauri puede empaquetar los archivos de tiempo de ejecución para usted.

:::caution
Distribuir una versión fija de Webview2 Runtime incrementa el instalador de Windows en alrededor de 180MB.
:::

1. Descargue el tiempo de ejecución de la versión fija de Webview2 desde el sitio web de [Microsoft][download-webview2-runtime]. En este ejemplo, el nombre del archivo descargado es `Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab`
2. Extraer el archivo a la carpeta principal:

```powershell
Expandir .\Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab -F:* ./src-tauri
```

3. Configurar la ruta de ejecución de Webview2 en `tauri.conf.json`:

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "fixedRuntime",
          "ruta": ". Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50. 64/"
        }
      }
    }
  }
}
```

4. Ejecute `tauri build` para producir el instalador de Windows con el tiempo de ejecución de Webview2 fijo.

### Omitiendo instalación

Puede eliminar la comprobación de ejecución de Webview2 del instalador configurando [webviewInstallMode][] en `saltar`. Su aplicación NO funcionará si el usuario no tiene el tiempo de ejecución instalado.

:::warning
Tu aplicación NO funcionará si el usuario no tiene el tiempo de ejecución instalado y no intentará instalarlo.
:::

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "skip"
        }
      }
    }
  }
}
```

## Personalizar el instalador

El paquete Installer de Windows se construye utilizando la [herramienta WiX v3][]. Actualmente, puede cambiarlo utilizando un código fuente WiX personalizado (un archivo XML con un `. xs` extensión de archivo) o a través de fragmentos WiX.

### Reemplazar el código de instalación con un archivo WiX personalizado

El Windows Installer XML definido por Tauri está configurado para funcionar para el caso de uso común de aplicaciones simples basadas en webview (puede encontrarlo [aquí][default wix template]). Utiliza [handlebars][] para que el Tauri CLI pueda marcar su instalador de acuerdo a su definición `tauri.conf.json`. Si necesita un instalador completamente diferente, puede configurar un archivo de plantilla personalizado en [`tauri.bundle.windows.wix.template`][].

### Extendiendo el instalador con fragmentos WiX

Un fragmento de [WiX][] es un contenedor donde puedes configurar casi todo lo que ofrece WiX. En este ejemplo, definiremos un fragmento que escribe dos entradas de registro:

```xml
<?xml version="1. " encoding="utf-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Fragment>
    <! - estas entradas de registro deben ser instaladas
         en la máquina del usuario objetivo -->
    <DirectoryRef Id="TARGETDIR">
      <! - agrupa las entradas del registro a ser instaladas -->
      <! - Tenga en cuenta el único `Id` que proporcionamos aquí -->
      <Component Id="MyFragmentRegistryEntries" Guid="*">
        <! - La clave de registro estará bajo
             HKEY_CURRENT_USER\Software\MyCompany\MyApplicationName -->
        <! - Tauri utiliza la segunda porción del identificador del paquete
             como el nombre `MyCompany`
             (e. . `tauri-apps` en `com.tauri-apps. est`) -->
        <RegistryKey
          Root="HKCU"
          Key="Software\MyCompany\MyApplicationName"
          Action="createAndRemoveOnUninstall"
        >
          <! - valores a persistir en el registro -->
          <RegistryValue
            Type="integer"
            Name="SomeIntegerValue"
            Value="1"
            KeyPath="yes"
          />
          <RegistryValue Type="string" Value="Default Value" />
        </RegistryKey>
9
      </Component>
    </DirectoryRef>
  </Fragment>
</Wix>
```

<!-- Would be good to include here WHERE we recommend to save it -->

Guardar el archivo de fragmento con la extensión `.wxs` en algún lugar de su proyecto y referenciarlo en `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "fragmentPaths": [". ruta/a/registro. xs"],
          "componentRefs": ["MyFragmentRegistryEntries"]
        }
      }
    }
  }
}
```

Ten en cuenta que `ComponentGroup`, `Componente`, `FeatureGroup`, `Función` y `Fusionar ids de elemento` deben estar referenciados en el `wix` objeto de `tauri. onf.json` en el `componentGroupRefs`, `componentRefs`, `featureGroupRefs`, `featureRefs` y `mergeRefs` respectivamente para ser incluido en el instalador.

## Internacionalización

El instalador de Windows se construye utilizando el idioma `es-US` por defecto. La internacionalización (i18n) puede configurarse utilizando la propiedad [`tauri.bundle.windows.wix.language`][] , definiendo los idiomas que Tauri debería construir un instalador en su lugar. Puede encontrar los nombres de idioma a utilizar en la columna Cultura Idioma en [sitio web de Microsoft][localizing the error and actiontext tables].

### Compilar un instalador para un único idioma

Para crear un único instalador dirigido a un idioma específico, establezca el valor del idioma `` a una cadena:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": "fr-FR"
        }
      }
    }
  }
}
```

### Compilar un instalador para cada idioma en una lista

Para compilar un instalador apuntando a una lista de idiomas, utilice una matriz. Se creará un instalador específico para cada idioma, con la clave de idioma como sufijo :

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": ["en-US", "pt-BR", "fr-FR"]
        }
      }
    }
  }
}
```

### Configurar el instalador para cada idioma

Un objeto de configuración puede definirse para cada idioma para configurar las cadenas de localización:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": {
            "en-US": null,
            "pt-BR": {
              "localePath": ". wix/locales/pt-BR. xl"
            }
          }
        }
      }
    }
  }
}
```

La propiedad `localePath` define la ruta a un archivo de idioma, un XML configurando la cultura del idioma:

```xml
<WixLocalization
  Culture="en-US"
  xmlns="http://schemas.microsoft.com/wix/2006/localization"
>
  <String Id="LaunchApp"> Iniciar MyApplicationName </String>
  <String Id="DowngradeErrorMessage">
    Una nueva versión de MyApplicationName ya está instalada.
  </String>
  <String Id="PathEnvVarFeature">
    Añadir la ubicación de instalación del ejecutable MyApplicationName a
    la variable de entorno del sistema PATH. Esto permite que
    el ejecutable MyApplicationName sea llamado desde cualquier ubicación.
  </String>
  <String Id="InstallAppFeature">
    Instala MyApplicationName.
  </String>
</WixLocalization>
```

:::note
El campo `WixLocalization` `Cultura` debe coincidir con el idioma configurado.
:::

Actualmente, Tauri hace referencia a las siguientes cadenas regionales: `LaunchApp`, `DowngradeErrorMessage`, `PathEnvVarFeature` y `InstallAppFeature`. Puede definir sus propias cadenas y referenciarlas en su plantilla o fragmentos personalizados con `"!(loc.TheStringId)"`. Consulte la [documentación de localización de WiX][] para obtener más información.

[platform support]: https://doc.rust-lang.org/nightly/rustc/platform-support.html
[webviewInstallMode]: ../../api/config.md#webviewinstallmode
[download-webview2-runtime]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section
[herramienta WiX v3]: https://wixtoolset.org/documentation/manual/v3/
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[handlebars]: https://docs.rs/handlebars/latest/handlebars/
[`tauri.bundle.windows.wix.template`]: ../../api/config.md#wixconfig.template
[WiX]: https://wixtoolset.org/documentation/manual/v3/xsd/wix/fragment.html
[`tauri.bundle.windows.wix.language`]: ../../api/config.md#wixconfig.language
[documentación de localización de WiX]: https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/make_installer_localizable.html
[localizing the error and actiontext tables]: https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables
