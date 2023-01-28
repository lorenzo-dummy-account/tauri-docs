从 '@theme/Command' 导入命令

# 修复渲染的临时标题

<!-- The above heading is here because fragments aren't really supported in the context of Astro Content Collections -->

要构建和捆绑您的 Tauri应用程序到一个单一可执行程序，只需运行以下命令：

<Command name="build" />

它将构建您的前端(如果配置了，请参阅 [`pre-Building Command`][beforebuildcommand]), 编译Rust binary, 收集所有外部二进制文件和资源，最终生成针对平台的套装和安装器。

[beforebuildcommand]: ../../api/config.md#buildconfig.beforebuildcommand
