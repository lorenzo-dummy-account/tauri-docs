从 '@theme/Tabs' 导入标签页 从 '@theme/TabItem' 导入标签页

# Selenium

:::info 示例应用程序
这 [Selenium][] 指南期望您已经经历了 [示例应用程序设置][] 以便一步一步跟进 。 一般性资料可能仍然会有帮助。
:::

此 WebDrive 测试示例将使用 [Selenium][] 和一个流行的 Node.js 测试套装。 您预期已经有 个节点。 s 已安装， 与 `npm` 或 `yarn` 一起虽然 [完成了示例项目][] 使用了 `yarn`.

## 创建测试目录

让我们在我们的项目中创建一个写入这些测试的空间。 我们将使用 这个示例项目的嵌套目录，因为我们稍后还会跨越其他框架。 但你通常只需要使用一个。 创建 我们将使用 `mkdir -p webdriver/selenium` 的目录。 The rest of this guide will assume you are inside the `webdriver/selenium` directory.

## 初始化Selenium 项目

我们将使用原有的 `包。 son` 来启动这个测试套件，因为我们已经选择了特定的 依赖关系来使用，并且想要显示一个简单的工作解决方案。 本节底部有一个折叠的 指南，说明如何从头开始设置它。

`package.json`:

```json
{
  "name": "selenium",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "mocha"
  },
  "dependencies": {
    "chai": "^4.3.4",
    "mocha": "^9.0.3",
    "selenium-webdriver": "^4.0.0-beta.4"
  }
}
```

我们有一个脚本运行 [Mocha][] 作为一个测试框架，暴露在 `test` 命令。 我们还有各种依赖关系 我们将用来运行测试。 [Mocha][] 作为测试框架， [Chai][] 作为申请库， 和 [`selenium-web驱动程序`][] 是节点. s [Selenium][] 软件包。

<details><summary>如果你想看到如何从头开始设置一个项目，请点击我</summary>

如果你想从头安装依赖关系，只需运行以下命令。

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

我还建议在 `软件包中添加 <code>"test": "mocha"` 项目。 son</code> `"scripts"` 密钥可以简单地调用 Mocha 

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

## 测试

与 [WebdriverIO 测试套件](webdriverio#config)不同， Selenium 并不是带有测试套件从箱子里出来的。 让开发者把这些套件建立起来。 我们选择 [Mocha][], 它是相当中性的，与WebDrivers没有关系。 所以我们的脚本需要做一点工作，以正确的顺序为我们建立一切。 [Mocha][] expects a testing file at `test/test.js` by default, so let's create that file now.

`test/test.js`:

```js
const os = require('os')
const path = require('path')
const { expect } = require('chai')
const { spawn, spawnSync } = require('child_process')
const { Builder, By, Capabilities } = require('selenium-webdriver')

// 创建到预期应用程序二进制的路径
const 应用程序=路径。 esolve(
  __dirname,
  '...',
  '..',
  '。 ,
  'target',
  'release',
  'hello-tauri-webdriver'
)

// 保持我们创建的 web 驱动实例的跟踪
让驱动程序

// 保持我们启动的 tauri-drive 进程的跟踪
let tauriDriver

before (async function (async function () }
  // 设置超时为 2 分钟以允许程序构建如果需要为
  imeout(120000)

  // 确保程序已经构建
  spawnSync('cargo', ['build') '--release'])

  // 启动tauri驱动程序
  tauriDrive = spawn(
    路径。 esolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
    [],
    tdout, process.stderr]}
  )

  const capacities = new Capabilities()
  capacities et('tauri:options', { application })
  功能。 etBrowserName('wry')

  // 启动 webdriver 客户端
  driver = 等待新Builder()
    。 ithCapabilities(能力)
    .usingServer('http://localhost:4444/')
    . uild()
})

after (async function (async function () }
  // stop webdriver session
  等待驱动程序。 uit()

  // 杀死tauri驱动程序
  tauridriver。 ill()
})

描述('Hello Tauri', () => }
  it('should be cordial', async () => *
    const text = 等待驱动程序。 缩进元素(By)。 ss('body > h1').getText()
    expectext).to. atch(/^[hH]ello/)
  })

  it('应该被激发', async () => }
    const text = 等待驱动程序。 indElement(By.css('body > h1').getText()
    expectext).to. atch(/! /)
  })

  it('眼睛应轻松', async () => p.
    // selenium 返回 css 颜色值为 rgb(r, g, b)
    const text = 等待驱动程序
      。 indElement(By.css('body'))
      etCssValue('背景颜色')

    const rgb = text.match(/ ^rgb\(?<r>\d+), (?<g>\d+), (?<b>\d+)\)$/).group
    expect(rgb).to.have. ll.keys('r', 'g', 'b')

    const luma = 0.2126 * rgb.r + 0.7152 * rgb.g + 0。 722 * rgb.b
    exped(luma).to.be.lessThan(100)
  })
})
```

如果您熟悉JS 测试框架， `描述`, `它`, `期望` 看起来应该很熟悉。 我们还有 半复合 `previ()` 和 `after ()` 调用来设置和拆解mocha。 不属于测试本身的行 有注释解释设置和拆解代码。 如果您熟悉来自 [WebdriverIO 示例](webdriverio#spec)的 Spec 文件，， 您注意到更多不测试的代码，因为我们必须设置一些 更多与Web驱动程序相关的项目。

## 运行测试套件

现在我们都是用我们的依赖和测试脚本设置的，让我们运行它！

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
对齐：(主要) 三丁二烯试验
yarn 运行v1.22。 1
$ Mocha


  Hello Tauri
    :very_check_mark: should be cortal (120ms)
    :very_check_mark: should be expressed
    :very_check_mark: should be facilitated on the phys


  3 passes (588ms)

Done in 0 第 3 条
```

我们可以看到我们的 `你好 Tauri` 我们用 `decribe 创建的甜蜜` 我们用 `创建的所有3个项目` 通过他们的 测试！

有 [Selenium][] 和一些连接到测试套装的情况，我们刚刚启用了e2e 测试，但没有修改我们的 Tauri 应用程序！

[Selenium]: https://selenium.dev/
[完成了示例项目]: https://github.com/chippers/hello_tauri
[示例应用程序设置]: ./setup.md
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[`selenium-web驱动程序`]: https://www.npmjs.com/package/selenium-webdriver
