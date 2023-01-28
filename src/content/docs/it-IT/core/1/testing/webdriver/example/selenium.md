import TabItem da '@theme/Tabs' import TabItem da '@theme/TabItem'

# Selenium

:::info Esempio Applicazione
Questa guida [Selenium][] si aspetta che tu abbia già passato l'esempio [Configurazione applicazione][] per seguire passo-passo. In caso contrario le informazioni generali potrebbero rivelarsi utili.
:::

Questo esempio di test WebDriver utilizzerà [Selenium][] e una popolare suite di test Node.js. Ci si aspetta che tu abbia già Node. s installato, insieme a `npm` o `yarn` anche se il [progetto di esempio finito][] utilizza `yarn`.

## Crea una directory per i test

Creiamo uno spazio per scrivere questi test nel nostro progetto. Useremo una directory annidata per questo progetto di esempio in quanto in seguito andremo oltre altri framework, ma tipicamente dovrai solo usarne uno. Crea la directory che useremo con `mkdir -p webdriver/selenio`. Il resto di questa guida supporrà di essere all'interno della directory `webdriver/selenio`.

## Inizializzazione di un progetto di selenio

Utilizzeremo un pacchetto `preesistente. son` per avviare questa suite di test perché abbiamo già scelto specifiche dipendenze da usare e vogliamo mostrare una soluzione di lavoro semplice. La parte inferiore di questa sezione ha una guida crollata su come configurarla da zero.

`package.json`:

```json
{
  "name": "selenium",
  "version": "1.0. ",
  "private": true,
  "scripts": {
    "test": "mocha"
  },
  "dipendenze": {
    "chai": "^4. .4",
    "mocha": "^9.0.3",
    "selenio-webdriver": "^4.0.0-beta.4"
  }
}
```

Abbiamo uno script che esegue [Mocha][] come framework di test esposto come comando `test`. Abbiamo anche diverse dipendenze che useremo per eseguire i test. [Mocha][] come framework di test, [Chai][] come libreria di asserzione, e [`selenio-webdriver`][] che è il Node. s [Pacchetto Selenio][].

<details><summary>Clicca su me se vuoi vedere come impostare un progetto da zero</summary>

Se si desidera installare le dipendenze da zero, è sufficiente eseguire il seguente comando.

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

Suggerisco anche di aggiungere un articolo `"test": "mocha"` nel pacchetto `. son` `"scripts"` key in modo che Mocha in esecuzione possa essere chiamato semplicemente con

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

## Test

A differenza della [WebdriverIO Test Suite](webdriverio#config), Selenium non esce dalla scatola con una Suite di Test e lascia allo sviluppatore per costruirli. Abbiamo scelto [Mocha][], che è piuttosto neutro e non legato a WebDrivers, così il nostro script dovrà fare un po 'di lavoro per impostare tutto per noi nell'ordine corretto. [Mocha][] si aspetta un file di test su `test/test.js` per impostazione predefinita, quindi creiamo quel file ora.

`test/test.js`:

```js
const os = require('os')
const path = require('path')
const { expect } = require('chai')
const { spawn, spawnSync } = require('child_process')
const { Builder, By, Capabilities } = require('selenium-webdriver')

// crea il percorso per il binario dell'applicazione previsto
const application = path. esolve(
  __dirname,
  '..',
  '..',
  '. ',
  'target',
  'release',
  'hello-tauri-webdriver'
)

// tieni traccia dell'istanza del webdriver che creiamo
lascia il driver

// tieni traccia del processo del tauri-driver che iniziamo
lascia tauriDriver

before(async function () {
  // imposta il tempo a 2 minuti per consentire al programma di costruire se ha bisogno di
  questo. imeout(120000)

  // assicurati che il programma sia stato costruito
  spawnSync('cargo', ['build', '--release'])

  // avvia tauri-driver
  tauriDriver = spawn(
    percorso. esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
    [],
    { stdio: [null, process. tdout, process.stderr] }
  )

  const capabilities = new Capabilities()
  capacità. et('tauri:options', { application })
  capacità. etBrowserName('wry')

  // avviare il client webdriver
  driver = attendere il nuovo Builder()
    . ithCapabilities(capacities)
    .usingServer('http://localhost:4444/')
    . uild()
})

after(async function () {
  // stop the webdriver session
  await driver. uit()

  // uccidere il processo tauri-driver
  tauriDriver. ill()
})

describe('Hello Tauri', () => {
  it('should be cordial', async () => {
    const text = await driver. indElement(By. ss('body > h1')).getText()
    expect(text).to. atch(/^[hH]ello/)
  })

  (dovrebbe essere eccitato', async () => {
    const text = await driver. indElement(By.css('body > h1')).getText()
    expect(text).to. atch(/! /)
  })

  (dovrebbe essere facile sugli occhi), async () => {
    // selenium restituisce i valori di colore css come rgb(r, g, b)
    const text = attendere il driver
      . indElement(By.css('body'))
      . etCssValue('background-color')

    const rgb = text.match(/^rgb\(?<r>\d+), (?<g>\d+), (?<b>\d+)\)$/).groups
    expect(rgb).to.have. ll.keys('r', 'g', 'b')

    const luma = 0.2126 * rgb.r + 0.7152 * rgb.g + 0. 722 * rgb.b
    expect(luma).to.be.lessThan(100)
  })
})
```

Se hai familiarità con i framework di test JS, `descrivi`, ``e `aspetta` dovrebbe sembrare familiare. Abbiamo anche semi-complesso `before()` and `after()` callback to setup and teardown mocha. Le linee che non sono i test stessi hanno commenti che spiegano la configurazione e il codice teardown. Se hai familiarità con il file Spec dall'esempio [WebdriverIO](webdriverio#spec), si nota un sacco di più codice che non è test, in quanto dobbiamo impostare alcuni articoli relativi al WebDriver .

## Esecuzione della Suite di Test

Ora che siamo tutti configurati con le nostre dipendenze e il nostro script di prova, facciamolo!

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

Dovremmo vedere l'output il seguente output:

```text
<unk> selenio git:(principale) <unk> test filato
corsa filato v1.22. 1
$ Mocha


  Ciao Tauri
    ✔ dovrebbe essere cordiale (120ms)
    ✔ dovrebbe essere eccitato
    ✔ dovrebbe essere facile sugli occhi


  3 passando (588ms)

Fatto a 0. 3s.
```

Possiamo vedere che il nostro `Ciao Tauri` dolce che abbiamo creato con `decribe` aveva tutti e 3 gli oggetti che abbiamo creato con `` ha superato i loro test!

Con [Selenium][] e qualche collegamento a una suite di prova, abbiamo appena abilitato il test e2e senza modificare la nostra applicazione Tauri .!

[Selenium]: https://selenium.dev/

[Pacchetto Selenio]: https://selenium.dev/
[progetto di esempio finito]: https://github.com/chippers/hello_tauri
[Configurazione applicazione]: ./setup.md
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[`selenio-webdriver`]: https://www.npmjs.com/package/selenium-webdriver
