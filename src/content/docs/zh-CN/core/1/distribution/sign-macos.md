---
sidebar_label: macOS 代码签名
sidebar_position: 4
---

# 代码 macOS 应用程序

本指南提供了 macOS 应用程序的代码签名和公证信息。

:::note

如果您不使用 GitHub 操作来执行OSX DMG的构建，您将需要确保环境变量 <i>CI=true</i> 存在。 欲了解更多信息，请参阅 [tauri-apps/tauri#592][]。

:::

## B. 所需经费

- macOS 10.13.6 或更高版本
- Xcode 10 或更高版本
- 在 [苹果开发者程序中注册的苹果开发者帐户][]

欲了解更多详情，请在发行版</a> 之前阅读开发者关于

macOS 软件公证的文章。</p> 



## tl;dr

通过以下环境变量配置了Tauri代码签名和公证过程：

- `APEL_SIGNING_IDENTITY`: 包含签名证书的密钥链条目的名称。
- `APEL_CERTIFICATE`: base64 string of the `.p12` certificate, exported from keychain. 如果您在钥匙串上没有证书(例如CI 机器)，很有用。
- `APEL_CERTIFICATE_PASSSWORD`: `.p12` 证书的密码。
- `APPEL_ID` and `APPASSWORD`: 您的 Apple 帐户电子邮件和一个 [应用程序专用密码][] 仅需要对应用进行公证。
- `APPEL_API_ISSUER` and `APPEL_API_KEY`: 使用 App Store Connect API 密钥进行身份验证而不是 Apple ID。 只有当您对应用进行公证时才需要。
- `APEL_PROVIDER_SHORT_NAME`: 团队提供者短名。 如果您的 Apple ID 已连接到多个团队， 您必须指定您想要使用的团队的提供者短名称来公证您的应用。 您可以使用 `xcrun altool --list-providers -u "AC_USERNAME" -p "AC_PASSWORD"` 列出您的帐户提供商，如公证 [Workflow](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow) 所解释的。



## 正在签名Tauri应用

签署macOS 应用程序的第一步是从苹果开发者方案获得签名证书。



### 创建签名证书

要创建一个新的签名证书，您必须从您的 Mac 计算机生成一个证书签名请求(CSR) 文件。 [创建证书签名请求][] 描述创建一个 CSR。

在您的苹果开发者帐户上，导航到 [证书， IDs & Profiles 页面][] 然后点击 `创建证书` 按钮打开接口以创建新证书。 选择适当的证书类型(`Apple Distribution` 来提交应用程序到App Store， and `开发者 ID 应用程序` 将应用发送到应用商店以外)。 上传您的 CSR 并将创建证书。

:::note

只有苹果开发者 `账户拥有者` 可以创建 _开发者身份应用程序_ 证书。 但它可以通过创建一个具有不同用户电子邮件地址的CSR与不同的Apple ID关联。

:::  



### 正在下载证书

在 [证书上，IDs & 配置文件页][]，点击您想要使用的证书并点击 `下载` 按钮。 它保存一个 `.cer` 文件，在打开密钥链时安装证书。 密钥链条目的名称表示 `签名身份`， 也可以通过执行 `security find-identity -v -p codesign` 查找。

:::note

签名证书仅在与您的 Apple ID 关联时有效。 无效证书将不会被列入 <i>Keychain 访问 > 我的证书</i> 标签或 <i>security find-identity -v -p codesign</i> 输出。

:::  



### 签署Tauri应用程序

签名配置通过环境变量提供给Tauri Bundler。 您需要配置证书以便使用和可选的身份验证配置来对应用程序进行公证。



#### 证书环境变量

- `APEL_SIGNING_IDENTITY`: 这是 `签名身份` 我们上面强调过的。 它必须定义在本地和在 CI 机器上签名应用。

此外，简化CI上的代码签名过程， 如果您定义 `APPEL_CERTIFICATE` and `APPEL_CERTIFICATE_PASSSWORD` 环境变量的话，Tauri 可以在钥匙链上为您安装证书。

1. 打开 `Keychain 访问` 应用程序并找到您的证书的密钥链条目。
2. 展开条目，双击密钥项目，然后选择 `导出"$KEYNAME`
3. 选择保存 `.p12` 文件的路径并定义导出的证书密码。
4. 将 `.p12` 文件转换为 base64 ，在终端上运行以下脚本： `openssl base64 -in /path/to/certificate.p12 out certificate-base64.txt`
5. 将 `certificate-base64.txt` 文件的内容设置为 `APEL_CERTIFICATE` 环境变量。
6. 将证书密码设置为 `APPEL_CERTIFICATE_PASSWORD` 环境变量。



#### 认证环境变量

这些变量只是为了对应用程序进行公证。

:::note

使用 <i>开发者ID 应用程序</i> 证书时需要公证。

:::  

- `APPEL_ID` and `APPAPE_PASSWORD`: 通过您的 Apple ID进行身份验证， 将 `APPER_ID` 设置为您的 Apple 帐户电子邮件 (例如： `导出 APPER_ID=tauri@icloud)。 om`and the `APPEL_PASSWORD` to a [applicable specific passer][] for the Apple account
- `APPER_API_ISSUER` and `APPEL_API_KEY`: 或者你可以使用 App Store Connect API 密钥进行身份验证。 打开 App Store Connect的 [用户和访问页面][], 选择 `密钥` 标签， 点击 `添加` 按钮并选择一个名称和 `开发者` 访问权限。 `APEL_API_ISSUER` (`签发者ID`) 是在密钥表上方显示的。 和 `APPER_API_KEY` 是该表上 `密钥ID` 列上的值。 您还需要下载私钥， 只能完成一次，并且只有在页面重新加载后才可见。 (按钮显示在新创建的密钥的表格行上)。 私钥文件必须在 `上保存。/private_keys`, `~/private_keys`, `~/. rivate_key` 或 `~/.appstoreconnect/private_key`, 如 `xcrun altools --help` 命令所示。



### 构建应用程序

运行 `tauri构建` 命令时，Tauri bundler 会自动标记并公示您的应用程序与所有这些环境变量设置。



### 示例

下面的示例使用 GitHub 操作来签署一个使用 [Tauri 操作][] 的应用程序。

我们首先定义我们上面列出的环境变量，作为GitHub 上的秘密。

:::note

您可以查看 <a href="https://docs.github.com/en/actions/reference/encrypted-secrets">本指南</a> 了解GitHub 秘密。

:::  

在 `.github/workflows/main.yml` 创建一个 GitHub 发布工作流：



```yml
name: 'publish'
on:
  push:
    branches:
      - release

jobs:
  publish-tauri:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v2
        with:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install app dependencies and build it
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ENABLE_CODE_SIGNING: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        with:
          tagName: app-v__VERSION__ # the action automatically replaces \_\_VERSION\_\_ with the app version
          releaseName: 'App v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          prerelease: false
```


工作流会从 GitHub 拉取秘密，并将其定义为环境变量，然后使用Tauri 动作构建应用程序。 输出是 GitHub 版本，带有签名和公证的 macOS 应用程序。

[tauri-apps/tauri#592]: https://github.com/tauri-apps/tauri/issues/592
[苹果开发者程序中注册的苹果开发者帐户]: https://developer.apple.com/programs/
[应用程序专用密码]: https://support.apple.com/en-ca/HT204397
[applicable specific passer]: https://support.apple.com/en-ca/HT204397
[创建证书签名请求]: https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request
[证书， IDs & Profiles 页面]: https://developer.apple.com/account/resources/certificates/list
[证书上，IDs & 配置文件页]: https://developer.apple.com/account/resources/certificates/list
[用户和访问页面]: https://appstoreconnect.apple.com/access/users
[Tauri 操作]: https://github.com/tauri-apps/tauri-action
