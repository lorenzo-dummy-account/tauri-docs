---
sidebar_position: 5
---

# 更新器

## 配置

一旦您的 Tauri项目准备就绪，您需要配置更新器。

在tauri.conf.json 中添加它

```json
"updater":
    "active": tre,
    "endpoints": [
        "https://releases.myapp.com/{{target}}/{{current_version}}"
    ],
    "dialog": try,
    "pubkey": "YOUR_updatER_SIGNATURE_PUBKE_HERE"
}
```

所需的密钥为“活动”、“终点”和“pubkey”；其他是可选的。

“活动”必须是布尔值。 默认情况下，它设置为 false。

“终点”必须是一个数组。 字符串 `{{target}}` 和 `{{current_version}}` 会被自动替换在 URL 中，允许您确定 [服务器端](#update-server-json-format) 如果有更新。 如果指定了多个端点，如果服务器在预定义的超时内没有响应，则更新器会退回。

“对话”如果存在必须是布尔值。 默认情况下，它设置为 true。 如果启用， [事件](#events) 会被关闭作为更新器处理一切。 如果您需要自定义事件，您必须关闭内置对话框。

"pubkey"必须是一个有效的公用钥匙，由Tauri CLI生成。 查看 [签名更新](#signing-updates)。

### 更新请求

Tauri对客户端应用程序提供更新检查的请求无动于衷。

`接受：应用程序/json` 被添加到请求头，因为Tauri负责解析响应。

对于响应的要求和更新的身体格式，响应见 [Server Support](#server-support)。

Your update request must _at least_ include a version identifier so that the server can determine whether an update for this specific version is required.

它还可包括其他识别标准，如操作系统版本， 允许服务器像你所希望的那样提供精细的更新。

您如何包含版本标识符或其他标准是您请求更新的服务器所特有的。 常见的方法是使用查询参数， [配置](#configuration) 显示一个例子。

### 内置对话框

默认情况下，更新程序使用来自 Tauri的内置对话框 API。

![新建更新](https://i.imgur.com/UMilB5A.png)

对话框发布笔记由 [服务器](#server-support) 提供的更新 `笔记` 来表达。 如果用户接受，更新将被下载并安装。 然后，用户被提示重启应用程序。

### Javascript API

:::警告
您需要 _在您的 [tauri配置](#configuration)禁用内置对话框_ 。否则，javascript API 将无法工作。
:::

```js
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
try {
  const { shouldUpdate, manifest } = await checkUpdate()
  if (shouldUpdate) {
    // display dialog
    await installUpdate()
    // install complete, restart the app
    await relaunch()
  }
} catch (error) {
  console.log(error)
}
```

### 事件

:::注意事项

您需要 _在您的 [tauri配置](#configuration)中禁用内置对话框_ 。否则，事件不会被排除。

:::

要知道什么时候准备安装更新，您可以订阅这些事件：

#### 初始化更新程序并检查新版本是否可用

##### 如果有新版本可用，则发送事件 `tauri://update-available`。

Event: `tauri://update`

#### 赤色

```rust
window.emit("tauri://update".to_string(), 无)；
```

#### Javascript

```js
从 '@tauri-apps/api/event' 导入 { emit }
emit('tauri://update')
```

#### 监听新的更新可用事件

事件: `tauri://update-available`

发送的数据：

```
服务器
日期。由服务器
正文通知日期
```

#### 赤色

```rust
window.listen("tauri://update-available".to_string(), 移动|msg| 然后
  println!("新版本可用: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-available', function (res) {
  console.log('New version available: ', res)
})
```

#### Emit Install安装和下载事件

您需要释放此事件才能初始化下载并监听 [安装进度](#listen-install-progress)。

Event: `tauri://update-install`

#### 赤色

```rust
window.emit("tauri://update-install".to_string(), 无)；
```

#### Javascript

```js
从 '@tauri-apps/api/event' 导入 { emit }
emit('tauri://update-install')
```

#### 监听安装进度

Event: `tauri://update-status`

发送的数据：

```
状态[错误/错误/错误/错误/错误/错误]
错误字符串
```

当下载开始和安装完成后PENDE将被发出。 然后您可以请求重启应用程序。

当更新程序出现错误时发送错误。 我们建议聆听此事件，即使对话框已启用。

#### 赤色

```rust
window.listen("tauri://update-status".to_string(), 移动|msg| 哇，
  println!("新状态: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-status', function (res) {
  console.log('New status: ', res)
})
```

## 服务器支持

您的服务器应该根据您的客户端问题 [更新请求](#update-requests) 来确定是否需要更新。

如果需要更新 您的服务器应该以 [200 OK][] 的状态代码进行响应，并在主体中包含 [更新 JSON](#update-server-json-format)。

如果不需要更新，您的服务器必须以 [204无内容][] 的状态码响应。

### 更新服务器 JSON 格式

当有可用的更新时，Tauri 预期以下方案响应所提供的更新请求：

```json
很抱歉
  "url": "https://mycompany.example.com/myapp/releases/myrelee.tar.gz",
  "version": "0.0.1",
  "notes": "Theses are some release notes",
  "pub_date": "2020-09-18T12:29:53+01:00",
  "signature": ""
}
```

所需的密钥是“url”、“version”和“签名”；其他是可选的。

"pub_date" 如果存在必须根据 [RFC 3339][date and time on the internet: timestamps] 格式化。

“签名”是Tauri的 CLI 生成的 `.sig` 文件的内容。 请参阅 [签名更新](#signing-updates) 以了解如何设置所需密钥。

### 更新文件JSON格式

备用更新技术使用一个普通的 JSON 文件，将您的更新元数据存储在 S3、gist 或另一个静态文件存储。 Tauri检查版本字段 并且如果运行过程的版本小于所报告的 JSON 之一，且平台是可用的。 它触发了一个更新。 此文件的格式详细如下：

```json
主席:
  "version": "v1.0 ",
  "notes": "测试版本",
  "pub_date": "2020-06-22T19:25:57Z",
  "Platforms": P,
    "darwin-x86_64": P,
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.app.tar。 z"
    },
    "darwin-aarch64": }
      "签名": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1。 .0/silicon/app.app.tar。 z"
    },
    "linux-x86_64":
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.AppImage.tar。 z"
    },
    "windows-x86_64": }
      "签名": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.x64.msi.zip
    }
  }
}
```

请注意，每个平台密钥都在 `OS-ARCH` 格式中。 其中 `OS` 是 `linux`, `darwin` 或 `winds`, 和 `ARCH` 是 `x86_64` `arch64`, `i686` 或 `armv7`.

## Bundler (艺术家)

如果在 `tauri.conf中启用更新程序，Tauri bundler 会自动生成更新工艺品。 son` 如果捆绑包能够定位您的私钥和公钥，您的更新伪影将自动签名。

签名是生成的 `.sig` 文件的内容。 签名可以安全上传到 GitHub 或者公开，如果您的私钥安全。

你可以看到 [如何与CI][artifacts updater workflow] 和 [样品tauri.conf.json][] 捆绑在一起。

### macOS

在 macOS, 我们从整个应用程序创建一个 .tar.gz。 (.app)

```
target/release/bundle
interest-macos
    competition - - app.app
    intention- - app.app.tar.gz (update bundle)
    interest-app.app.tar.gz.sig
```

### 窗口

在 Windows 上，我们从 MSI创建一个 .zip ；当下载和验证时，我们运行 MSI安装。

```
target/release/bundle
intention-- msi
    intention-- app.x64.msi
    intention-- app.x64.msi.zip (update bundle)
    --- app.x64.msi.zig
```

### Linux

在 Linux 上，我们从 AppImage 创建 .tar.gz 。

```
target/release/bundle
└── appimage
    └── app.AppImage
    └── app.AppImage.tar.gz (update bundle)
    └── app.AppImage.tar.gz.sig
```

## 签名更新

我们提供一个内置的签名，以确保您的更新安全地安装。

要签署您的更新，您需要两个东西。

_公钥_ (Pubkey) 应该添加到您的 `tauri.conf.json` 以验证安装前的更新归档。

_私钥_ (私钥) 用于签署您的更新，并且应该与任何人共享。 此外，如果您丢失了此密钥，您将无法向当前用户群发布新的更新。 它是在安全的地方保存它的关键，你可以随时访问它。

要生成您的密钥，您需要使用 Tauri CLI：

```shell
tauri signer generate -w ~/.tauri/myapp.key
```

您有多个选项可用

```
生成密钥以签名文件

USAGE:
    tauri签名生成 [OPTIONS]

选项：
    -f, --force 覆盖私钥，即使它存在于指定路径
    -h, --help 打印帮助信息
    -p, --password <PASSWORD>        在签名时设置私钥密码
    -V, --version 打印版本信息
    -w, --srardkey <WRITE_KEYS>    将私钥写入到文件
```

---

使用Tauri `bundler`签名的环境变量：<br/> 如果设置了这些变量。 捆绑包自动生成并签署更新器手工艺品。<br/> `TAURI_PRIVATE_KEY` 私钥的路径或字符串<br/> `TAURI_KEY_PASWORD` 您的私钥密码 (可选)

[200 OK]: http://tools.ietf.org/html/rfc2616#section-10.2.1
[204无内容]: http://tools.ietf.org/html/rfc2616#section-10.2.5
[date and time on the internet: timestamps]: https://datatracker.ietf.org/doc/html/rfc3339#section-5.8
[artifacts updater workflow]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/.github/workflows/artifacts-updater.yml#L44
[样品tauri.conf.json]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/examples/updater/src-tauri/tauri.conf.json#L52
