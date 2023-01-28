importar pestañas de '@theme/Tabs' importar TabItem de '@theme/TabItem'

# WebdriverIO

:::info Aplicación de ejemplo
Esta guía [WebdriverIO][] espera que usted ya haya pasado por la [configuración de la aplicación de ejemplo][] para seguir paso a paso. De lo contrario, la información general puede ser útil.
:::

Este ejemplo de prueba WebDriver usará [WebdriverIO][]y su suite de pruebas. Se espera que tenga Nodo. s ya instalados, junto con `npm` o `yarn` aunque el [proyecto de ejemplo terminado][] utiliza `yarn`.

## Crear un Directorio para las Pruebas

Vamos a crear un espacio para escribir estas pruebas en nuestro proyecto. Utilizaremos un directorio anidado para este proyecto de ejemplo ya que más tarde también iremos sobre otros frameworks, pero normalmente sólo necesitas usar uno. Crea el directorio que usaremos con `mkdir -p webdriver/webdriverio`. El resto de esta guía asume que está dentro del directorio `webdriver/webdriverio`.

## Inicializando un proyecto WebdriverIO

Utilizaremos un paquete `preexistente. hijo` para bootstrap esta suite de pruebas porque ya hemos elegido las opciones de configuración [WebdriverIO][] y queremos mostrar una solución de trabajo simple. La parte inferior de esta sección tiene una guía colapsada para configurarla desde cero.

`package.json`:

```json
{
  "name": "webdriverio",
  "version": "1.0. ",
  "private": true,
  "scripts": {
    "test": "wdio run wdio. onf.js"
  },
  "dependencies": {
    "@wdio/cli": "^7. .1"
  },
  "devDependencies": {
    "@wdio/local-runner": "^7.9. ",
    "@wdio/mocha-framework": "^7.9.1",
    "@wdio/spec-reporter": "^7.9.0"
  }
}
```

Tenemos un script que ejecuta una configuración de [WebdriverIO][] como una suite de pruebas expuesta como el comando `test`. También tenemos varias dependencias añadidas por el comando `@wdio/cli` cuando lo configuramos por primera vez. En resumen, estas dependencias son para la configuración más simple usando un runner WebDriver local, [Mocha][] como el framework de pruebas, y un reporte de Spec simple.

<details><summary>Haz clic en mí si quieres ver cómo configurar un proyecto desde cero</summary>

El CLI es interactivo, y usted puede elegir las herramientas para trabajar con usted mismo. Ten en cuenta que probablemente diverjas de el resto de la guía, y necesitas configurar las diferencias tú mismo.

Añadamos el CLI de [WebdriverIO][] a este proyecto npm.

<Tabs groupId="package-manager"
defaultValue="yarn"
values={[
{label: 'npm', value: 'npm'}, {label: 'Yarn', value: 'yarn'},
]}>
<TabItem value="npm">

```shell
npm install @wdio/cli
```

</TabItem>

<TabItem value="yarn">

```shell
yarn add @wdio/cli
```

</TabItem>
</Tabs>

Para luego ejecutar el comando de configuración interactiva para configurar un [WebdriverIO][] de prueba suite, puede ejecutar:

<Tabs groupId="package-manager"
defaultValue="yarn"
values={[
{label: 'npm', value: 'npm'}, {label: 'Yarn', value: 'yarn'},
]}>
<TabItem value="npm">

```shell
npx wdio config
```

</TabItem>

<TabItem value="yarn">

```shell
yarn wdio config
```

</TabItem>
</Tabs>

</details>

## Configuración

Puede que haya notado que el script `test` en nuestro `package.json` menciona un archivo `wdio.conf.js`. Ese es el archivo de configuración [WebdriverIO][] que controla la mayoría de los aspectos de nuestra suite de pruebas.

`wdio.conf.js`:

```js
const os = require('os')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

// mantener un seguimiento del proceso secundario `tauri-driver`
let tauriDriver

exports. onfig = {
  specs: ['./test/specs/**/*. s'],
  maxInstances: 1,
  capacidades: [
    {
      maxInstances: 1,
      'tauri:options': {
        aplicación: '. /.. target/release/hola-tauri-webdriver',
      },
    },
  ],
  reporteros: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  // asegurarse de que el proyecto rust está construido, ya que esperamos que este binario exista para las sesiones webdriver
  onPrepare: () => spawnSync('cargo', ['build', '--release']),

  // asegúrese de que estamos ejecutando `tauri-driver` antes de que la sesión comience para que podamos proxir las solicitudes del controlador web
  beforeSession: () =>
    (tauriDriver = spawn(
      path. esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process. tderr] }
    )),

  // limpiamos el proceso `tauri-driver` que generamos al inicio de la sesión
  afterSession: () => tauriDriver. ill(),
}
```

