importer des onglets depuis '@theme/Tabs' importer TabItem depuis '@theme/TabItem'

# IO WebdriverWeb

:::info Exemple d'Application
Ce guide [WebdriverIO][] attend que vous ayez déjà parcouru l' [exemple d'installation de l'application][] pour suivre étape par étape. Les informations générales peuvent encore être utiles autrement.
:::

Cet exemple de test WebDriver utilisera [WebdriverIO][], et sa suite de test. Il est attendu d'avoir Node. s déjà installé, avec `npm` ou `yarn` bien que le [projet d'exemple fini][] utilise `yarn`.

## Créer un répertoire pour les tests

Créons un espace pour écrire ces tests dans notre projet. Nous utiliserons un répertoire imbriqué pour ce projet d'exemple car nous passerons plus tard à d'autres frameworks, mais en général, vous n'avez besoin que d'en utiliser un. Créez le répertoire que nous utiliserons avec `mkdir -p webdriver/webdriverio`. Le reste de ce guide suppose que vous êtes à l'intérieur du répertoire `webdriver/webdriverio`.

## Initialisation d'un projet WebdriverIO

Nous utiliserons un package `préexistant. son` pour amorcer cette suite de tests car nous avons déjà choisi des options de configuration spécifiques [WebdriverIO][] et nous voulons présenter une solution de travail simple. Le bas de cette section a un tutoriel réduit pour le configurer à partir de zéro.

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

Nous avons un script qui exécute une configuration [WebdriverIO][] en tant que suite de tests exposée comme la commande `test`. Nous avons également diverses dépendances ajoutées par la commande `@wdio/cli` lorsque nous le configurons pour la première fois. En bref, ces dépendances sont pour la configuration la plus simple en utilisant un exécuteur local WebDriver, [Mocha][] comme le framework de test, et un simple rapport de spécialisation.

<details><summary>Cliquez sur moi si vous voulez voir comment configurer un projet à partir de zéro</summary>

Le CLI est interactif et vous pouvez choisir les outils pour travailler avec vous. Note that you will likely diverge from the rest of the guide, and you need to set up the differences yourself.

Ajoutons le CLI [WebdriverIO][] à ce projet npm.

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

Pour ensuite exécuter la commande de configuration interactive pour mettre en place une suite de test [WebdriverIO][] , vous pouvez ensuite exécuter:

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

## Configuration

Vous avez peut-être remarqué que le script `test` dans notre `package.json` mentionne un fichier `wdio.conf.js`. C'est le fichier de configuration [WebdriverIO][] qui contrôle la plupart des aspects de notre suite de test.

`wdio.conf.js`:

```js
const os = require('os')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

// keep track of the `tauri-driver` child process
let tauriDriver

exports. onfig = {
  spécifications : ['./test/specs/**/*. s'],
  maxInstances : 1,
  capacités : [
    {
      maxInstances : 1,
      'tauri:options': {
        application: '. /.. cible/release/hello-tauri-webdriver',
      },
    },
  ],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  // s'assurer que le projet de rouille est construit car nous attendons que ce binaire existe pour les sessions du webdriver
  onPrepare: () => spawnSync('cargo', ['build', '--release']),

  // assurez-vous que nous exécutons `tauri-driver` avant que la session ne démarre afin que nous puissions proxy les requêtes du webdriver
  beforeSession: () =>
    (tauriDriver = spawn(
      path. esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process. tderr] }
    )),

  // nettoie le processus `tauri-driver` que nous avons créé au début de la session
  afterSession: () => tauriDriver. malad(),
}
```

Si vous êtes intéressé par les propriétés de l'objet `exports.config` , je [suggère de lire la documentation][webdriver documentation]. Pour les éléments qui ne sont pas spécifiques à WDIO, il y a des commentaires expliquant pourquoi nous exécutons des commandes dans `onPrepare`, `beforeSession`, et `afterSession`. Nous avons également nos spécifications définies à `"./test/specs/**/*.js"`, nous allons donc créer une spécification maintenant.

