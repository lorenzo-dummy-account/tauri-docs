---
sidebar_label: Windows 代码签名
sidebar_position: 2
---

# Windows - 代码签名指南本地 & 与 GitHub 操作

## 简介

代码签名您的应用程序让用户知道他们下载了您应用的官方可执行文件，而不是某些第三方的恶意软件作为您的应用。 虽然不需要它，但它会提高用户对您应用的信心。

## 必备条件

- Windows - 您可能会使用其他平台，但本教程使用 Powershell 本土功能。
- 有效的 Tauri 应用程序
- 代码签名证书 - 您可以在 [Microsoft 文档][] 列出的服务中获取其中一个。 对于非EV证书可能还有其他的授权超出了该清单所列的权限，请对自己进行比较并自行选择一个。
  - 请务必获得 **代码签名** 证书，SSL 证书无法正常工作！

本指南假定您有标准代码签名证书> 如果您有EV证书， 通常涉及硬件令牌，请跟随您的发行者文档。

:::note

如果您用EV证书在应用程序上签名，它将立即获得Microsoft Smartscreen的信誉积分，并且不会向用户显示任何警告。

如果您选择了通常较便宜并可向个人提供的紫外线证书， Microsoft SmartScreen 仍将在用户下载应用程序时显示警告。 您的证书可能需要一些时间才能建立足够的信誉积分。 您可以选择 [将您的应用程序][] 提交给微软手动审核。 虽然没有保证，但如果应用程序没有包含任何恶意代码。 Microsoft 可能为该特定上传的文件授予额外的信誉积分并可能删除警告。

:::

## 正在开始

我们需要做几件事来让Windows为代码签名做准备。 这包括将我们的证书转换为特定格式，安装此证书，以及解码证书所要求的信息。

### A. 导言 将您的 `.cer` 转换为 `.pfx`

1. 您将需要：

   - 证书文件(我是 `cert.cer`)
   - 私钥文件 (我是 `私钥`)

2. 打开命令提示符并使用 `cd Documents/Certs` 更改当前目录

3. 将您的 `.cer` 转换为 `.pfx` 使用 `openssl pkcs12 -export -in cert.cer -inkey private key.key out certificate.pfx`

4. 您应该被提示输入导出密码 **不要关闭！**

### B. 选举主席团成员 导入您的 `.pfx` 文件到密钥店。

我们现在需要导入我们的 `.pfx` 文件。

1. 将您的导出密码分配给一个变量使用 `$WINDOWS_PFX_PASSWORD = “MYPASSSWORD”`

2. 现在导入证书使用 `导入-Pfxcertificate -FilePath Certs/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_PFX_PASSWORD -Force -AsPlainText)`

### C. 选举主席团成员 准备变量

1. 我们需要证书的 SHA-1 缩略图；您可以使用 `openssl pkcs12 -info -in certificate.pfx` 获取此证书并寻找关注下一个

```
Bag 属性
    localKeyID: A1 B1 B2 B3 B4 A5 B5 A6 B6 A7 B7 A8 B8 B9 A0 B0
```

2. 您将抓取 `localKeyID` 但没有空格。在这个示例中，它将是 `A1B1A2B2A3B3A4B4A5B5B6A7B7A8B8A9B9A0B0`。 这是我们的 `证书缩略图`。

