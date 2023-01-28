---
sidebar_position: 5
---

# 跨平台汇编

Tauri relies heavily on native libraries and toolchains, so meaningful cross-compilation is **not possible** at the current moment. 下一个最好的选项是使用在 [GitHub 操作][]上托管的 CI/CD 管道进行编译 Azure Pipelines、GitLab或其他选项。 管道可以运行每个平台的编译，同时使编译和释放过程更加容易。

为了便于安装，我们目前提供 [Tauri 操作][]，一个运行在所有支持平台上的 GitHub 动作。 编译您的软件，生成必要的工件，并将它们上传到新的GitHub 版本。

## Tauri GitHub Action

Tauri Action利用GitHub Action同时构建您的应用程序为 macOS 的 Tauri本机二进制文件 Linux和Windows自动创建一个 GitHub 版本。

此 GitHub 动作也可以用作您的 Tauri应用的测试管道， 即使您不想创建一个新版本，保证编译在所有平台上运行良好的每个拉取请求。

::::info 代码签名

若要在您的工作流中同时为 Windows 和 macOS 设置代码签名，请遵循每个平台的特定指南：

- [使用 GitHub 操作符号签名][]
- [使用 GitHub 操作 macOS 代码签名][]

:::

### 正在开始

要设置 Tauri 动作，您必须先设置 GitHub 仓库。 你可以在一个没有配置Tauri的仓库使用此操作，因为它在构建之前自动初始化Tauri并配置它来使用你的工艺品。

转到您的 GitHub 项目上的动作选项卡，然后选择"新工作流"，然后选择"自己设置一个工作流"。 用 [Tauri Action production buildflow example][] 替换该文件。 或者，您可以在此页面底部基于 [示例设置工作流](#example-workflow)

### 配置

您可以使用 `配置路径`, `远程路径` 和 `图标路径` 选项配置Tauri。 详细信息请参阅“Readme”。


<!-- FIXME: tauriScript is currently broken.
  Custom Tauri CLI scripts can be run with the `tauriScript` option. So instead of running `yarn tauri build` or `npx tauri build`, `${tauriScript}` will be executed. This can be useful when you need custom build functionality such as when creating Tauri apps e.g. a `desktop:build` script.
-->

当您的应用不在仓库的根目录中，请使用 `projectPath` 输入。

您可以修改工作流名称，更改触发器， 并添加更多步骤，如 `npm 运行行` 或 `npm 运行测试`。 重要的部分是在工作流的末尾保留下面一行， 因为这将运行构建脚本并发布艺术品：

```yaml
- 使用：tauri-apps/tauri-action@v0
```

### 如何触发

在以上链接的README 示例中发布的工作流是由推送“发布”分支触发的。 该操作使用 `tauri.config.json` 指定的应用程序版本自动为 GitHub 版本创建一个标签和标题。

您也可以在推送“app-v0.7.0”等版本标签时触发工作流。 为此您可以更改发布工作流的起点：

```yaml
姓名：发布
on：
  推送：
    标签：
      - 'app-v*'
  workflow_paich：
```

### Workflow 示例

下面是一个示例工作流，它已经设置，每次在git上创建一个新版本时运行。

此工作流在 Windows 、 Ubuntu 和 macOS 最新版本上设置环境。 `jobs.release.strategy.matrix` 平台数组包含 `macos-最新`, `ubuntu-20.04`和 `窗口最新`。

工作流采取的步骤是：

1. 使用 `actions/checkout@v3 结帐资源库`
2. 使用 `actions/setup-node@v3` 设置全局npm/yarn/pnpm 软件包数据的节点LTS和缓存。
3. 使用 `dtolnay/rust-toolchain@stable` 和 `swatinem/rust-cache@v2` 为 `目标/` 文件夹设置Rust和缓存。
4. 安装所有依赖关系并运行构建脚本(适用于 web 应用)。
5. 最后，它使用 `tauri-apps/tauri-action@v0` 来运行 `tauri构建`, 生成工件，并创建GitHub 版本。

```yaml
名称
发布于：
  推送：
    标签：
      - 'v*'
  workflow_paich：

jobs：
  release:
    strategy：
      fail-fast：false
      矩阵：
        平台：[macos-latest, ubuntu-20。 4, windows-latest]
    runs-on: ${{ matrix.platform }}
    步骤:
      - 名称: 结帐仓库
        使用: actions/checkout@v3

      - 名称: 安装依赖关系(仅在ubuntu)
        如果矩阵的话。 latform == 'ubuntu-20.04'
        # 如果您不使用系统托盘功能，您可以删除 libayatana-appindicator3-dev
        运行：|
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4 -dev libayatana-appindicator3-dev librsvg2-dev

      - 名称：Rust setup
        uses: dtolnay/rust-toolchain@start

      - 名称：Rust cache
        uses: swatinem/rust-cache@v2
        with
          workspaces: '. src-tauri -> target'

      - 名称：同步节点版本和设置缓存
        uses: actions/setup-node@v3
        with
          node-version: 'lts/*'
          cache: 'yarn' # 将其设置为 npm, yarn 或 pnpm

      - 名称：安装应用程序依赖关系并构建web
        # 删除&& yarn build`，如果你在 `pre-BuildCommand`
        运行：yarn && yarn building # 将其更改为 npm， yarn 或 pnpm

      - 名称：生成应用程序
        用法：tauri-apps/tauri-action@v0

        env：
          GITHUB_TOKEN：${{ secrets.GITHUB_TOKEN }}
        与
          标签：${{ github.ref_name }} # 只有当您的工作流触发到新标签时才能使用。
          releaseName: 'App name v__VERSION__' # tauri-action replace \_\_VERSION\__
          releaseBody：“查看要下载并安装此版本的资源。”
          releaseDraft: true
          prerelease: false
```

### GitHub 环境令牌

GitHub Token 是由 GitHub 自动为每次运行的工作流发布的，无需进一步配置，这意味着不存在秘密泄漏的风险。 但这个令牌在运行工作流时仅有读取权限，您可能会得到一个“无法通过集成访问的资源”错误。 如果发生这种情况，您可能需要添加此令牌的写权限。 要做到这一点，请前往您的GitHub 项目设置，然后选择动作，向下滚动到"工作流权限"并检查"读写权限"。

您可以看到GitHub 令牌传递到下面的工作流：

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 使用说明

请务必检查 GitHub 动作</a> 的 文档，以更好地了解此工作流程是如何运作的。 注意阅读GitHub 操作的 [使用限额、账单和管理][usage limits billing and administration] 文档。 一些项目模板可能已经实现此 GitHub 动作工作流程，如 [tauri-svelte模板][]。 您可以在未配置Tauri的仓库中使用此操作。 在构建之前自动初始化并配置它来使用您的 web 工艺品。</p>

[Tauri 操作]: https://github.com/tauri-apps/tauri-action
[Tauri Action production buildflow example]: https://github.com/tauri-apps/tauri-action#creating-a-release-and-uploading-the-tauri-bundles
[GitHub 操作]: https://docs.github.com/en/actions
[usage limits billing and administration]: https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration
[tauri-svelte模板]: https://github.com/probablykasper/tauri-svelte-template
[使用 GitHub 操作符号签名]: ../distribution/sign-windows.md#bonus-sign-your-application-with-github-actions
[使用 GitHub 操作 macOS 代码签名]: ../distribution/sign-macos.md#example
