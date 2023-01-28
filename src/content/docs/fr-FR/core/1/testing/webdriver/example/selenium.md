importer des onglets depuis '@theme/Tabs' importer TabItem depuis '@theme/TabItem'

# Selenium

:::info Exemple d'Application
Ce guide [Sélénium][] attend que vous ayez déjà parcouru l' [exemple d'installation de l'application][] pour suivre étape par étape. Les informations générales peuvent encore être utiles autrement.
:::

Cet exemple de test WebDriver utilisera [Selenium][] et une suite de tests Node.js populaire. Vous devez déjà avoir nœud. s installés, avec `npm` ou `yarn` bien que le [projet d'exemple fini][] utilise `yarn`.

## Créer un répertoire pour les tests

Créons un espace pour écrire ces tests dans notre projet. Nous utiliserons un répertoire imbriqué pour ce projet d'exemple car nous passerons plus tard à d'autres frameworks, mais en général, vous n'aurez besoin que d'en utiliser un. Créez le répertoire que nous utiliserons avec `mkdir -p webdriver/sélénium`. Le reste de ce guide supposera que vous êtes à l'intérieur du répertoire `webdriver/sélénium`.

## Initialisation d'un projet Selenium

Nous utiliserons un package `préexistant. son` pour amorcer cette suite de tests parce que nous avons déjà choisi des dépendances spécifiques à utiliser et que nous voulons présenter une solution de travail simple. Le bas de cette section a un guide réduit sur la façon de le configurer à partir de zéro.

`package.json`:

```json
{
  "name": "sélénium",
  "version": "1.0. ",
  "private": true,
  "scripts": {
    "test": "mocha"
  },
  "dépendances": {
    "chai": "^4. .4",
    "mocha": "^9.0.3",
    "sélénium-webdriver": "^4.0.0-beta.4"
  }
}
```

Nous avons un script qui exécute [Mocha][] en tant que framework de test exposé comme la commande `test`. Nous avons également différentes dépendances que nous utiliserons pour exécuter les tests. [Mocha][] comme le framework de test, [Chai][] comme la bibliothèque d'assertion, et [`sélénium-webdriver`][] qui est le noeud. s [Sélénium][] paquet.

<details><summary>Cliquez sur moi si vous voulez voir comment configurer un projet à partir de zéro</summary>

Si vous voulez installer les dépendances à partir de zéro, lancez la commande suivante.

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

Je suggère également d'ajouter un élément `"test": "mocha"` dans le paquet `. fils` `clé "scripts"` pour que Mocha en cours d'exécution puisse être appelée simplement avec

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

## Tests en cours

Contrairement à la [suite de test WebdriverIO](webdriverio#config), Le sélénium ne sort pas de la boîte avec une suite de test et laisse au développeur le soin de les construire. Nous avons choisi [Mocha][], qui est assez neutre et non lié aux WebDrivers, donc notre script devra faire un peu de travail pour tout mettre en place dans le bon ordre. [Mocha][] attend un fichier de test à `test/test.js` par défaut, alors créons ce fichier maintenant.

`test/test.js`:

```js
const os = require('os')
const path = require('path')
const { expect } = require('chai')
const { spawn, spawnSync } = require('child_process')
const { Builder, By, Capabilities } = require('selenium-webdriver')

// crée le chemin vers le binaire d'application attendu
const application = path. esolve(
  __dirname,
  '..',
  '..',
  '. ',
  'target',
  'release',
  'hello-tauri-webdriver'
)

// gardez la trace de l'instance du webdriver que nous créons
let driver

// gardez la trace du processus tauri-driver que nous lançons
let tauriDriver

before(async function () {
  // set timeout to 2 minutes to allow the program to build if it need to
  this. imeout(120000)

  // s'assurer que le programme a été construit
  spawnSync('cargo', ['build', '--release'])

  // démarre tauri-driver
  tauriDriver = spawn(
    chemin. esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
    [],
    { stdio: [null, process. tdout, process.stderr] }
  )

  capacités const = nouvelles capacités()
  capacités. et('tauri:options', { application })
  capacités. etBrowserName('wry')

  // démarre le client webdriver
  driver = attend new Builder()
    . ithCapabilities(capacités)
    .usingServer('http://localhost:4444/')
    . uild()
})

after(async function () {
  // arrête la session webdriver
  attendent le pilote. uit()

  // tue le processus tauri-driver
  tauriDriver. ill()
})

describe('Bonjour Tauri', () => {
  it('doit être cordial', async () => {
    const text = wait driver. 
 indElement(By. ss('body > h1')).getText()
    expect(text).to. atch(/^[hH]ello/)
  })

  it('doit être excité', async () => {
    const text = wait driver. indElement(By.css('body > h1')).getText()
    expect(text).to. atch(/! /)
  })

  it('doit être facile aux yeux', async () => {
    // le sélénium retourne les valeurs de couleur css en tant que rgb(r, g, b)
    texte const = attendre le pilote
      . indElement(By.css('body'))
      . etCssValue('background-color')

    const rgb = text.match(/^rgb\((?<r>\d+), (?<g>\d+), (?<b>\d+)\)$/).groups
    expect(rgb).to.have ll.keys('r', 'g', 'b')

    const luma = 0.2126 * rgb.r + 0.7152 * rgb.g + 0. 722 * rgb.b
    expect(luma).to.be.lessThan(100)
  })
})
```

Si vous êtes familier avec les frameworks de test JavaScript, `décrivez`, `il`, et `attendez-vous à` devrait avoir l'air familier. Nous avons également des fonctions de rappel semi-complexes `avant()` et `after()` à configurer et déchirer mocha. Les lignes qui ne sont pas les tests eux-mêmes ont des commentaires expliquant la configuration et le code décomposé. Si vous étiez familier avec le fichier Spec de l'exemple [WebdriverIO](webdriverio#spec), vous remarquez beaucoup plus de code qui n'est pas des tests, car nous devons configurer quelques éléments liés à WebDriver supplémentaires.

## Exécution de la suite de test

Maintenant que nous sommes tous configurés avec nos dépendances et notre script de test, nous allons l'exécuter!

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
<unk> selenium git:(main) <unk> yarn test
yarn run v1.22. 1
$ Mocha


  Bonjour Tauri
    ✔ devrait être cordial (120ms)
    ✔ devrait être excité
    ✔ devrait être facile sur les yeux


  3 passant (588ms)

Terminé en 0. 3 secondes.
```

Nous pouvons voir que notre `Bonjour Tauri` doux que nous avons créé avec `decribe` a eu les 3 items que nous avons créés avec `il` passer leurs tests !

Avec [sélénium][] et un peu de raccordement à une suite de test, nous avons juste activé le test e2e sans modifier du tout notre application Tauri !

[Sélénium]: https://selenium.dev/

[Selenium]: https://selenium.dev/

[sélénium]: https://selenium.dev/
[projet d'exemple fini]: https://github.com/chippers/hello_tauri
[exemple d'installation de l'application]: ./setup.md
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[`sélénium-webdriver`]: https://www.npmjs.com/package/selenium-webdriver