## Spécification

Une spécification contient le code qui teste votre application réelle. L'exécuteur de test chargera ces spécifications et automatiquement les exécutera comme bon lui semble. Nous allons maintenant créer notre spécification dans le répertoire que nous avons spécifié.

`test/specs/example.e2e.js`:

```js
// calcule la luma à partir d'une couleur hexadécimale `#abcdef`
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

describe('Bonjour Tauri', () => {
  it('doit être cordial', async () => {
    const header = wait $('body > h1')
    const text = wait header. etText()
    expect(texte). oMatch(/^[hH]ello/)
  })

  il('doit être excité', async () => {
    const header = wait $('body > h1')
    const text = wait header. etText()
    expect(texte). oMatch(/! /)
  })

  it('doit être facile aux yeux', async () => {
    const body = wait $('body')
    const backgroundColor = wait body. etCSSProperty('background-color')
    expect(luma(backgroundColor.parsed.hex)).toBeLessThan(100)
  })
})
```

La fonction `luma` est juste une fonction d'aide pour l'un de nos tests et n'est pas liée au test réel de l'application. Si vous êtes familier avec d'autres frameworks de test, vous pouvez remarquer que des fonctions similaires sont exposées que sont utilisées, comme `décrivez`, `il`et `attendez`. Les autres API, comme les éléments comme `$` et ses méthodes exposées, sont couverts par les [docs API WebdriverIO][].

## Exécution de la suite de test

Maintenant que nous sommes tous configurés avec la configuration et une spécialisation nous allons l'exécuter!

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

Nous devrions voir la sortie suivante :

```text
<unk> webdriverio git:(main) <unk> yarn test
yarn run v1.22.11
$ wdio run wdio.conf. s

L'exécution de 1 travailleur a commencé à 2021-08-17T08:06:10.279Z

[0-0] RUNNING dans undefined - /test/specs/example.e2e. s
[0-0] PASSED dans undefined - /test/specs/example.e2e.js

 "spec" Reporter:
------------------------------------------------------------------
[wry 0. 2.1 linux #0-0] Exécution : wry (v0.12.1) sur linux
[wry 0.12. linux #0-0] ID de session : 81e0107b-4d38-4eed-9b10-e80ca47bb83
[wry 0.12.1 linux #0-0]
[wry 0.12.1 linux #0-0] » /test/specs/example. 2e.js
[wry 0.12.1 linux #0-0] Bonjour Tauri
[wry 0.12.1 linux #0-0] ✓ devrait être cordial
[wry 0.12. linux #0-0] ✓ devrait être excité
[wry 0.12. linux #0-0] ✓ devrait être facile aux yeux
[wry 0.12.1 linux #0-0]
[wry 0. 2.1 linux #0-0] 3 passant (244ms)


Fichiers Spec : 1 passés, 1 total (100% terminé) en 00:00:01

Terminé en 1.98s.
```

Nous voyons le rapport de spécialisation nous dire que les 3 tests des `test/specs/example.e2e. s` fichier, avec le rapport final `Fichiers de spécification : 1 passé, 1 total (100% terminé) en 00:00:01`.

Utilisation de la suite de test [WebdriverIO][] nous venons d'activer facilement les tests e2e pour notre application Tauri à partir de seulement quelques lignes de configuration et une commande unique pour l'exécuter ! Mieux encore, nous n'avons pas eu à modifier l'application du tout.

[WebdriverIO]: https://webdriver.io/
[projet d'exemple fini]: https://github.com/chippers/hello_tauri
[exemple d'installation de l'application]: ./setup.md
[Mocha]: https://mochajs.org/
[webdriver documentation]: https://webdriver.io/docs/configurationfile
[docs API WebdriverIO]: https://webdriver.io/docs/api
