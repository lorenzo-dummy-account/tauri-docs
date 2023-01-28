---
sidebar_position: 1
---

importar comando de '@theme/Command'

# Publicación de App

### 1. Crea tu aplicación web

Ahora que está listo para empaquetar su proyecto, necesita ejecutar el comando de compilación del framework o del bundler (suponiendo que esté usando uno, por supuesto).

:::note

Cada framework tiene sus herramientas de publicación. Queda fuera del ámbito de este documento tratarlos todos o mantenerlos actualizados.

:::

### 2. Agrupar tu aplicación con Tauri

<Command name="build" />

Este comando incrusta sus activos web en un solo binario con su código de Rust. El binario mismo se ubicará en `src-tauri/target/release/[app name]`, y los instaladores estarán ubicados en `src-tauri/target/release/bundle/`.

Al igual que el comando `tauri dev` , la primera vez que ejecutas esto, tarda algo de tiempo en recoger las cajas de Rust y construir todo - pero en ejecuciones posteriores, solo necesita reconstruir el código de tu aplicación, que es mucho más rápido.
