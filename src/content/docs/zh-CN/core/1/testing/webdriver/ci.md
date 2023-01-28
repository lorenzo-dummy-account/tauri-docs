# 连续集成

Utilizing Linux and some programs to create a fake display, it is possible to run [WebDriver][] tests with [`tauri-driver`][] on your CI. The following example uses the [WebdriverIO][] example we [previously built together][] and GitHub Actions.

这意味着以下假设：

1. 当运行 `cargo building --release` 时，Tauri应用程序就在资源库根和二进制构建中。
2. [WebDriverIO][] 测试运行器在 `webdriverio` 目录中，当 `yarn 测试` 在那个 目录中使用时运行。

以下是 `.github/workflows/webdriver.yml 上评论的 GitHub 操作流程文件`

```yaml
# 在仓库推送至
时运行此动作： [push]

# 我们工作流的名称
名称：WebDriver

作业：
  # 单项作业命名测试
  测试：
    # 测试作业的显示名称
    名称：WebDriverIO 测试运行器

    # 我们想要在最新的 linux 环境中运行
    运行：ubuntu-最新

    # 我们的任务运行步骤**order**
    步骤：
      # 检查工作流运行器上的代码
      - 使用：动作/校验@v2

      # 安装系统依赖关系。Tauri 需要编译Linux 。
      # note the extra dependencies for `tauri-driver` to run which are: `webkit2gtk-driver` and `xvfb`
      - name: Tauri dependencies
        run: >-
          sudo apt-get update &&
          sudo apt-get install -y
          libgtk-3-dev
          libayatana-appindicator3-dev
          libwebkit2gtk-4.0-dev
          webkit2gtk-driver
          xvfb

      # install the latest Rust stable
      - name: Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      # we run our rust tests before the webdriver tests to avoid testing a broken application
      - name: Cargo test
        uses: actions-rs/cargo@v1
        with:
          command: test

      # build a release build of our application to be used during our WebdriverIO tests
      - name: Cargo build
        uses: actions-rs/cargo@v1
        with:
          command: build
          args: --release

      # install the latest stable node version at the time of writing
      - name: Node v16
        uses: actions/setup-node@v2
        with:
          node-version: 16.x

      # install our Node.js dependencies with Yarn
      - name: Yarn install
        run: yarn install
        working-directory: webdriver/webdriverio

      # install the latest version of `tauri-driver`.
      # note: the tauri-driver version is independent of any other Tauri versions
      - name: Install tauri-driver
        uses: actions-rs/cargo@v1
        with:
          command: install
          args: tauri-driver

      # run the WebdriverIO test suite.
      # 我们通过 `xvfb-run` (我们先前安装的依赖) 运行一个假的
      # 显示服务器，允许我们的应用程序在不更改代码
      - 名称: WebdriverIO
        运行: xvfb-run yarn 测试
        working-directory: webdriver/webdrierio
```

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[WebdriverIO]: https://webdriver.io/
[WebDriverIO]: https://webdriver.io/
[previously built together]: ./example/webdriverio.md