3. 我们需要用于您证书的 SHA 摘要算法 (Hint: 这可能是 `sha256`

4. 我们还需要一个时间戳URL；这是一个用于验证证书签名时间的时间服务器。 我在使用 `http://timestamp.comodoca.com`，但是无论你从哪里获得您的证书都可能有一个。

## 准备 `tauri.conf.json` 文件

1. 现在我们有我们的 `证书缩略图`, `摘要算法`, & `时间戳Url` 我们将打开 `tauri。 onf.json`

2. 在 `tauri.conf.json` 中，您将寻找 `tauri` -> - `bundle` -> `winds` 部分。 你们看到，我们捕获的信息有三个变量。 在下面填写。

```json tauri.conf.json
"windows":
        "certificateThumbprint": "A1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com"
}
```

3. 保存并运行 `yarn | yarn build`

4. 在控制台输出中，您应该看到以下输出。

```
信息: 签名应用
信息: 运行信号工具 "C:\\Program Files (x86)\\Windows Kits\\10\bin\\10.0.19041。 \\x64\\signtool.exe"
信息: "完成添加额外商店\r\n签名成功: 应用程序文件 PATH HERE
```

您已成功签名 `.exe`。

就是这样！ 您已成功签署了您的 .exe 文件。

## BONUS：使用 GitHub 操作签名您的应用程序。

我们还可以创建一个 Workflow 通过GitHub 动作在应用程序上签名。

### GitHub Secrets

我们需要为GitHub 操作的正确配置添加一些GitHub 秘密。 你可以命名这些。

- 您可以查看 [加密秘密][] 指南，说明如何添加 GitHub 秘密。

我们使用的秘密如下：

|         GitHub Secrets         |                                       变量值                                       |
|:------------------------------:|:-------------------------------------------------------------------------------:|
|      WINDOWS_CERTIFICATE       | 您的 .pfx 证书的 Base64 编码版本，可以使用此命令 `certutil -encode certil 证书。pfx base64cert.txt` |
| WINDOWS_CERTIFICATE_PASSWORD |                                证书导出密码时使用的证书 .pfx                                |

### 工作流修改

1. 我们需要在工作流中添加一个步骤来将证书导入到 Windows 环境。 此工作流完成以下工作

   1. 将 GitHub 秘密分配给环境变量
   2. 创建新的 `证书` 目录
   3. 导入 `WINDOWS_CERTIFICATE` 到 tempCert.txt
   4. 使用 `certutil` 来解码从 base64 的 Cert.txt 文件到 `.pfx` 文件。
   5. 移除 tempCert.txt
   6. 导入 `。 fx` 文件进入Windows & Cert 商店将 `WINDOWS_CERTIFICATE_PASSWORD` 转换为导入命令中使用的安全字符串。

2. 我们将使用 [`tauri-action` 发布模板][]。

```yml
名称: 'publish'
on:
  pub:
    branches:
      - release

jobs:
  publish-tauri:
    strategy:
      fail-fas: false
      matrix:
        platform: [macos-latest, 最新的 ubuntu- windows-latest]

    runs-on: ${{ matrix.platform }}
    步骤:
      - 使用: actions/checkout@v2
      - 名称: 设置节点
        使用: actions/setup-node@v1
        with
          node-version: 12
      - 名称: install Rust stability
        uses: actions-rs/toolchain@v1
        with
          toolchain: standing
      - name: install webkit2gtk (Bubuntu only)
        if 矩阵。 latform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-4
      - name: install dependences and building it
        run: yarn && yarn building
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with
          tagName: app-v__VERSION_# 此动作自动替换 \_\_ 为应用程序版本
          releaseName: 'App v__VVERSION__'
          releaseBody: '查看资源下载此版本和安装'。
          releaseDraft: true
          prerelease: false
```

3. 右边的 `-name: 安装应用程序依赖关系并构建它` 你将想要添加以下步骤

```yml
- 名称：如果矩阵，导入窗口证书
  。 latform == 'windows-latest'
  env:
    WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
    WINDOWS_CERTIFICATE_PASWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  run: |
    新项目 -ItemType 目录-路径证书
    Set-Content -Path cert. xt -Value $env:WINDOWS_CERTIFICATE
    certutil -decode certil certil certificate/tempCert.txt certificate/certificate.pfx
    Remove-item -pather -cature -include tempCert. xt
    导入-Pfxcertificate -FilePath certificate/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_CERTIFICATE_PASSWORD -AsPlainText)
```

4. 保存并推送至您的仓库中。

5. 您的 Workflow 现在可以导入您的窗口证书并导入到 GitHub 运行器，从而允许自动注册代码！

[Microsoft 文档]: https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-cert-manage
[将您的应用程序]: https://www.microsoft.com/en-us/wdsi/filesubmission/
[加密秘密]: https://docs.github.com/en/actions/reference/encrypted-secrets
[`tauri-action` 发布模板]: https://github.com/tauri-apps/tauri-action
