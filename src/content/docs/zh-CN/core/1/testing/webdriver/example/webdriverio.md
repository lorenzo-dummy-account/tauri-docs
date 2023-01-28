从 '@theme/Tabs' 导入标签页 从 '@theme/TabItem' 导入标签页

# WebdriverIO

:::info 示例应用程序
这 [WebdriverIO][] 指南指望您已经经历了 [示例应用程序设置][] 按步就班完成 一般性资料可能仍然会有帮助。
:::

此 WebDrive 测试示例将使用 [WebdriverIO][]及其测试套装。 预计它将有新的节点。 s 已安装 与 `npm` 或 `yarn` 一起虽然 [完成了示例项目][] 使用了 `yarn`.

## 创建测试目录

让我们在我们的项目中创建一个写入这些测试的空间。 我们将使用 这个示例项目的嵌套目录，因为我们稍后还会跨越其他框架。 但你通常只需要使用一个。 创建 我们将使用 `mkdir -p webdriver/webdriverio` 的目录。 本指南的其余部分假定您位于 `webdriverio` 目录内。

## 正在初始化 WebdriverIO 项目

我们将使用原有的 `包。 son` to bootstrap 此测试套件，因为我们已经选择了具体 [WebdriverIO][] 配置选项，并且想要展示一个简单的工作解决方案。 本节的底部有一个从零开始设置它的折叠 指南。

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

我们有一个运行 [WebdriverIO][] 配置的脚本作为测试套件暴露于 `test` 命令。 当我们首次设置时，我们也有由 `@wdio/cli` 命令添加的各种 依赖关系。 简而言之，这些依赖关系是 使用本地Web司机运行器最简单的设置。 [Mocha][] 作为测试框架和一个简单的Spec Reporter。

<details><summary>如果你想看到如何从头开始设置一个项目，请点击我</summary>

CLI 是交互式的，您可以选择与自己一起工作的工具。 请注意，您可能会与指南的其余的 不同，您需要自己设置差异。

让我们把 [WebdriverIO][] CLI 添加到此 npm 项目。

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

然后运行交互式配置命令来设置 [WebdriverIO][] 测试套装，然后您可以运行：

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

## 配置

您可能已经注意到，我们 `package.json` 中提到了一个文件 `wdio.conf.js` 中的 `测试` 脚本。 就是 [WebdriverIO][] 配置文件，它控制了我们测试套件的大多数方面。

`wdio.conf.js`:

```js
const os = require('os')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

// 保持跟踪`tauri-driver` 子进程
let tauriDriver

exports. onfig = □
  specs: ['./test/specs/**/*. s'],
  最大实例: 1,
  能力: [

      最大实例: 1,
      'tauri:options': □
        application: '。 /... target/release/hello-tauri-webdriver'，
      }，
    }，

  记者：['spec']，
  framework：'mocha'，
  mochaOps： {
    ui: 'bdd',
    timeout: 60000,
  }

  // 确保错误项目是构建的，因为我们期望这个二进制文件将存在于webdriver session
  onPrepare: () => spawnSync('cargo') ['build', '--release']),

  // 确保我们在会话开始前运行`tauri-driver` ，以便我们能够代理网络驱动请求
  会前: () =>
    (tauriDriver = spawn(
      路径。 esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      tderr]}
    ),

  // 清理我们在会话开始时生成的 "tauri-driver" 进程
  会后: () => tauridriver. ill(),
}
```

如果您对 `exports.config` 对象上的属性感兴趣，我 [建议阅读文档][webdriver documentation] 对于非 WDIO 特定项目，有人评论解释我们为什么在 `onRepare`， `会前会议`, 和 `会后` 我们的投影也被设置为 `"./test/specs/**/*.js"`, 所以让我们现在创建一个Spec。

## 速度

Spec包含测试您实际应用程序的代码。 The test runner will load these specs and automatically run them as it sees fit. 让我们现在在我们指定的目录中创建我们的速度吧。

`测试/旁观/示例.e2e.js`:

```js
// 从十六进制颜色`#abcdef`
函数luma(十六进制)中计算luma。如果(十六进制)请
  (十六进制) 。 tartsWOR('#'))
    hex = 十六。 ubstring(1)
  }

  const rgb = parseInt(hex, (十六)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> > 8) & 0xff
  const b = (rgb >> 0) & 0xff
  return 0 126 * r + 0.7152 * g + 0. 722 * b
}

说明('Hello Tauri', () => *
  it('should be cordial'), async () => @un.org
    const header = 等待$('body > h1')
    const text = 等待header。 etText()
    预期(文本)。 oMatch(/^[hH]ello/)
  })

  it('应该被激发', async () => }
    const header = 等待$('body > h1')
    const text = 等待header etText()
    预期(文本)。 oMatch(/! /)
  })

  it('眼睛应轻松', async () => *
    const body = 等待$('body')
    const backgroundColor = 等待身体. etCSSProperty('background-color')
    exped(luma(backgroundColor.parsed.hex).toBeLessThan(100)
  })
})
```

顶部的 `luma` 函数只是我们测试之一的助手功能，与应用程序 的实际测试无关。 如果您熟悉其他测试框架，您可能会注意到类似的函数被使用了 。 例如 `描述`, `它`, 和 `期望`. The other APIs, such as items like `$` and its exposed methods, are covered by the [WebdriverIO API docs][].

## 运行测试套件

现在我们都已经设置了配置，我们来运行它！

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

我们应该看到以下输出：

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

我们看到Spec Reporter告诉我们， `test/specs/example.e2e的所有3个测试。 s` 文件，连同最后报告 `Spec 文件：1 已通过, 1 total (100% 已完成) ，以00:00:01`

使用 [WebdriverIO][] 测试套装， 我们刚刚从几行 配置和运行它的单个命令启用了我们的Tauri应用程序的 e2e 测试！ 更有甚者，我们根本不必修改应用程序。

[WebdriverIO]: https://webdriver.io/
[完成了示例项目]: https://github.com/chippers/hello_tauri
[示例应用程序设置]: ./setup.md
[Mocha]: https://mochajs.org/
[webdriver documentation]: https://webdriver.io/docs/configurationfile
[WebdriverIO API docs]: https://webdriver.io/docs/api
