import TabItem da '@theme/Tabs' import TabItem da '@theme/TabItem'

# WebdriverIO

:::info Esempio Applicazione
Questa guida [WebdriverIO][] si aspetta che tu abbia già passato l'esempio [Configurazione applicazione][] per seguire passo-passo. In caso contrario le informazioni generali potrebbero rivelarsi utili.
:::

Questo esempio di test WebDriver utilizzerà [WebdriverIO][]e la sua suite di test. Si prevede che abbia Node. s già installato, insieme a `npm` o `yarn` anche se il [progetto di esempio finito][] utilizza `yarn`.

## Crea una directory per i test

Creiamo uno spazio per scrivere questi test nel nostro progetto. Useremo una directory annidata per questo progetto di esempio in quanto in seguito andremo oltre altri framework, ma in genere è necessario solo usarne uno. Crea la directory che useremo con `mkdir -p webdriver/webdriverio`. Il resto di questa guida presuppone che tu sia all'interno della directory `webdriver/webdriverio`.

## Inizializzazione di un progetto WebdriverIO

Utilizzeremo un pacchetto `preesistente. son` per avviare questa suite di test perché abbiamo già scelto specifiche opzioni di configurazione [WebdriverIO][] e vogliamo mostrare una soluzione di lavoro semplice. La parte inferiore di questa sezione ha una guida collassata sulla sua configurazione da zero.

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

Abbiamo uno script che esegue una configurazione [WebdriverIO][] come suite di test esposta come il comando `test`. Abbiamo anche diverse dipendenze aggiunte dal comando `@wdio/cli` quando lo abbiamo impostato per la prima volta. In breve, queste dipendenze sono per la configurazione più semplice utilizzando un corridore WebDriver locale, [Mocha][] come framework di test, e un semplice Spec Reporter.

<details><summary>Clicca su me se vuoi vedere come impostare un progetto da zero</summary>

Il CLI è interattivo e puoi scegliere gli strumenti per lavorare con te stesso. Note that you will likely diverge from the rest of the guide, and you need to set up the differences yourself.

Aggiungiamo il [WebdriverIO][] CLI a questo progetto npm.

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

Per eseguire quindi il comando di configurazione interattivo per impostare una suite di test [WebdriverIO][] è possibile eseguire:

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

## Configurazione

Potresti aver notato che lo script `test` nel nostro `package.json` menziona un file `wdio.conf.js`. Questo è il file di configurazione [WebdriverIO][] che controlla la maggior parte degli aspetti della nostra suite di test.

`wdio.conf.js`:

```js
const os = require('os')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

// tieni traccia del processo figlio `tauri-driver`
let tauriDriver

exports. onfig = {
  specs: ['./test/specs/**/*. s'],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      'tauri:options': {
        application: '. /.. target/release/hello-tauri-webdriver',
      },
    },
  ],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  // assicurati che il progetto di ruggine sia costruito poiché ci aspettiamo che questo binario esista per le sessioni di webdriver
  onPrepare: () => spawnSync('cargo', ['build', '--release']),

  // assicurati che stiamo eseguendo `tauri-driver` prima dell'inizio della sessione in modo da poter proxy le richieste del driver web
  beforeSession: () =>
    (tauriDriver = spawn(
      percorso. esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process. tderr] }
    )),

  // pulisci il processo `tauri-driver` che abbiamo generato all'inizio della sessione
  dopoSessione: () => tauriDriver. male(),
}
```

Se sei interessato alle proprietà sull'oggetto `exports.config` , [suggerisco di leggere la documentazione][webdriver documentation]. Per gli elementi specifici non WDIO, ci sono commenti che spiegano perché stiamo eseguendo comandi in `onPrepara`, `beforeSession`, e `afterSession`. Abbiamo anche le nostre specifiche impostate su `"./test/specs/**/*.js"`, quindi creiamo una specifica ora.

## Spec

Una specifica contiene il codice che sta testando la tua applicazione reale. The test runner will load these specs and automatically run them as it sees fit. Creiamo la nostra specifica ora nella directory che abbiamo specificato.

`test/specs/example.e2e.js`:

```js
// calcola la luma da un colore esadecimale `#abcdef`
function luma(hex) {
  if (hex. tartsWith('#')) {
    hex = hex. ubstring(1)
  }

  const rgb = parseInt(hex, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  return 0. 126 * r + 0,7152 * g + 0. 722 * b
}

describe('Hello Tauri', () => {
  it('should be cordial', async () => {
    const header = await $('body > h1')
    const text = await header. etText()
    expect(text). oMatch(/^[hH]ello/)
  })

  (dovrebbe essere eccitato', async () => {
    const header = await $('body > h1')
    const text = await header. etText()
    expect(text). oMatch(/! /)
  })

  (dovrebbe essere facile sugli occhi), async () => {
    const body = await $('body')
    const backgroundColor = attendono il corpo. etCSSProperty('background-color')
    expect(luma(backgroundColor.parsed.hex)).toBeLessThan(100)
  })
})
```

La funzione `luma` in cima è solo una funzione di aiuto per uno dei nostri test e non è correlata al test effettivo di l'applicazione. Se hai familiarità con altri framework di test, potresti notare che funzioni simili sono esposte che sono usate, such as `describe`, `it`, and `expect`. Le altre API, come gli elementi come `$` e i suoi metodi esposti, sono coperti dai documenti [WebdriverIO API][].

## Esecuzione della Suite di Test

Ora che siamo tutti configurati con la configurazione e una spec lo facciamo!

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
<unk> webdriverio git:(principale) <unk> yarn test
yarn run v1.22.11
$ wdio run wdio.conf. s

L'esecuzione di 1 lavoratore è iniziata a 2021-08-17T08:06:10.279Z

[0-0] RUNNING in indefinito - /test/specs/example.e2e. s
[0-0] PASSED in undefined - /test/specs/example.e2e.js

 "spec" Reporter:
--------------------------------------------------------------------------
[wry 0. 2.1 linux #0-0] In esecuzione: wry (v0.12.1) su linux
[wry 0.12. linux #0-0] Session ID: 81e0107b-4d38-4eed-9b10-ee80ca47bb83
[wry 0.12.1 linux #0-0]
[wry 0.12.1 linux #0-0] » /test/specs/esempio. 2e.js
[wry 0.12.1 linux #0-0] Ciao Tauri
[wry 0.12.1 linux #0-0] ✓ dovrebbe essere cordiale
[wry 0.12. linux #0-0] ✓ dovrebbe essere eccitato
[wry 0.12. linux #0-0] ✓ dovrebbe essere facile sugli occhi
[wry 0.12.1 linux #0-0]
[wry 0. 2.1 linux #0-0] 3 passanti (244ms)


Spec File: 1 passato, 1 totale (100% completato) in 00:00:01

Fatto a 1.98s.
```

Vediamo il Spec Reporter ci dice che tutti e 3 i test del `test/specs/example.e2e. s` file, insieme al report finale `Spec Files: 1 passato, 1 totale (100% completato) in 00:00:01`.

Utilizzando la suite di test [WebdriverIO][] , abbiamo appena abilitato facilmente il test e2e per la nostra applicazione Tauri da poche righe di configurazione e un singolo comando per eseguirlo! Ancor meglio, non abbiamo dovuto modificare l'applicazione a tutti.

[WebdriverIO]: https://webdriver.io/
[progetto di esempio finito]: https://github.com/chippers/hello_tauri
[Configurazione applicazione]: ./setup.md
[Mocha]: https://mochajs.org/
[webdriver documentation]: https://webdriver.io/docs/configurationfile
[WebdriverIO API]: https://webdriver.io/docs/api
