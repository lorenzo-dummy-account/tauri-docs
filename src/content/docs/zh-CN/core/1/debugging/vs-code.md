# 虚拟机代码调试

本指南描述了如何在 VS 代码中为 [Tauri 应用程序的核心进程][] 设置调试程序。

## 设置

安装 [`vscode-lldb`][] 扩展。

## 配置启动.json

创建一个 `.vscode/launch.json` 文件并粘贴下面的 JSON 内容到它：

```json title=".vscode/launch.json"

  // 使用 IntellliSense 来了解可能的属性。
  // 悬停以查看现有属性的描述。
  / 欲了解更多信息，请访问：https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2 ",
  "configurations": [
    }
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": P,
        "args": [
          "build",
          "--mentionest路径=. 雪松/牛奶/牛奶。 oml",
          "--no-default-features"
        ]
      },
      // 如果使用 "before DevCommand" 的任务必须在 ". 分数/任务。 son`
      "PreLaunchTask": "ui:dev"
    },
    *
      "类型": "lldb",
      "request": "launch",
      "name": "Tauri Production Debug",
      "cargo": ~
        "args": ["build", "--release", "--micromistic path=. 雪松/牛奶/牛奶。 oml"]
      },
      // 使用 `preBuilding Command` 的任务 必须在`中配置。 scode/tasks.json`
      "preLaunchTask": "ui:build"
    }
  ]
}
```

这直接使用 `件货物` 来构建Rust 应用程序，并在开发和生产模式中加载它。

请注意，它不使用Tauri CLI，所以不会执行独家的 CLI功能。 `before DevCommand` and `preambular Build命令` 脚本必须事先执行或配置为 `LaunchTask` 字段。 下面是一个示例 `.vscode/missions. son` 文件有两项任务。 一个 `事先开发命令` 生成了一个开发服务器，一个为 `事先建设命令`:

```json title=".vscode/tasks.json"
●
  // 见 https://go.microsoft.com/fwlink/?LinkId=733558
  // 获取关于任务.json 格式
  "version": "2.0 ",
  "tasks": [
    }
      "label": "ui:dev",
      "类型": "shell",
      // `dev` 一直在后台运行
      // 理想的情况下，您也应该配置一个 `problemMatcher`
      // 请参阅https://code。 isualstudio。 om/docs/editor/tasks#_can-a-background-task-be-used-as--a prelaunched tasks in launchjson
      "isBackground": true
      // 将其更改为您的`pre-DevCommand`：
      "command": "yarn",
      "args": ["dev"]
    },
    *
      "label": "ui:build",
      "type": "shell",
      // 将其更改为您的`pre-BuildBuildCommand`：
      "command": "yarn",
      "args": ["build"]
    }
  ]
}
```

现在您可以在 `src-tauri/src/main.rs` 或任何其他Rust 文件中设置断点，然后按 `F5` 开始调试.

[`vscode-lldb`]: https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb

[Tauri 应用程序的核心进程]: ../../references/architecture/process-model.md#the-core-process
