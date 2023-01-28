---
sidebar_position: 7
---

# 嵌入外部二进制文件

您可能需要嵌入依赖于二进制程序才能使您的应用程序发挥作用，或阻止用户安装额外的依赖关系(如Node.js或 Python)。 我们把这个二进制文件称为 `边形`。

捆绑您选择的二进制文件。 您可以在您的 `tauri中添加 <code>外部` 属性到 `tauri > 捆包` 对象 onf.json</code>

在这里查看更多关于 tauri.conf.json 配置 [的][tauri.bundle]。

`外部Bin` 需要一个具有绝对路径或相对路径的字符串列表。

下面是一个示例来说明配置。 这不是完整的 `tauri.conf.json` 文件：

```json
主席:
  "tauri": format@@
    "bundle": format@@
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relative/path/to/binary",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": P,
      "shell": P,
        "sidecar": true
        "scope": [
          }"name": "/absolute/path/to/sidecar", "sidecar": true },
          卷"name": "relative/path/to/binary", "sidecar": true },
          ~"name": "binaries/my-sidecar", "sidecar": true }
        ]
      }
    }
  }
 } 
 }
```

具有相同名称和 `-$TARGET_TRIPLE` 后缀必须存在于指定路径。 例如， `"外部位"：["binaries/my-sidecar"]` 需要 a `src-tauri/binaries/my-sidecar-x86_64-unknux-gnu` 可执行文件在 Linux 上。 您可以通过运行以下命令找到当前平台的目标三重：

```shell
rustc -Vv | grep host | cut -f2 -d' '
```

下面是一个 Node.js 脚本，将目标三重附加到二进制：

```javascript
const execa = require('execa')
const fs = require('fs')

let extension = ''
if (process.platform === 'win32') {
  extension = '.exe'
}

async function main() {
  const rustInfo = (await execa('rustc', ['-vV'])).stdout
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
  if (!targetTriple) {
    console.error('Failed to determine platform target triple')
  }
  fs.renameSync(
    `src-tauri/binaries/sidecar${extension}`,
    `src-tauri/binaries/sidecar-${targetTriple}${extension}`
  )
}

main().catch((e) => {
  throw e
})
```

## 从 JavaScript 运行

在 JavaScript 代码中，导入 `shell` 模块上的 `命令` 类并使用 `sidecar` 静态方法。

请注意，您必须配置允许列表才能启用 `shell > sidecar` 并在 `shell > 范围` 配置所有二进制文件。

```javascript
从 '@tauri-apps/api/shell' 导入 { Command }
// 或者使用 `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` 是在 `tauri上指定的 EXACT 值。 onf.json > tauri > bundle > externalBin`
const 命令 = Command.sidecar('binaries/my-sidecar')
const output = 等待command.execute()
```

## 从Rust运行它

在 Rust 一侧从 `tauri::api::process` 模块导入 `命令` 结构：

```rust
// `new_sidecar()` 只需要文件名，不需要整个路径就像JavaScript
let (mut rx, mut child) = Command::new_sidecar("my-sidecar")
  xpet("创建我的二进制命令失败")
  pawn()
  xpect("生成边形失败");

tauri::async_runtime::spawn(async move }
  // 读取诸如stdout等事件
  while let (event) = rx. 页：1 请稍候，然后
    如果let CommandEvent::Stdout(line) = event volv.
      window
        mit("message", 有(格式!("{}", line)))
        xpet("未能释放事件")；
      // 写入stdin
      小孩。 Rite("message from Rust\n".as_bytes()).unwrawrapp();
    }
  }
});
```

请注意，您必须启用 **process-command-api** 货运功能 (Tauri's CLI 将在您更改配置后为您这样做)：

```toml
# Cargo.toml
[dependencies]
tauri = Sponge version = "1", features = ["process-command-api", ...］
```

## 传递参数

您可以将参数传递给Sidecar命令，就像您想运行正常的 `命令`一样(见 [限制访问命令 API][])。

首先，定义在 `tauri.conf.json` 中需要传递到 Sidecar 命令的参数：

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "/absolute/path/to/sidecar",
        "relative/path/to/binary",
        "binaries/my-sidecar"
      ]
    },
    "allowlist": {
      "shell": {
        "sidecar": true,
        "scope": [
          {
            "name": "binaries/my-sidecar",
            "sidecar": true,
            "args": [
              "arg1",
              "-a",
              "--arg2",
              {
                "validator": "\\S+"
              }
            ]
          }
        ]
      }
    }
  }
}
```

然后调用侧边栏命令，在 **中传递所有** 参数作为数组：

```js
从 '@tauri-apps/api/shell' 导入 { Command }
// 或者使用 `window.__TAURI__.shell.Command`
// `binaries/my-sidecar` 是在 `tauri上指定的 EXACT 值。 onf.json > tauri > bundle > externalBin`
// 注意到 args 数组与 EXACTLY 指定的 "tauri" 匹配。 Original: ENGLISH
const 命令 = Command.sidecar('binaries/my-sidecar', ['arg1', '-a', '--arg2', 'any-string-the-matches-the-validator')])
const output = 等待command.execute()
```

## 在 Sidecar 上使用 Node.js

Tauri [sidecar 示例][] 演示如何使用 sidecar API 来运行Tauri上的 Node.js 应用程序。 它使用 [pkg][] 编译了Node.js 代码，并使用上面的脚本来运行它。

[tauri.bundle]: ../../api/config.md#tauri.bundle
[sidecar 示例]: https://github.com/tauri-apps/tauri/tree/dev/examples/sidecar
[限制访问命令 API]: ../../api/js/shell.md#restricting-access-to-the-command-apis
[pkg]: https://github.com/vercel/pkg
