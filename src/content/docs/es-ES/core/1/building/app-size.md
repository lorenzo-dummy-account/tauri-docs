---
sidebar_position: 6
---

# Reducir tamaño de aplicación

Con Tauri, estamos trabajando para reducir la huella ambiental de las aplicaciones utilizando menos recursos del sistema cuando estén disponibles, proporcionando sistemas compilados que no necesitan una evaluación de tiempo de ejecución, y ofreciendo guías para que los ingenieros puedan ser aún más pequeños sin sacrificar el rendimiento o la seguridad. Ahorrando recursos, estamos haciendo nuestra parte para ayudarnos a salvar el planeta, que es el único resultado que las empresas del siglo XXI deberían preocupar.

Así que si estás interesado en aprender cómo mejorar el tamaño y el rendimiento de tu aplicación, ¡sigue leyendo!

### No puedes mejorar lo que no puedes medir

¡Antes de poder optimizar tu aplicación, necesitas averiguar qué ocupa espacio en tu aplicación! Aquí hay un par de herramientas que pueden ayudarte con eso:

- **`carga hinchada`** - Una utilidad de óxido para determinar lo que ocupa más espacio en tu aplicación. Te da una excelente y ordenada visión general de las funciones de Rust más significativas.

- **`carga expandir`** - [Macros][] hacen que tu código de robusto sea más conciso y fácil de leer, ¡pero también son trampas ocultas! Usa [`cargo-expanda`][cargo-expand] para ver lo que esas macros generan bajo el capó.

- **`rollup-plugin-visualizer`** - Una herramienta que genera gráficos hermosos (y poderosos) a partir de su paquete rollup. Muy conveniente para averiguar qué dependencias JavaScript contribuyen a su tamaño final del paquete la mayoría.

- **`rollup-plugin-graph`** - Has notado una dependencia incluida en tu paquete final de frontendt, pero no estás seguro por qué? [`rollup-plugin-graph`][rollup-plugin-graph] genera visualizaciones compatibles con Graphviz de todo su gráfico de dependencias.

Estas son sólo un par de herramientas que puede utilizar. ¡Asegúrate de revisar la lista de complementos de tu frontend para más!

## Checklist

