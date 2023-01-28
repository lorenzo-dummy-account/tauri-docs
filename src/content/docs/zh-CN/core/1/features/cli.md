# 制作你自己的 CLI

Tauri使您的应用能够通过 [clp](https://github.com/clap-rs/clap)获得一个 CLI ，一个强大的命令行参数解析器。 在您的 `tauri.conf中使用简单的 CLI 定义。 son` 文件，您可以定义您的接口并在JavaScript 和/或Rust上读取它的参数匹配图。

## 基本配置

在 `tauri.conf.json`下，您有以下结构来配置接口：

```json title=src-tauri/tauri.conf.json
{
  "tauri": {
    "cli": {
      "description": "", // command description that's shown on help
      "longDescription": "", // command long description that's shown on help
      "beforeHelp": "", // content to show before the help text
      "afterHelp": "", // content to show after the help text
      "args": [], // list of arguments of the command, we'll explain it later
      "subcommands": {
        "subcommand-name": {
          // configures a subcommand that is accessible
          // with `./app subcommand-name --arg1 --arg2 --etc`
          // configuration as above, with "description", "args", etc.
        }
      }
    }
  }
}
```

:::note

所有JSON在这里的配置都只是样本，为了明确起见，还省去了许多其他字段。

:::

## 添加参数

`args` 数组代表其命令或子命令接受的参数列表。 您可以在这里找到更多关于配置 [的详细信息。][tauri config]。

### 位置参数

它在辩论清单中的立场指明了一个立场的论点。 具有以下配置：

```json tauri.conf.json
{
  "args": [
    {
      "name": "source",
      "index": 1,
      "takesValue": true
    },
    {
      "name": "destination",
      "index": 2,
      "takesValue": true
    }
  ]
}
```

用户可以以 `./app tauri.txt 的形式运行您的应用程序。 xt` 和箭头匹配地图将定义 `源` 为 `"tauri"。 xt"` 和 `目标` 为 `"dest.txt"`.

### 命名参数

命名的参数是一对(键值)，键值指明值。 具有以下配置：

```json tauri.conf.json
主席:
  "args": [
    }
      "name": "type",
      "短": "t",
      "takesValue": true
      "multiple": true",
      "可能的值": ["foo", "bar"]
    }
  ]
}
```

用户可以以 `./app --type foo bar`. `运行您的应用程序。 应用 -t foo -t 栏` 或 `。 App --type=foo,bar` 和箭头匹配地图将定义 `类型` 为 `["foo", "bar"]`

### 标记参数

标志参数是一个独立的密钥，其存在或缺席为您的应用程序提供了信息。 具有以下配置：

```json tauri.conf.json
{
  "args": [
    "name": "verbose",
    "short": "v",
    "multipleOccurrences": true
  ]
}
```

用户可以以 `./app -v -v`的方式运行您的应用。 `应用 --verbose --verbose --verbose` 或 `. App -vvv` 和 arg 匹配地图将定义 `详细` 为 `true`用 `发生数 = 3`

## 子命令

一些CLI 应用程序作为子命令有额外的接口。 例如， `git` CLI 有 `git 分支`, `git 提交` 和 `git 推送`. 您可以定义附加嵌套接口与 `子命令` 数组：

```json tauri.conf.json
很抱歉，
  "cli"：format@@
...
    "subcommands":
      "branch":
        "args": […]
      },
      "push":
        "args": […]
      }

  }
}
```

其配置与 root 应用程序配置相同，包含 `描述`。 `长描述`, `args`, 等等。

## 读取匹配

### 赤色

```rust
fn main() v.
  tauri::Builder::default()
    .setup(|app|
      match app.get_cli_matches() v.
        // `matches` 这里是一个 { args, subcommand } 的结构。
        // `args`是`HashMap<String, ArgData>`，`ArgData` 是一个结构的 { value, occurrences }
        // `subcommand` 是 `Option<Box<SubcommandMatches>>` ，其中`SubcommandMatches` 是一个 { name, matches } 的结构。
        Ok(matches) => {
          println!("{:?}", matches)
        }
        Err(_) => {}
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### JavaScript

```js
import { getMatches } from '@tauri-apps/api/cli'

getMatches().then((matches) => {
  // do something with the { args, subcommand } matches
})
```

## 完整文档

您可以在这里找到更多关于 CLI 配置 [的信息][tauri config]。

[tauri config]: ../../api/config.md#tauri

[tauri config]: ../../api/config.md#tauri
