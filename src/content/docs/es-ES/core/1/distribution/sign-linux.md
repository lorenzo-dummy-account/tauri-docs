---
sidebar_label: Firma de código Linux
sidebar_position: 3
---

# Código firmando paquetes de Linux

Esta guía proporciona información sobre la firma de código para los paquetes Linux.

## Requisitos

- gpg o gpg2

Debe prepararse una clave para firmar. Se puede generar una nueva utilizando:

```shell
gpg2 --full-gen-key
```

Consulte la documentación gpg o gpg2 para obtener información adicional. Debería tener cuidado adicional para hacer una copia de seguridad de sus claves privadas y públicas en una ubicación segura.

## Firmar para AppImages

Puede incrustar una firma en la AppImage configurando las siguientes variables de entorno:

- **SIGN**: establezca en `1` para firmar la AppImage.
- **SIGN_KEY**: variable opcional para usar un ID de clave GPG específico para firmar.
- **APPIMAGETOOL_SIGN_PASSPHRASE**: la contraseña de la clave firmada. Si no se activa, gpg muestra un diálogo para poder introducirlo. Debe establecer esto cuando ejecute tareas automatizadas.

Puede mostrar la firma incrustada en la AppImage ejecutando el siguiente comando:

```shell
./src-tauri/target/release/bundle/appimage/$APPNAME_$VERSION_amd64.AppImage --appimage-signature
```

Ten en cuenta que necesitas cambiar los valores $APPNAME y $VERSION con los correctos basados en tu configuración.

:::caution La firma no está verificada

AppImage no valida la firma, por lo que no puede confiar en ella para comprobar si el archivo ha sido manipulado o no. Para validar la firma, debe proporcionar una herramienta externa para sus usuarios. Consulte [la documentación oficial de la AppImage][] para obtener información adicional.

:::

[la documentación oficial de la AppImage]: https://docs.appimage.org/packaging-guide/optional/signatures.html