1. [Minimizar Javascript](#minify-javascript)
2. [Optimizar dependencias](#optimize-dependencies)
3. [Optimizar imágenes](#optimize-images)
4. [Eliminar fuentes personalizadas innecesarias](#remove-unnecessary-custom-fonts)
5. [Configuración de lista](#allowlist-config)
6. [Optimizaciones de tiempo de construcción](#rust-build-time-optimizations)
7. [Rayo](#stripping)
8. [UPX](#upx)

### Minimizar JavaScript

JavaScript forma una gran parte de una aplicación típica de Tauri, por lo que es importante hacer que el JavaScript sea lo más ligero posible.

Puede elegir entre una gran cantidad de paquetes de JavaScript. Las opciones populares son [Vite][], [webpack][]y [rollup][]. Todos ellos pueden producir JavaScript minificado si está configurado correctamente, así que consulte su documentación de bundler para obtener opciones específicas. En términos generales, debes asegurarte de:

#### Activar sacudido de árbol

Esta opción elimina JavaScript no utilizado de su paquete. Todos los bundlers populares lo activan por defecto.

#### Activar minificación

La minimización elimina espacios en blanco innecesarios, acorta los nombres de las variables y aplica otras optimizaciones. La mayoría de los bundlers habilitan esto por defecto; una excepción notable es [rollup][], donde necesita plugins como [rollup-plugin-terser][] o [rollup-plugin-uglify][].

Nota: Puede utilizar minificadores como [terser][] y [esbuild][] como herramientas independientes.

#### Desactivar mapas de origen

Los mapas de fuentes proporcionan una agradable experiencia de desarrollador al trabajar con idiomas que compilan a JavaScript, como [TypeScript][]. Como los mapas de origen tienden a ser bastante grandes, debes desactivarlos cuando se construya para producción. No tienen ningún beneficio para el usuario final, por lo que es realmente un peso muerto.

### Optimizar dependencias

Muchas bibliotecas populares tienen alternativas más pequeñas y rápidas entre las que puede elegir.

La mayoría de las bibliotecas que usas dependen de muchas bibliotecas mismas. por lo que una biblioteca que a primera vista parezca insignificante podría añadir **varios megabytes** de código a tu aplicación.

Puede utilizar [Bundlephobia][] para encontrar el costo de dependencias JavaScript. Inspeccionar el costo de las dependencias de Rust es generalmente más difícil, ya que el compilador hace muchas optimizaciones.

Si encuentras una biblioteca que parece demasiado grande, Google alrededor, es probable que alguien más ya tenía el mismo pensamiento y creó una alternativa. Un buen ejemplo es [Moment.js][] y es [muchas alternativas][you-dont-need-momentjs].

Pero ten en cuenta: **La mejor dependencia no es ninguna dependencia**, lo que significa que siempre deberías preferir las compilaciones de idioma sobre los paquetes de terceros.

### Optimizar imágenes

De acuerdo con el [Http Archive][], las imágenes son el [mayor contribuyente al peso del sitio web][http archive report, image bytes]. Así que si tu aplicación incluye imágenes o iconos, ¡asegúrate de optimizarlos!

Puede elegir entre una variedad de opciones manuales ([GIMP][], [Photoshop][], [Squoosh][]) o plugins para sus herramientas de creación de interfaz favoritas ([vite-imagetools][], [vite-plugin-imagemin][], [image-minimizer-webpack-plugin][]).

Ten en cuenta que la librería `imagemin` la mayor parte del uso de plugins es [oficialmente no mantenida][imagemin is unmaintained].

#### Usar formatos de imagen modernos

Formatos como `webp` o `avif` ofrecen reducciones de tamaño de **hasta 95%** en comparación con jpeg manteniendo una excelente precisión visual. Puede utilizar herramientas como [Squoosh][] para probar diferentes formatos en sus imágenes.

#### Imágenes de tamaño de forma

Nadie aprecia el envío de la imagen en bruto 6K con la aplicación, así que asegúrese de dimensionar la imagen en consecuencia. Las imágenes que aparezcan grandes en la pantalla deben ser mayores que las imágenes que ocupan menos espacio en la pantalla.

#### No usar imágenes contundentes

En un entorno Web, se supone que debe utilizar [Imágenes de respuesta][] para cargar el tamaño de imagen correcto para cada usuario dinámicamente. Dado que no está distribuyendo imágenes dinámicamente a través de la web, el uso de Imágenes Responsivas solo hincha innecesariamente su aplicación con copias redundantes.

#### Eliminar metadatos

Las imágenes que se tomaron directamente de una cámara o del lado de la foto de stock a menudo incluyen metadatos sobre la cámara y el modelo de lente o fotógrafo. No sólo esos bytes desperdiciados, sino que las propiedades de los metadatos también pueden contener información potencialmente sensible como el tiempo, día y ubicación de la foto.

### Eliminar fuentes personalizadas innecesarias

Considere no enviar fuentes personalizadas con su aplicación y confiar en las fuentes del sistema en su lugar. Si debe enviar fuentes personalizadas, asegúrese de que están en formatos modernos y optimizados, como `woff2`.

Las fuentes pueden ser bastante grandes, así que usar las fuentes ya incluidas en el sistema operativo reduce la huella de su aplicación. También evita FOUT (Flash of Unstyled Text) y hace que tu aplicación se sienta más "nativa" ya que utiliza la misma fuente que todas las demás aplicaciones.

Si debe incluir fuentes personalizadas, asegúrese de incluirlos en formatos modernos como `woff2` ya que estos tienden a ser mucho más pequeños que los formatos antiguos.

Utilice la llamada **"Pila de fuente del sistema"** en su CSS. Hay un número de variaciones, pero aquí hay 3 básicos para empezar:

**Sans-Serif**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
  sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

**Serif**

```css
font-family: Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid
    Serif, Tiempos, Fuente Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe
    Símbolo UI;
```

**Monoespaciado**

```css
font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberación
    Mono, monospace;
```

### Configuración de lista

Puedes reducir el tamaño de tu aplicación activando solo las características de la API de Tauri que necesitas en la configuración de `allowlist`.

La configuración de `allowlist` determina qué características API habilitar; las funciones desactivadas **no serán compiladas en tu aplicación**. Esta es una forma fácil de eliminar algo de peso extra.

Un ejemplo de un típico `tauri.conf.json`:

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "writeFile": true
      },
      "shell": {
        "execute": true
      },
      "diálogo": {
        "guardar": true
      }
    }
  }
}
```

### Optimizaciones de tiempo de construcción

Configure su proyecto de carga para aprovechar las características de optimización del tamaño de Rusts. [¿Por qué es grande un ejecutable de oxidación?][] proporciona una excelente explicación de por qué esto es importante y un paseo en profundidad. Al mismo tiempo, [Minimizar Tamaño Binario de Rust][] está más actualizado y tiene un par de recomendaciones adicionales.

Rust es notorioso por producir binarios grandes, pero puede dar instrucciones al compilador para optimizar el tamaño final del ejecutable.

Cargo expone varias opciones que determinan cómo el compilador genera su binario. Las opciones "recomendadas" para aplicaciones Tauri son estas:

```toml
[profile.release]
► = "abort" # Extrae una lógica costosa de limpieza de código
unidades de código = 1 # Compila una tras otra para que el compilador pueda optimizar mejor
lto = true # Habilita el enlace a las optimizaciones
opt-level = "s" # Optimice para el tamaño binario
```

:::note
También hay `nivel de opción = "z"` disponible para reducir el tamaño binario resultante. `"s"` y `"z"` a veces puede ser más pequeño que el otro, ¡así que pruébalo con tu aplicación!

Hemos visto tamaños binarios más pequeños de `"s"` para aplicaciones de ejemplo de Tauri, pero las aplicaciones del mundo real siempre pueden diferir.
:::

Para obtener una explicación detallada de cada opción y un montón más, consulte la sección [Perfiles de libros de Carga][cargo profiles].

#### Desactivar la compresión de activos de Tauri

Por defecto, Tauri utiliza Brotli para comprimir los activos en el binario final. Brotli incorpora una tabla de búsqueda grande (~170KiB) para lograr grandes resultados, pero si los recursos que incrustas son más pequeños que esto o comprimen mal, el binario resultante puede ser mayor que cualquier ahorro.

La compresión se puede desactivar estableciendo `características predeterminadas` a `false` y especificando todo excepto la función `compresión`:

```toml
[dependencies]
tauri = { version = "...", features = ["objc-exception", "wry"], default-features = false }
```

#### Características inestables de compresión de oxidación

:::caution
Las siguientes sugerencias son todas características inestables y requieren una cadena de herramientas nocturna. Consulte la documentación de [Características inestables][cargo unstable features] para obtener más información sobre lo que esto significa.
:::

Los siguientes métodos implican el uso de características inestables del compilador y requieren la herramienta rust nightly toolchain. Si no tienes el componente nightly toolchain + `rust -src` nightly added, prueba lo siguiente:

```shell
rustup toolchain instalar nightly
componente rustup add rust-src --toolchain nightly
```

La Biblioteca Rust Standard viene precompilada. Esto significa que Rust es más rápido de instalar, pero también que el compilador no puede optimizar la Biblioteca Estándar. Puedes aplicar las opciones de optimización para el resto de tu binario + dependencias al std con un parámetro inestable. Esta bandera requiere especificar tu objetivo, así que conoce el triple objetivo al que estás dirigiendo.

```shell
carga +nightly build --release -Z build-std --target x86_64-unknown-linux-gnu
```

Si está utilizando `n° = "abortar"` en las optimizaciones de su perfil de liberación, necesitas asegurarte de que la jaula `panic_abort` está compilada con std. Además, una característica extra de std puede reducir aún más el tamaño del binario. Lo siguiente se aplica a ambos:

```shell
carga +nightly build --release -Z build-std=std,panic_abort -Z build-std-features=panic_immediately. ate_abort --target x86_64-unknown-linux-gnu
```

Vea la documentación inestable para más detalles sobre [`-Z build-std`][cargo build-std] y [`-Z build-std-features`][cargo build-std-features].

### Rayo

Usa utilidades de strip para remover símbolos de depuración de tu aplicación compilada.

Su aplicación compilada incluye los llamados "símbolos de depuración" que incluyen funciones y nombres de variables. Probablemente a sus usuarios finales no les importen los símbolos de depuración, así que esta es una forma bastante segura de guardar algunos bytes!

La forma más fácil es utilizar la famosa utilidad de `tira` para eliminar esta información de depuración.

```shell
strip target/release/my_application
```

Mira tu página de manual local de `tira` para más información y banderas que pueden utilizarse para especificar qué información se despoja del binario.

:::info

Rust 1.59 ahora tiene una versión incorporada de `strip`! Puede ser habilitado agregando lo siguiente a su `Cargo.toml`:

```toml
[profile.release]
strip = true # Clip automáticamente símbolos del binario.
```

:::

### UPX

UPX, **Paquete definitivo para eXecutables**, es un dinosaurio entre los empaquetadores binarios. Este kit de 23 años de antigüedad, bien mantenido, es GPL-v2 licenciado con una declaración de uso bastante liberal. Nuestra comprensión de la licencia es que usted puede utilizarla para cualquier propósito (comercial o de otro tipo) sin necesidad de cambiar su licencia a menos que modifique el código fuente de UPX.

Tal vez tu público objetivo tenga Internet muy lento, o tu aplicación debe caber en una pequeña memoria USB, y todos los pasos anteriores no han resultado en los ahorros que usted necesita. No temas, ya que tenemos un último truco en nuestras manos:

[UPX][] comprime tu binario y crea un ejecutable auto-extraíble que se descomprime a sí mismo en tiempo de ejecución.

:::caution
Debes saber que esta técnica puede marcar tu binario como un virus en Windows y macOS - así que úsalo a tu discreción, y como siempre, ¡valida con [Frida][] y haz pruebas de distribución real!
:::

#### Uso en macOS

<!-- Add additional platforms -->

```
brew install upx
yarn tauri build
upx --ultra-brute src-tauri/target/release/bundle/macos/app. pp/Contents/macOS/app

                        Packer definitivo para eXecutables
                            Copyright (C) 1996 - 2018
UPX 3. 5 Húmero de Markus, Laszlo Molnar & John Reiser Aug 26th 2018

        Nombre de formato del tamaño del archivo
    -------------------- ------ ----------- -----------
    963140 ->    274448 28. 0% aplicación macho/amd64
```

[Macros]: https://doc.rust-lang.org/book/ch19-06-macros.html
[cargo-expand]: https://github.com/dtolnay/cargo-expand
[rollup-plugin-graph]: https://github.com/ondras/rollup-plugin-graph
[Vite]: https://vitejs.dev
[webpack]: https://webpack.js.org
[rollup]: https://rollupjs.org/guide/en/
[rollup-plugin-terser]: https://github.com/TrySound/rollup-plugin-terser
[rollup-plugin-uglify]: https://github.com/TrySound/rollup-plugin-uglify
[terser]: https://terser.org
[esbuild]: https://esbuild.github.io
[TypeScript]: https://www.typescriptlang.org
[Moment.js]: https://momentjs.com
[you-dont-need-momentjs]: https://github.com/you-dont-need/You-Dont-Need-Momentjs
[Http Archive]: https://httparchive.org
[http archive report, image bytes]: https://httparchive.org/reports/page-weight#bytesImg
[imagemin is unmaintained]: https://github.com/imagemin/imagemin/issues/385
[GIMP]: https://www.gimp.org
[Photoshop]: https://www.adobe.com/de/products/photoshop.html
[vite-imagetools]: https://github.com/JonasKruckenberg/imagetools
[vite-plugin-imagemin]: https://github.com/vbenjs/vite-plugin-imagemin
[image-minimizer-webpack-plugin]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin
[Squoosh]: https://squoosh.app
[Imágenes de respuesta]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
[¿Por qué es grande un ejecutable de oxidación?]: https://lifthrasiir.github.io/rustlog/why-is-a-rust-executable-large.html
[Minimizar Tamaño Binario de Rust]: https://github.com/johnthagen/min-sized-rust
[cargo unstable features]: https://doc.rust-lang.org/cargo/reference/unstable.html#unstable-features
[cargo profiles]: https://doc.rust-lang.org/cargo/reference/profiles.html
[cargo build-std]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std
[cargo build-std-features]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std-features
[Bundlephobia]: https://bundlephobia.com
[Frida]: https://frida.re/docs/home/
[UPX]: https://github.com/upx/upx
