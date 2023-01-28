---
sidebar_position: 2
---

importar comando de '@theme/Command'

# Ciclo de Desarrollo

### 1. Iniciar tu servidor Dev

Ahora que tienes todo configurado, deberías iniciar tu servidor de desarrollo de aplicaciones proporcionado por tu framework o bundler de interfaz de usuario (asumiendo que estás usando uno, por supuesto).

:::note

Cada marco tiene sus propias herramientas de desarrollo. Está fuera del alcance de este documento para cubrirlos todos o mantenerse actualizados.
:::

### 2. Iniciar Ventana de Desarrollo de Tauri

<Command name="dev" />

La primera vez que ejecutas este comando, el gestor de paquetes Rust tarda varios minutos en descargar y construir todos los paquetes necesarios. Dado que se almacenan en caché, las versiones posteriores son mucho más rápidas, ya que solo tu código necesita ser reconstruido.

Una vez que Rust ha terminado de construir, la vista web se abre, mostrando tu aplicación web. Puede hacer cambios en su aplicación web, y si su herramienta lo habilita, la vista web se actualizará automáticamente, al igual que un navegador. Cuando haces cambios en tus archivos de Rust, se reconstruyen automáticamente, y tu aplicación se reinicia automáticamente.

:::info Acerca de Cargo.toml y Control de Fuentes

En el repositorio de su proyecto, usted SHOULD compromete el "src-tauri/Cargo.lock" junto con el "src-tauri/Cargo.toml" a git porque Cargo utiliza el archivo de bloqueo para proporcionar compilaciones deterministas. Como resultado, se recomienda que todas las aplicaciones verifiquen en su Cargo.lock. Usted SHOULD NO compromete la carpeta "src-tauri/target" o cualquiera de sus contenidos.

:::
