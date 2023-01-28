---
sidebar_position: 1
title: Introducción
---

:::caution actualmente en pre-alpha
El soporte de Webdriver para Tauri todavía está en pre-alpha. La herramienta que está dedicada a ella, como [tauri-driver][], todavía está en desarrollo activo y puede cambiar según sea necesario con el tiempo. Además, sólo Windows y Linux están soportados actualmente.
:::

[WebDriver][] es una interfaz estandarizada para interactuar con documentos web principalmente destinados a pruebas automatizadas. Tauri soporta la interfaz [WebDriver][] apalancando el servidor [WebDriver][] de la plataforma nativa bajo un contenedor multiplataforma [`tauri-driver`][].

## Dependencias del sistema

Instale la última [`tauri-driver`][] o actualice una instalación existente ejecutando:

```shell
instalar tauri-conductor de carga
```

Porque actualmente utilizamos el servidor nativo de la plataforma [WebDriver][] , hay algunos requisitos para ejecutar [`tauri-driver`][] en plataformas soportadas. El soporte de plataformas está actualmente limitado a Linux y Windows.

### Linux

Utilizamos `WebKitWebDriver` en plataformas Linux. Compruebe si este binario ya existe (comando `que WebKitWebDriver`) como algunas distribuciones lo unen con el paquete WebKit normal. Otras plataformas pueden tener un paquete separado para ellas, como como `webkit2gtk-driver` en distribuciones basadas en Debian.

### Ventanas

Asegúrate de tomar la versión de [Microsoft Edge Driver][] que coincida con la versión de Windows Edge en la que la aplicación está siendo construida y probada. Esta debería ser casi siempre la última versión estable en las instalaciones actualizadas de Windows. Si las dos versiones no coinciden, puede experimentar su suite de pruebas WebDriver colgando mientras intenta conectarse.

La descarga contiene un binario llamado `msedgedriver.exe`. [`tauri-driver`][] busca ese binario en el `$PATH` así que asegúrese de que está disponible en la ruta o utilice la opción `--native-driver` en [`tauri-driver`][]. Puede descargar esto automáticamente como parte del proceso de configuración CI para asegurar el borde, y versiones de Edge Driver permanecen sincronizadas en máquinas Windows CI. Una guía sobre cómo hacer esto puede ser añadida en una fecha posterior.

## Aplicación de ejemplo

La [siguiente sección](example/setup) de la guía muestra paso a paso cómo crear una aplicación de ejemplo mínima que se prueba con WebDriver.

Si prefiere ver el resultado de la guía y mirar sobre una base mínima terminada que la utiliza, puedes ver https://github. om/chippers/hola_tauri. Ese ejemplo también viene con un script CI para probar con acciones de GitHub . pero todavía puede estar interesado en la guía de [WebDriver CI](ci) ya que explica el concepto un poco más.

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[tauri-driver]: https://crates.io/crates/tauri-driver
[Microsoft Edge Driver]: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
