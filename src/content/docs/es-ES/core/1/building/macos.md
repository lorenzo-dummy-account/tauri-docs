---
sidebar_position: 3
---

importar TauriBuild desde './\_tauri-build.md'

# macOS Bundle

Las aplicaciones Tauri para macOS se distribuyen con un paquete de aplicaciones [][] (`. Archivo pp` ) o una imagen de Apple Disk (archivo`.dmg`). El Tauri CLI agrupa automáticamente su código de aplicación en estos formatos, proporcionando opciones para codiseñar y notarializar su aplicación. Tenga en cuenta que `.app` y `.dmg` paquetes sólo pueden **ser creados en macOS** porque la compilación cruzada aún no funciona.

:::note

Las aplicaciones GUI en macOS y Linux no heredan el `$PATH` de tus archivos de puntos del shell (`. ashrc`, `.bash_profile`, `.zshrc`, etc). Mira la caja de Tauri [fix-path-env-rs][] para solucionar este problema.

:::

<TauriBuild />

## Establecer una versión mínima del sistema

La versión mínima del sistema operativo requerida para que una aplicación Tauri ejecute en macOS es `10.13`. Si necesitas soporte para las API macOS más nuevas como `window.print` que solo es compatible con macOS versión `11.` en adelante, puede cambiar la [`tauri.bundle.macOS.minimumSystemVersion`][]. Esto establecerá a su vez la propiedad `Info.plist` [LSMinimumSystemVersion][] y la variable de entorno `MACOSX_DEPLOYMENT_TARGET`.

## Objetivos binarios

Usted puede compilar su aplicación dirigida a Apple Silicon, computadoras Mac basadas en Intelbased o binarios universales de macOS. Por defecto, el CLI construye un binario orientado a la arquitectura de su máquina. Si quieres compilar para un objetivo diferente, primero debes instalar el objetivo de rust faltante ejecutando `rustup target add aarch64-apple-darwin` o `rustup target add x86_64-apple-darwin`, entonces puedes construir tu aplicación usando la bandera `--target`:

- `tauri build --target aarch64-apple-darwin`: apunta a máquinas de silicio de Apple.
- `tauri build --target x86_64-apple-darwin`: destino a máquinas basadas en Intel.
- `tauri build --target universal-apple-darwin`: produce un [binario macOS universal][] que se ejecuta tanto en Apple silicon como en Macs basados en Intel.

Mientras que las máquinas de silicio de Apple pueden ejecutar aplicaciones compiladas para Macs basados en Intel a través de una capa de traducción llamada [Rosetta][], esto conduce a una reducción del rendimiento debido a las traducciones del instructor del procesador. Es práctica común permitir que el usuario elija el destino correcto al descargar la aplicación, pero también puede elegir distribuir un [Binario Universal][universal macos binary]. Los binarios universales incluyen ejecutables de `aarch64` y `x86_64` , dándole la mejor experiencia en ambas arquitecturas. Sin embargo, ten en cuenta que esto aumenta significativamente el tamaño de tu paquete.

## Personalización del paquete de aplicaciones

El archivo de configuración Tauri proporciona las siguientes opciones para personalizar el paquete de la aplicación:

- **Nombre del paquete:** El nombre legible por humanos de tu aplicación. Configurado por la propiedad [`package.productName`][].
- **Versión del paquete:** Versión de tu aplicación. Configurado por la propiedad [`package.version`][].
- **Categoría de aplicación:** La categoría que describe tu aplicación. Configurado por la propiedad [`tauri.bundle.category`][]. Puedes ver una lista de las categorías de macOS [aquí][macos app categories].
- **Copyright:** Una cadena de derechos de autor asociada a tu aplicación. Configurado por la propiedad [`tauri.bundle.copyright`][].
- **Icono del paquete:** El icono de tu aplicación. Utiliza el primer archivo `.icns` listado en el array [`tauri.bundle.icon`][].
- **Versión mínima del sistema:** Configurada por la propiedad [`tauri.bundle.macOS.minimumSystemVersion`][].
- **Archivo de licencia DMG:** Una licencia que se añade al archivo `.dmg`. Configurado por la propiedad [`tauri.bundle.macOS.license`][].
- **[Archivo Entitlements.plist][]:** Los títulos controlan a qué APIs tendrá acceso su aplicación. Configurado por la propiedad [`tauri.bundle.macOS.entitlements`][].
- **Dominio de excepción:** un dominio insecuro al que su aplicación puede acceder como un `local host` o un dominio `http` remoto. Es una configuración de conveniencia alrededor de `NSAppTransportSecurity > NSExceptionDomains` configurando `NSExceptionAllowsInsecureHTTPLoads` y `NSIncludesSubdomains` a verdadero. Vea [`tauri.bundle.macOS.exceptionDomain`][] para más información.

:::info

Estas opciones generan el paquete de la aplicación [archivo Info.plist][]. Puede extender el archivo generado con su propio archivo `Info.plist` almacenado en la carpeta Tauri (`src-tauri` por defecto). El CLI combina ambos archivos `.plist` en producción, y la capa principal lo incrusta en el binario durante el desarrollo.

:::

[1]: https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html

[2]: https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html
[`tauri.bundle.macOS.minimumSystemVersion`]: ../../api/config.md#macconfig.minimumsystemversion
[LSMinimumSystemVersion]: https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion
[binario macOS universal]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[universal macos binary]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[Rosetta]: https://support.apple.com/en-gb/HT211861
[macos app categories]: https://developer.apple.com/app-store/categories/
[`package.productName`]: ../../api/config.md#packageconfig.productname
[`package.version`]: ../../api/config.md#packageconfig.version
[`tauri.bundle.category`]: ../../api/config.md#bundleconfig.category
[`tauri.bundle.copyright`]: ../../api/config.md#bundleconfig.copyright
[`tauri.bundle.icon`]: ../../api/config.md#bundleconfig.icon
[`tauri.bundle.macOS.license`]: ../../api/config.md#bundleconfig.icon
[Archivo Entitlements.plist]: https://developer.apple.com/documentation/bundleresources/entitlements
[`tauri.bundle.macOS.entitlements`]: ../../api/config.md#macconfig.entitlements
[`tauri.bundle.macOS.exceptionDomain`]: ../../api/config.md#macconfig.exceptiondomain
[archivo Info.plist]: https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html
[fix-path-env-rs]: https://github.com/tauri-apps/fix-path-env-rs
