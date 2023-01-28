---
sidebar_position: 6
---

# 减少应用大小

我们正在与Tauri合作，利用现有的系统资源减少应用的环境足迹。 提供不需要运行时评价的编译系统，并提供指南，以便工程师能够在不牺牲性能或安全的情况下更小一些。 通过节省资源，我们正在尽自己的努力帮助我们拯救地球——这是21世纪公司应该关心的唯一底线。

所以，如果您有兴趣学习如何提高您的应用大小和性能，请阅读！

### 您不能改进您无法测量的内容

在你可以优化你的应用之前，你需要找到你应用中占用的空间！ 这里有几个工具可以帮助您：

- **`货运博客`** - 用于确定您应用中占用最多空间的橡胶。 它为您提供了一个精彩、分类的最重要的Rust功能概述。

- **`货物展开`** - [宏][] 使您的rust 代码更简洁，更容易阅读， 但它们也是隐藏的尺寸陷阱！ 使用 [`货物扩展`][cargo-expand] 查看这些宏在立刻下产生了什么。

- **`滚动插件可视化器`** - 一个从你的滚动包生成美丽(和洞察)图形的工具。 非常方便地查出JavaScript依赖关系对您的最后捆绑大小起到的作用。

- **`滚动插件图`** - 你注意到一个依赖关系包含在你的最后前端包中，但你为什么不确定？ [`滚动插件图`][rollup-plugin-graph] 生成您整个依赖图的 Graphviz-compatible 直观图像。

这些只是你可以使用的几个工具。 请确保检查您的前端捆包插件列表更多！

## Checklist

