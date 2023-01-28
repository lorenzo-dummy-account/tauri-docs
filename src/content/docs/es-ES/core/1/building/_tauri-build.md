importar comando de '@theme/Command'

# Encabezado temporal para fijar el procesamiento

<!-- The above heading is here because fragments aren't really supported in the context of Astro Content Collections -->

Para construir y empaquetar su aplicación Tauri en un solo ejecutable, simplemente ejecute el siguiente comando:

<Command name="build" />

Construirá su frontend (si está configurado, vea [`beforeBuildCommand`][beforebuildcommand]), compile el binario de Rust, recopilar todos los binarios y recursos externos y finalmente producir paquetes e instaladores específicos de la plataforma.

[beforebuildcommand]: ../../api/config.md#buildconfig.beforebuildcommand
