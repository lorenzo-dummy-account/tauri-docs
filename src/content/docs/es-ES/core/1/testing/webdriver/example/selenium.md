importar pestañas de '@theme/Tabs' importar TabItem de '@theme/TabItem'

# Selenium

:::info Aplicación de ejemplo
Esta guía [Selenium][] espera que ya hayas pasado por la [configuración de la aplicación de ejemplo][] para seguir paso a paso. De lo contrario, la información general puede ser útil.
:::

Este ejemplo de prueba de WebDriver usará [Selenium][] y una popular suite de pruebas de Node.js. Se espera que ya tenga nodo. instalado, junto con `npm` o `yarn` aunque el [proyecto de ejemplo terminado][] utiliza `yarn`.

## Crear un Directorio para las Pruebas

Vamos a crear un espacio para escribir estas pruebas en nuestro proyecto. Utilizaremos un directorio anidado para este proyecto de ejemplo ya que más tarde también iremos sobre otros frameworks, pero típicamente sólo necesitará usar uno. Crea el directorio que usaremos con `mkdir -p webdriver/selenium`. El resto de esta guía asumirá que estás dentro del directorio `webdriver/selenium`.

## Inicializar un proyecto de Selenium

Utilizaremos un paquete `preexistente. hijo` para iniciar esta suite de pruebas porque ya hemos elegido dependencias específicas para usar y queremos mostrar una solución de trabajo simple. La parte inferior de esta sección tiene una guía colapsada sobre cómo configurarla desde cero.

`package.json`:

```json
{
  "name": "selenium",
  "version": "1.0. ",
  "private": true,
  "scripts": {
    "test": "mocha"
  },
  "dependencies": {
    "chai": "^4. .4",
    "mocha": "^9.0.3",
    "selenium-webdriver": "^4.0.0-beta.4"
  }
}
```

Tenemos un script que ejecuta [Mocha][] como un framework de pruebas expuesto como el comando `test`. También tenemos varias dependencias que usaremos para ejecutar las pruebas. [Mocha][] como framework de pruebas, [Chai][] como biblioteca de afirmación, y [`selenium-webdriver`][] que es el Nodo. s [paquete Selenium][].

<details><summary>Haz clic en mí si quieres ver cómo configurar un proyecto desde cero</summary>

Si quieres instalar las dependencias desde cero, simplemente ejecuta el siguiente comando.

<Tabs groupId="package-manager"
defaultValue="yarn"
values={[
{label: 'npm', value: 'npm'}, {label: 'Yarn', value: 'yarn'},
]}>
<TabItem value="npm">

```shell
npm install mocha chai selenium-webdriver
```

</TabItem>

<TabItem value="yarn">

```shell
yarn add mocha chai selenium-webdriver
```

</TabItem>
</Tabs>

Yo sugiero también añadir un `"test": "mocha"` elemento en el paquete `. hijo` `"scripts"` clave para que Mocha en ejecución pueda ser llamado simplemente con

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

</details>

## Pruebas

A diferencia de la [WebdriverIO Test Suite](webdriverio#config), Selenium no sale de la caja con una Suite de Prueba y la deja en manos del desarrollador para construirla. Elegimos [Mocha][], que es bastante neutral y no está relacionado con WebDrivers, así que nuestro script tendrá que hacer un poco de trabajo para configurar todo en el orden correcto. [Mocha][] espera un archivo de prueba en `test/test.js` por defecto, así que vamos a crear ese archivo ahora.

`test/test.js`:

```js
const os = require('os')
const path = require('path')
const { expect } = require('chai')
const { spawn, spawnSync } = require('child_process')
const { Builder, By, Capabilities } = require('selenium-webdriver')

// crea la ruta al binario esperado de la aplicación
const application = path. esolve(
  __dirname,
  '..',
  '..',
  '. ',
  'target',
  'release',
  'hello-tauri-webdriver'
)

// hacer un seguimiento de la instancia del controlador web que creamos
let driver

// mantener un seguimiento del proceso tauri-driver que iniciamos
let tauriDriver

before(async function () {
  // establecer tiempo de espera a 2 minutos para permitir que el programa compile si necesita
  esto. imeout(120000)

  // asegurarse de que el programa ha sido construido
  spawnSync('cargo', ['build', '--release'])

  // iniciar tauri-driver
  tauriDriver = spawn(
    rutas. esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
    [],
    { stdio: [null, process. tdout, process.stderr] }
  )

  const capabilities = new Capabilities()
  capacidades. et('tauri:options', { application })
  capacidades. etBrowserName('wry')

  // iniciar el cliente webdriver
  driver = await new Builder()
    . ithCapabilities(capacidades)
    .usingServer('http://localhost:4444/')
    . uild()
})

after(async function () {
  // detener la sesión webdriver
  await driver. uit()

  // mata el proceso tauri-driver
  tauriDriver. ill()
})

describe('Hola Tauri', () => {
  it('should be cordial', async () => {
    const text = await driver. indElement(por. ss('cuerpo > h1')).getText()
    expect(text).to. atch(/^[hH]ello/)
  })

  it('debe ser excitado', async () => {
    const text = await driver. indElement(By.css('cuerpo > h1')).getText()
    expect(text).to. atch(/! /)
  })

  it('debería ser fácil en los ojos', async () => {
    // selenium devuelve los valores de color css como rgb(r, g, b)
    const text = await driver
      . indElement(By.css('body'))
      . etCssValue('background-color')

    const rgb = text.match(/^rgb\(?<r>\d+), (?<g>\d+), (?<b>\d+)\)$/).groups
    expect(rgb).to.have. ll.keys('r', 'g', 'b')

    const luma = 0.2126 * rgb.r + 0.7152 * rgb.g + 0. 722 * rgb.b
    expect(luma).to.be.lessThan(100)
  })
})
```

Si está familiarizado con los frameworks de prueba JS, `describa`, `lo`y `esperar` debería parecer familiar. También tenemos semicomplejo `before()` y `after()` callbacks para configurar y teardown mocha. Las líneas que no son las pruebas en sí mismas tienen comentarios que explican la configuración y el código teardown. Si estaba familiarizado con el archivo Spec del ejemplo [WebdriverIO](webdriverio#spec), notas mucho más código que no es prueba, ya que tenemos que configurar algunos elementos relacionados con WebDriver.

## Ejecutando la Suite de Prueba

Ahora que todos estamos configurados con nuestras dependencias y nuestro script de prueba, ¡vamos a ejecutarlo!

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
Git: (principal) Prueba de yarn
yarn run v1.22. 1
$ Mocha


  Hola Tauri
    ✔ debe ser cordial (120ms)
    ✔ debe ser excitado
    ✔ debe ser fácil a los ojos


  3 pasando (588ms)

Hecho en 0. 3s.
```

Podemos ver que nuestro `Hola Tauri` dulce que creamos con `decribe` tenía los 3 elementos que creamos con `¡` pase sus tests!

Con [Selenium][] y algunos ganchos hasta un test suite, solo hemos activado e2e testing sin modificar nuestra aplicación Tauri en absoluto.

[Selenium]: https://selenium.dev/

[paquete Selenium]: https://selenium.dev/
[proyecto de ejemplo terminado]: https://github.com/chippers/hello_tauri
[configuración de la aplicación de ejemplo]: ./setup.md
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[`selenium-webdriver`]: https://www.npmjs.com/package/selenium-webdriver