1. [最小化 Javascript](#minify-javascript)
2. [优化依赖关系](#optimize-dependencies)
3. [优化图像](#optimize-images)
4. [删除不需要的自定义字体](#remove-unnecessary-custom-fonts)
5. [允许列表配置](#allowlist-config)
6. [Rust 生成时间优化](#rust-build-time-optimizations)
7. [正在拆解](#stripping)
8. [UPX](#upx)

### 最小化 JavaScript

JavaScript 在典型的Tauri应用程序中占很大比例，因此使JavaScript尽可能轻的重量变得非常重要。

您可以从过多的 JavaScript 捆绑包中选择；热门选项是 [Vite][], [webpack][], 和 [滚动][] 如果配置正确，所有它们都可以生成迷你的 JavaScript，所以请参阅您的 bundler 文档以获取特定的选项。 一般来说，你应该确保：

#### 启用树摇动

此选项将从您的捆包中删除未使用的 JavaScript。 所有流行的捆绑程序默认启用此功能。

#### 启用最小化

最小化会移除不必要的空白，缩短变量名称，并应用其他优化。 大多数绑定程序默认启用此功能； 一个值得注意的异常是 [滚动][], 在那里你需要像 [滚动插件][] 或 [滚动插件][] 这样的插件。

注意：您可以使用诸如 [变量器][] and [esbuild][] 作为独立工具。

#### 禁用源地图

源地图提供了一个愉快的开发者体验，使用编译到 JavaScript 的语言，例如 [TypeScript][]。 由于源图往往相当大，您必须在构建生产时禁用它们。 他们对你的最终用户没有好处，因此实际上已经死去了重量。

### 优化依赖关系

许多受欢迎的库都有更小和更快的替代品，你可以从中选择。

您使用的大部分库依赖于许多库本身。 这样一个初看起来不那么明显的库可能会为您的应用添加 **个数值代码的** megabytes 。

您可以使用 [Bundlephobia][] 来找到JavaScript 依赖的成本。 由于编译器进行了许多优化，检查Rust 依赖的成本通常比较困难。

如果你发现一个似乎过大的库，谷歌周围就有可能有其他人已经有相同的想法并创建了一个替代方案。 一个很好的例子是 [Moment.js][] 和它的 [许多备选方案][you-dont-need-momentjs]。

但要记住： **最好的依赖关系不是依赖于**, 这意味着你应该总是喜欢语言内置而不是第三方包.

### 优化图像

根据 [Http归档][], 图像是网站重量最大的 [贡献者][http archive report, image bytes] 因此，如果您的应用包含图像或图标，请确保优化它们！

You can choose between a variety of manual options ([GIMP][], [Photoshop][], [Squoosh][]) or plugins for your favorite frontend build tools ([vite-imagetools][], [vite-plugin-imagemin][], [image-minimizer-webpack-plugin][]).

请注意， `imagemin` 库里使用的大多数插件都是 [官方未维护][imagemin is unmaintained]。

#### 使用现代图像格式

Formats such as `webp` or `avif` offer size reductions of **up to 95%** compared to jpeg while maintaining excellent visual accuracy. 您可以使用诸如 [Squoosh][] 等工具来尝试在您的 图像上的不同格式。

#### 相应大小图像

没有人欣赏你用你的应用程序运输6K原始图像，所以确保你的图像相应大小。 显示在屏幕上的图像大小应该大于占用屏幕空间较少的图像。

#### 不要使用响应图像

在 Web 环境中，您应该使用 [响应图像][] 动态加载每个用户正确的图像大小。 由于您没有在网络上动态传播图像，使用响应性图像只会不必要地将您的应用程序与多余的副本混合。

#### 删除元数据

直接从相机或存量照片一侧拍摄的图像往往包括有关相机和镜头模型或摄影师的元数据。 不仅那些被浪费的字节，而且元数据 属性也可能包含可能敏感的信息，例如时间； 照片的日期和位置。

### 删除不需要的自定义字体

不要将自定义字体与您的应用配送，而是依靠系统字体。 如果您必须配送自定义字体，请确保它们是现代的，优化格式，如 `woff2`。

字体可能相当大，所以使用已经包含在操作系统中的字体可以减少您应用的足迹。 它也会避免FOUT (无样式文本闪存) 并使您的应用感觉更加“本质”，因为它使用与所有其他应用相同的字体。

如果您必须包含自定义字体， 请确保您将它们包括在现代格式中，例如 `woff2` ，因为这些格式比旧格式小得多。

在您的 CSS 中使用所谓的 **"System Font Stacks"** 有数字 的变异，但这里有3个基本变异来让你开始：

**桑塞夫**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
  sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

**序列号**

```css
字体系列: Iowan 旧风格, Apple Garamond, Baskerville, Times New Roman, Droid
    Serif, 时间、源码专业，系列，苹果彩色表情，Segoe UI 表情，Segoe
    UI 符号；
```

**等宽度**

```css
font-family：ui-monospace，SFMono-Regular，SF Mono，Mensoras，Liberation
    Mono，monospace；
```

### 允许列表配置

您只能通过启用 Tauri API 功能来减少您在 `允许列表` 配置中所需的大小。

The `allowlist` config determines what API features to enable; disabled features will **not be compiled into your app**. 这是一种轻而易举的降低某些额外重量的方式。

典型的 `tauri.conf.json` 的示例：

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "writeFile": true
      },
      "shell": {
        "execute": true
      },
      "dialog": {
        "save": true
      }
    }
  }
}
```

### Rust 生成时间优化

配置您的货运项目以利用Rusts大小优化功能。 [为什么神秘的可执行性很强？][] 提供了一个很好的解释说明为什么这个问题很重要，并且有一个深入的走向。 与此同时， [最小化Rust 二进制大小][] 是更最新的，还有一些额外的建议。

Rust 因为生产大二进制而臭名昭著，但你可以指示编译器优化最终可执行文件的大小。

货物暴露了几个选项来决定编译器如何生成你的二进制。 "推荐"选项为 Tauri 应用：

```toml
[profile.release]
pasic = “中止” # Strit correspondic cleartical
codegen-units = 1 # 编译器一个接一个，所以编译器可以优化
lto = true # 启用优化链接
opt-level = "s" # 优化二进制大小
```

:::note
还有 `选择级别 = “z”` 可用来减少产生的二进制大小。 `"s"` and `"z"` 有时可以小于对方, 所以用您的应用程序来测试它!

对于Tauri示例应用程序来说，我们已经从 `"s"` 中看到了较小的二进制尺寸，但现实世界的应用程序总是不同的。
:::

欲了解每个选项和一堆更多选项的详细说明，请参阅 [货物簿概况部分][cargo profiles]。

#### 禁用Tauri资产压缩

默认情况下，Tauri 使用 Brotli来压缩最终二进制素材。 Brotli有一个庞大的查询表 (~170KiB) 以取得巨大的结果。 但如果你嵌入的资源小于这个或压缩不好，由此产生的二进制可能会比任何节省都大。

可以通过设置 `默认功能` 至 `false` 并指定除 `压缩` 功能以外的所有功能：

```toml
[dependencies]
tauri = Power version = "...", features = ["objc-excition", "wry", default-features = false }
```

#### 不稳定的橡胶压缩功能

:::谨慎
以下建议都是不稳定的功能，需要一个夜间的工具链。 请参阅 [不稳定特性][cargo unstable features] 文档以获取更多关于这涉及的信息。
:::

以下方法涉及使用不稳定的编译器功能，需要夜间的工具链。 如果您没有夜间的工具链+ `故障src` 夜间组件, 请尝试以下几点：

```shell
生长工具链每晚安装
生长组件每晚添加 rust-src --toolchain
```

Rust 标准库是预编译的。 这意味着安装速度更快，但是编译器无法优化标准库。 您可以对您的二进制+依赖关系的其余部分应用最优化选项来应用不稳定标记。 这个标志需要指定您的目标，因此知道您正在攻击的目标三倍。

```shell
货运+夜间生成 --release -Z build-std --targets x86_64-unknown-linux-gnu
```

如果您正在发布配置文件优化中使用 `thenic = "中止"` 您需要确保 `恐慌_中止程序` crate 被编译成std。 此外，额外的标准特性可以进一步减少二进制文件的大小。 以下两者均适用：

```shell
货运+夜间生成 --release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort --target x86_64-unknown-linux-gnu
```

查看不稳定文档了解更多关于 [`-Z build-std`][cargo build-std] 和 [`-Z build-std-features`][cargo build-std-features]

### 正在拆解

使用脱纸工具从您编译的应用中移除调试符号。

您已编译的应用程序包括所谓的“调试符号”，其中包括函数和可变名称。 您的最终用户可能不会关心调试符号，因此这是保存一些字节的非常可靠的方式！

最简单的方法是使用著名的 `脱机` 工具来删除此调试信息。

```shell
脱硫目标/释放/my_applications
```

查看您的本地 `strip` manpage 以获取更多信息和标记，用于指定从二进制文件中删除的信息。

:::info

Rust 1.59 现在有一个内置版本的 `strip`！ It can be enabled by adding the following to your `Cargo.toml`:

```toml
[profile.release]
drit = true # 自动从二进制文件中删除符号。
```

:::

### UPX

UPX, **eXecutable的最终包装**, 是二进制包装中的恐龙。 这个23年来维护良好的工具包是GPLv2型，它得到了相当宽松的使用申报。 我们对许可证的理解是，除非您修改UPX源代码，否则您可以用于任何目的(商业或其他目的)，无需更改您的许可证。

也许您的目标受众的互联网非常慢，或者您的应用需要适合一个小的 USB 棍棒， 而且所有上述步骤都没有带来您所需的节余。 由于我们有最后一个陷阱，我们不会担心：

[UPX][] 压缩你的二进制并创建一个自动提取的可执行文件在运行时自动解压自己。

:::警告
你应该知道这个技术可能会将你的二进制文件标记为 Windows 和 macOS 上的病毒，所以你可以自行斟酌使用。 并一如既往，通过 [Frida][] 验证并进行真正的发行测试！
:::

#### macOS 使用情况

<!-- Add additional platforms -->

```
酿造好安装
yarn tauri构建
upx --ultra-brute src-tauri/target/release/bundle/macos/app. pp/Contents/macOS/app

                        eXecutable的最终包
                            Copyright (C) 1996 - 2018
UPX 3。 5 Markus Oberhumer， Laszlo Molnar & John Reiser Aug 262018

        文件大小比格式名称
    -------------------- ------------ ------------
    963140 ->    274448 28。 0% macho/amd64 应用程序
```

[宏]: https://doc.rust-lang.org/book/ch19-06-macros.html
[cargo-expand]: https://github.com/dtolnay/cargo-expand
[rollup-plugin-graph]: https://github.com/ondras/rollup-plugin-graph
[Vite]: https://vitejs.dev
[webpack]: https://webpack.js.org
[滚动]: https://rollupjs.org/guide/en/
[滚动插件]: https://github.com/TrySound/rollup-plugin-terser
[滚动插件]: https://github.com/TrySound/rollup-plugin-uglify
[变量器]: https://terser.org
[esbuild]: https://esbuild.github.io
[TypeScript]: https://www.typescriptlang.org
[Moment.js]: https://momentjs.com
[you-dont-need-momentjs]: https://github.com/you-dont-need/You-Dont-Need-Momentjs
[Http归档]: https://httparchive.org
[http archive report, image bytes]: https://httparchive.org/reports/page-weight#bytesImg
[imagemin is unmaintained]: https://github.com/imagemin/imagemin/issues/385
[GIMP]: https://www.gimp.org
[Photoshop]: https://www.adobe.com/de/products/photoshop.html
[vite-imagetools]: https://github.com/JonasKruckenberg/imagetools
[vite-plugin-imagemin]: https://github.com/vbenjs/vite-plugin-imagemin
[image-minimizer-webpack-plugin]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin
[Squoosh]: https://squoosh.app
[响应图像]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
[为什么神秘的可执行性很强？]: https://lifthrasiir.github.io/rustlog/why-is-a-rust-executable-large.html
[最小化Rust 二进制大小]: https://github.com/johnthagen/min-sized-rust
[cargo unstable features]: https://doc.rust-lang.org/cargo/reference/unstable.html#unstable-features
[cargo profiles]: https://doc.rust-lang.org/cargo/reference/profiles.html
[cargo build-std]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std
[cargo build-std-features]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std-features
[Bundlephobia]: https://bundlephobia.com
[Frida]: https://frida.re/docs/home/
[UPX]: https://github.com/upx/upx
