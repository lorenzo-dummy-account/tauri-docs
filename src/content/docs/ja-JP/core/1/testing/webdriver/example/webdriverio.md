import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

# WebdriverIO

:::info Example Application
この [WebdriverIO][] ガイドでは、 [アプリケーションの設定例][] ステップバイステップに従ってください。 そうでなければ一般的な情報はまだ役に立つかもしれません。
:::

このWebDriverテストの例では、 [WebdriverIO][]とそのテストスイートを使用します。 ノードを持つことが期待されます。 sはすでに をインストールしています 完成したプロジェクト `` と `yarn` と一緒に [npm][] または `yarn` を使用します。

## テスト用のディレクトリを作成

これらのテストをプロジェクトに書くためのスペースを作りましょう。 このプロジェクトのネストされたディレクトリ を使用します。後で他のフレームワークについても説明します。 しかし通常は1つだけ使う必要があります を `mkdir -p webdriver/webdriverio` で使用するディレクトリを作成します。 このガイドの残りの部分は、あなたが `webdriver/webdriverio` ディレクトリ内にいることを前提としています。

## WebdriverIO プロジェクトの初期化

既存の `パッケージを使用します。 息子<code>` はこのテストスイートをブートストラップします。 [WebdriverIO][] 設定オプションをすでに選択しており、シンプルな動作ソリューションを紹介したいのです。 このセクションの下部には、最初から設定する際に折りたたまれた ガイドがあります。

`package.json`:

```json
{
  "name": "webdriverio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "wdio run wdio.conf.js"
  },
  "dependencies": {
    "@wdio/cli": "^7.9.1"
  },
  "devDependencies": {
    "@wdio/local-runner": "^7.9.1",
    "@wdio/mocha-framework": "^7.9.1",
    "@wdio/spec-reporter": "^7.9.0"
  }
}
```

[テスト][] コマンドとして公開されたテストスイートとして `WebdriverIO` 設定を実行するスクリプトがあります。 最初に設定するときに、 @wdio/cli `コマンドによって追加されたさまざまな` 依存関係もあります。 In short, these dependencies are for the most simple setup using a local WebDriver runner, [Mocha][] as the test framework, and a simple Spec Reporter.

<details><summary>プロジェクトを一から立ち上げる方法を見たい場合は、ここをクリックしてください</summary>

CLIはインタラクティブであり、あなたは自分で作業するツールを選択することができます。 ガイドの残りの から分岐する可能性が高いことに注意してください。違いを自分で設定する必要があります。

この npm プロジェクトに [WebdriverIO][] CLI を追加しましょう。

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

対話型の config コマンドを実行して、 [WebdriverIO][] テストスイートを設定するには、次のように実行します。

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

## 設定

`package.json` の `テスト` スクリプト `wdio.conf.js` に言及していることに気づいたかもしれません。 テストスイートのほとんどの側面を制御する [WebdriverIO][] 設定ファイルです。

`wdio.conf.js`:

```js
const os = require('os')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

// keep track of the `tauri-driver` child process
let tauriDriver

exports.config = {
  specs: ['./test/specs/**/*.js'],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      'tauri:options': {
        application: '../../target/release/hello-tauri-webdriver',
      },
    },
  ],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  // ensure the rust project is built since we expect this binary to exist for the webdriver sessions
  onPrepare: () => spawnSync('cargo', ['build', '--release']),

  // ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
  beforeSession: () =>
    (tauriDriver = spawn(
      path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process.stderr] }
    )),

  // clean up the `tauri-driver` process we spawned at the start of the session
  afterSession: () => tauriDriver.kill(),
}
```

`exports.config` オブジェクトのプロパティに興味がある場合は、 [ドキュメント][webdriver documentation] を読むことをお勧めします。 For non-WDIO specific items, there are comments explaining why we are running commands in `onPrepare`, `beforeSession`, and `afterSession`. また、仕様が `"./test/specs/**/*.js"`に設定されていますので、仕様を作成しましょう。

## 仕様

仕様には、実際のアプリケーションをテストするコードが含まれています。 テストランナーはこれらの仕様をロードし、自動的に 適切に実行します。 ここで仕様書を指定したディレクトリに作成しましょう。

`test/specs/example.e2e.js`:

```js
// calculates the luma from a hex color `#abcdef`
function luma(hex) {
  if (hex.startsWith('#')) {
    hex = hex.substring(1)
  }

  const rgb = parseInt(hex, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

describe('Hello Tauri', () => {
  it('should be cordial', async () => {
    const header = await $('body > h1')
    const text = await header.getText()
    expect(text).toMatch(/^[hH]ello/)
  })

  it('should be excited', async () => {
    const header = await $('body > h1')
    const text = await header.getText()
    expect(text).toMatch(/!$/)
  })

  it('should be easy on the eyes', async () => {
    const body = await $('body')
    const backgroundColor = await body.getCSSProperty('background-color')
    expect(luma(backgroundColor.parsed.hex)).toBeLessThan(100)
  })
})
```

上部の `luma` 関数は、私たちのテストの1つのヘルパー関数であり、 アプリケーションの実際のテストとは関係ありません。 他のテストフレームワークに精通している場合、 が使用されていることに同様の関数が公開されていることに気づくかもしれません。 例: `describe`, `it`, `expects`. `$` やその公開されたメソッドのような他のAPIは、 [WebdriverIO API docs][] でカバーされます。

## テストスイートの実行

今、私たちはすべての設定と仕様で設定されているので、それを実行しましょう!

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

出力は以下のようになります:

```text
➜  webdriverio git:(main) ✗ yarn test
yarn run v1.22.11
$ wdio run wdio.conf.js

Execution of 1 workers started at 2021-08-17T08:06:10.279Z

[0-0] RUNNING in undefined - /test/specs/example.e2e.js
[0-0] PASSED in undefined - /test/specs/example.e2e.js

 "spec" Reporter:
------------------------------------------------------------------
[wry 0.12.1 linux #0-0] Running: wry (v0.12.1) on linux
[wry 0.12.1 linux #0-0] Session ID: 81e0107b-4d38-4eed-9b10-ee80ca47bb83
[wry 0.12.1 linux #0-0]
[wry 0.12.1 linux #0-0] » /test/specs/example.e2e.js
[wry 0.12.1 linux #0-0] Hello Tauri
[wry 0.12.1 linux #0-0]    ✓ should be cordial
[wry 0.12.1 linux #0-0]    ✓ should be excited
[wry 0.12.1 linux #0-0]    ✓ should be easy on the eyes
[wry 0.12.1 linux #0-0]
[wry 0.12.1 linux #0-0] 3 passing (244ms)


Spec Files:  1 passed, 1 total (100% completed) in 00:00:01

Done in 1.98s.
```

Spec Reporterは、 `test/specs/example.e2eからの3つのテストすべてを示しています。 s <code>` file, with the final report `Spec Files: 1 passed, 1 total (100% completed) in 00:00:01`.

Using the [WebdriverIO][] test suite, we just easily enabled e2e testing for our Tauri application from just a few lines of configuration and a single command to run it! さらに、アプリケーションを修正する必要は全くありませんでした。

[WebdriverIO]: https://webdriver.io/

[テスト]: https://webdriver.io/
[npm]: https://github.com/chippers/hello_tauri
[アプリケーションの設定例]: ./setup.md
[Mocha]: https://mochajs.org/
[webdriver documentation]: https://webdriver.io/docs/configurationfile
[WebdriverIO API docs]: https://webdriver.io/docs/api
