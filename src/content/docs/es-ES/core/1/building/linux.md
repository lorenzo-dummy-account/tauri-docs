---
sidebar_position: 4
---

importar TauriBuild desde './\_tauri-build.md'

# Paquete Linux

## Limitaciones

Las bibliotecas centrales como glibc frecuentemente rompen la compatibilidad con sistemas antiguos. Por esta razón, usted debe construir su aplicación Tauri usando el sistema base más antiguo que usted tiene la intención de soportar. Un sistema relativamente antiguo como Ubuntu 18.04 es más adecuado que Ubuntu 22.04, como el binario compilado en Ubuntu 22. 4 tendrá un mayor requerimiento de la versión glibc, así que cuando se ejecute en un sistema antiguo, se enfrentará a un error de tiempo de ejecución como `/usr/lib/libc. o.6: versión 'GLIBC_2.33' no encontrada`. Recomendamos usar un contenedor Docker o GitHub Actions para construir su aplicación Tauri para Linux.

Vea los problemas [tauri-apps/tauri#1355][] y [rust-lang/rust#57497][], además de la [guía AppImage][] para más información.

## Debian

Tauri permite que su aplicación sea empaquetada como un archivo `.deb` (paquete Debian). El CLI de Tauri incluye el binario de la aplicación y recursos adicionales en este formato si se construye en Linux. Tenga en cuenta que `.deb` paquetes sólo pueden **ser creados en Linux** porque la compilación cruzada aún no funciona.

El paquete Debian generado por el bundler Tauri tiene todo lo necesario para enviar su aplicación a distribuciones Linux basadas en Debian, definiendo los iconos de su aplicación, generando un archivo de escritorio y especificando las dependencias `libwebkit2gtk-4. -37` y `libgtk-3-0`, junto con `libappindicator3-1` si su aplicación utiliza la bandeja del sistema.

:::note
Las aplicaciones GUI en macOS y Linux no heredan el `$PATH` de tus archivos de puntos del shell (`. ashrc`, `.bash_profile`, `.zshrc`, etc). Mira la caja de Tauri [fix-path-env-rs](https://github.com/tauri-apps/fix-path-env-rs) para solucionar este problema.
:::

<TauriBuild />

### Archivos personalizados

Tauri expone algunas configuraciones para el paquete Debian en caso de que necesite más control.

Si su aplicación depende de dependencias adicionales del sistema, puede especificarlas en `tauri.conf.json > tauri > paquete > deb > depende`.

Para incluir archivos personalizados en el paquete Debian, puede proporcionar una lista de archivos o carpetas en `tauri. onf.json > tauri > paquete > deb > archivos`. El objeto de configuración mapea la ruta en el paquete Debian a la ruta del archivo en su sistema de archivos, relativa a la `tauri. archivo onf.json`. Aquí hay un ejemplo de configuración:

```json
{
  "tauri": {
    "bundle": {
      "deb": {
        "files": {
          "/usr/share/README. d": "../README.md", // copia el archivo README.md a /usr/share/README. d
          "usr/share/assets": ".. assets/" // copia todo el directorio de activos a /usr/share/assets
        }
      }
    }
  }
}
```

Si necesitas empaquetar archivos de una manera multiplataforma, revisa los mecanismos [recursos][] y [sidecar][] de Tauri.

## AppImage

AppImage es un formato de distribución que no se basa en los paquetes instalados del sistema y, en su lugar, agrupa todas las dependencias y archivos necesarios por la aplicación. Por esta razón, el archivo de salida es más grande pero más fácil de distribuir, ya que es soportado en muchas distribuciones de Linux y puede ser ejecutado sin instalación. El usuario solo necesita hacer el archivo ejecutable (`chmod a+x MyProject. ppImage`) y luego puede ejecutarlo (`./MyProject.AppImage`).

AppImages es conveniente, simplificando el proceso de distribución si no puede hacer un paquete dirigido al gestor de paquetes de la distribución. Aún así, debe usarlo cuidadosamente a medida que el tamaño del archivo crece desde el rango de 2-6MB hasta 70+MBs.

:::precaución

Si su aplicación reproduce audio/video necesita habilitar `tauri.conf.json > tauri > paquete > imagen de aplicación > bundleMediaFramework`. Esto aumentará el tamaño del paquete AppImage para incluir archivos `gstreamer` necesarios para la reproducción multimedia. Esta bandera es actualmente sólo compatible con sistemas de construcción de Ubuntu.

:::

[recursos]: resources.md
[sidecar]: sidecar.md
[tauri-apps/tauri#1355]: https://github.com/tauri-apps/tauri/issues/1355
[rust-lang/rust#57497]: https://github.com/rust-lang/rust/issues/57497
[guía AppImage]: https://docs.appimage.org/reference/best-practices.html#binaries-compiled-on-old-enough-base-system
