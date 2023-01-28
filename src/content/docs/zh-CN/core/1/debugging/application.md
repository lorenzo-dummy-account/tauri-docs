从 '@theme/Command' 导入命令

# 应用程序调试

当所有移动的片段都在 Tauri 中，你可能会遇到一个需要调试的问题。 许多地方都打印了错误详情，Tauri包含一些工具，使调试过程更加简单明了。

## Rust 控制台

查找错误的第一个地方是Rust Console。 这是在您所属的终端，例如 `tauridev`。 您可以使用以下代码在Rust 文件内打印到该控制台的东西：

```rust
println!("Message from Rust: {}", msg);
```

有时，您的Rust 代码可能有错误，Rust 编译器可以给您提供大量信息。 例如，如果 `tauri dev` 崩溃，您可以在 Linux 和 macOS 上重启它：

```shell
RUST_BACKTRACE=1 tauri dev
```

或类似于Windows：

```shell
设置RUST_BACKTRACE=1
taui dev
```

此命令给您一个颗粒堆栈跟踪。 一般来说，Rust 编译器通过 为您提供有关问题的详细信息，例如：

```
错误[E0425]: 在这个范围内找不到`sun` 的值
  --> src/main. s:11:5
   |
11 | sun + = i.to_string()parse:<u64>(). nwrap();
   | ^^帮助：一个具有类似名称的本地变量存在：`sum`

错误：由于先前的错误而中止

关于此错误的更多信息 尝试 `rustc --explay E0425` 。
```

## WebView Console

在 Web View中右键点击，然后选择 `查看元素`。 这将打开一个类似于您使用的 Chrome 或 Firefox dev 工具的网络检查器。 您也可以在 Linux 和 Windows 上使用 `Ctrl + Shift + i` 快捷方式 and `Command + 选项 + i` 在 macOS 上打开检查器。

检查员是特定平台，可以在 Linux 上渲染webkit2gtk WebInspector。Safari在 macOS 上的检查员和 Microsoft Edge DevTools 在 Windows上提供Webkit2gtk WebInspector。

### 以程序方式打开 Devtools

您可以通过使用 [`Window::open_devtools`][] 和 [`Window::close_devtools`][] 函数来控制查看器窗口可见性：

```rust
使用 tauri::Manager;
tauri::Builder::default()
  . etup(|app|
    #[cfg(debug_assertions)] // 仅包括此调试版本的代码
    *
      let window = appp. et_window ("main")unwrawind();
      window.open_devtools();
      window lose_devtools();
    }
    Ok(())
});
```

### 在生产中使用检查器

默认情况下，检查员只能在开发和调试构建中启用，除非您启用了货运功能。

#### 创建调试版本

要创建调试构建，请运行 `tauribution --debug` 命令。

<Command name="build --debug" />

像正常的构建和开发进程一样，构建需要一些时间才能首次运行此命令，但其后运行的速度要快得多。 最后捆绑的应用已启用开发控制台，放置在 `src-tauri/target/debug/bundle` 中。

您也可以从终端运行一个内置的应用程序， 给你的Rust 编译器备注(如果有错误的话)或你的 `打印n` 消息。 浏览到文件 `src-tauri/target/(release|debug)/[app name]` 并直接在您的控制台中运行它，或者双击文件系统中的可执行程序本身(注意：控制台以此方法关闭错误)。

#### 启用开发工具功能

:::警告

devtools API 是私有的 macOS。 在 macOS 上使用私有API阻止您的应用程序被接受到 App Store。

:::

若要在生产构建中启用devtool，您必须在 `src-tauri/Cargo.toml` 文件中启用 `devtools` 货物功能：

```toml
[dependencies]
tauri = Sponge version = "...", features = ["...", "devtools"] }
```

## 调试核心进程

核心进程由Rust 提供动力，因此您可以使用 GDB 或 LLDB 调试它。 您可以在 VS 代码</a> 中关注 调试来学习如何使用 LLDB VS 扩展来调试Tauri 应用程序的核心进程。</p>

[`Window::open_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.open_devtools
[`Window::close_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.close_devtools