Si está interesado en las propiedades del objeto `exports.config` , [sugiero leer la documentación][webdriver documentation]. Para artículos específicos que no sean WDIO, hay comentarios que explican por qué estamos ejecutando comandos en `onPrepare`, `beforeSession`, y `afterSession`. También tenemos nuestras especificaciones establecidas en `"./test/specs/**/*.js"`, así que vamos a crear una especificación ahora.

## Espejo

Una especificación contiene el código que está probando su aplicación real. El corredor de pruebas cargará estas especificaciones y automáticamente ejecutarlas como considere oportuno. Vamos a crear nuestra especificación ahora en el directorio que hemos especificado.

`test/specs/example.e2e.js`:

```js
// calcula la luma a partir de un color hexadecimal `#abcdef`
function luma(hex) {
  if (hex. tartsWith('#')) {
    hex = hex. ubstring(1)
  }

  const rgb = parseInt(hex, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  return 0. 126 * r + 0.7152 * g + 0. 722 * b
}

describe('Hola Tauri', () => {
  it('debería ser cordial', async () => {
    const header = await $('body > h1')
    const text = await header. etText()
    expect(texto). oMatch(/^[hH]ello/)
  })

  it('debe ser emocionado', async () => {
    const header = await $('body > h1')
    const text = await header. etText()
    expect(texto). oMatch(/! /)
  })

  it('debería ser fácil en los ojos', async () => {
    const body = await $('body')
    const backgroundColor = await body. etCSSProperty('background-color')
    expect(luma(backgroundColor.parsed.hex)).toBeLessThan(100)
  })
})
```

La función `luma` en la parte superior es solo una función ayudante para una de nuestras pruebas y no está relacionada con la prueba real de la aplicación. Si está familiarizado con otros frameworks de prueba, puede notar que funciones similares están expuestas que son usadas. tal como `describe`, `it`, y `expect`. Las otras APIs, como los artículos como `$` y sus métodos expuestos, están cubiertos por la [documentación de la API WebdriverIO][].

## Ejecutando la Suite de Prueba

Ahora que todos estamos configurados con configuración y una especificación ¡vamos a ejecutarlo!

<Tabs groupId="package-manager"
defaultValue="yarn"
values={[
{label: 'npm', value: 'npm'}, {label: 'Yarn', value: 'yarn'},
]}>
<TabItem value="npm">

```shell
npm test
```

</TabItem>

<TabItem value="yarn">

```shell
yarn test
```

</TabItem>
</Tabs>

Deberíamos ver la salida siguiente:

```text
► webdriverio git:(main) Prueba de yarn
yarn run v1.22.11
$ wdio run wdio.conf. s

Ejecución de 1 trabajador comenzó en 2021-08-17T08:06:10.279Z

[0-0] Ejecución en no definido - /test/specs/example.e2e. s
[0-0] PASSED en indefinido - /test/specs/example.e2e.js

 "spec" Reporter:
--------------------------------------------------
[wry 0. 2.1 linux #0-0] Ejecución: wry (v0.12.1) on linux
[wry 0.12. linux #0-0] ID de sesión: 81e0107b-4d38-4eed-9b10-ee80ca47bb83
[wry 0.12.1 linux #0-0]
[wry 0.12.1 linux #0-0] » /test/specs/example. 2e.js
[wry 0.12.1 linux #0-0] Hola Tauri
[wry 0.12.1 linux #0-0] ✓ should be cordial
[wry 0.12. linux #0-0] ✓ debe estar emocionado
[wry 0.12. linux #0-0] ✓ debería ser fácil en los ojos
[wry 0.12.1 linux #0-0]
[wry 0. 2.1 linux #0-0] 3 pasando (244ms)


Archivos Spec pasados: 1 pasado, 1 total (100% completado) en 00:00:01

Hecho en 1.98s.
```

Vemos que el informe Spec nos dice que las 3 pruebas del `test/specs/example.e2e. s archivo` , junto con el informe final `Archivos Spec : 1 pasado, 1 total (100% completado) en 00:00:01`.

Usando el [WebdriverIO][] test suite, sólo hemos habilitado fácilmente las pruebas e2e para nuestra aplicación Tauri desde unas pocas líneas de configuración y un solo comando para ejecutarlo! Aún mejor, no tuvimos que modificar la aplicación en absoluto.

[WebdriverIO]: https://webdriver.io/
[proyecto de ejemplo terminado]: https://github.com/chippers/hello_tauri
[configuración de la aplicación de ejemplo]: ./setup.md
[Mocha]: https://mochajs.org/
[webdriver documentation]: https://webdriver.io/docs/configurationfile
[documentación de la API WebdriverIO]: https://webdriver.io/docs/api
