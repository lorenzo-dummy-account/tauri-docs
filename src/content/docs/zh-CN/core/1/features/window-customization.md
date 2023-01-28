# 窗口自定义

Tauri提供了许多自定义应用程序窗口外观和感觉的选项。 您可以创建自定义标题栏，具有透明窗口，强制执行大小限制等等。

## 配置

有三种方法可以更改窗口配置：

- [通过 tauri.conf.json](../../api/config.md#tauri.windows)
- [通过 JS API](../../api/js/window.md#webviewwindow)
- [穿过Rust中的窗口](https://docs.rs/tauri/1/tauri/window/struct.Window.html)

## 创建自定义标题栏

这些窗口功能的常用正在创建自定义标题栏。 这个简短的教程将引导您完成这个过程。

### CSS

您需要为标题栏添加一些CSS，才能将其保留在屏幕顶部并样式按钮：

```css
.titlebar,
  height: 30px;
  背景: #329ea3;
  用户选择: 无;
  显示: 弹性;
  正当内容：弹性结束；
  立场：修正；
  顶部：0；
  剩余：0；
  右：0；
}
。 itlebar-button v.
  display: inline-flex;
  justicy-content: center;
  校准项目：中心；
  宽度：30px；
  高度：30px；
}
itlebar-button:hover PDF
  bbbec3;
}
```

### HTML

现在，您需要添加标题栏的 HTML 文件。 将此置于您的 `<body>` 标签的顶部：

```html
<div data-tauri-drag-region class="titlebar">
  <div class="titlebar-button" id="titlebar-minimize">
    <img
      src="https://api.iconify.design/mdi:window-minimize.svg"
      alt="minimize"
    />
  </div>
  <div class="titlebar-button" id="titlebar-maximize">
    <img
      src="https://api.iconify.design/mdi:window-maximize.svg"
      alt="maximize"
    />
  </div>
  <div class="titlebar-button" id="titlebar-close">
    <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
  </div>
</div>
```

请注意，您可能需要将其余内容向下移动，以便标题栏不包含它。

### JS

最后，您需要使按钮发挥作用：

```js
从 '@tauri-apps/api/window' 导入 { appWindow }
文档
  .getElementById('titlebar-minimize')
  ddEventListener('点击', () => appWindow.minimize())
文档
  etElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
document
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close())
```
