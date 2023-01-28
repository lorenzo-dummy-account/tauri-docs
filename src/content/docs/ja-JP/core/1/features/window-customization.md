# ウィンドウのカスタマイズ

牡牛座は、アプリケーションのウィンドウのルックアンドフィールをカスタマイズするためのオプションの多くを提供します。 カスタムタイトルバーの作成、透明なウィンドウの作成、サイズ制約の適用などができます。

## 設定

ウィンドウの設定を変更するには、次の3つの方法があります。

- [tauri.conf.jsonから](../../api/config.md#tauri.windows)
- [JS APIを通じて](../../api/js/window.md#webviewwindow)
- [Rust の窓を通して](https://docs.rs/tauri/1/tauri/window/struct.Window.html)

## カスタムタイトルバーの作成

これらのウィンドウ機能の一般的な使用方法は、カスタムのタイトルバーを作成することです。 この短いチュートリアルでは、そのプロセスをご案内します。

### CSS

タイトルバーにCSSを追加して、ボタンのスタイルを変更する必要があります。

```css
.titlebar {
  height: 30px;
  background: #329ea3;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
.titlebar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
}
.titlebar-button:hover {
  background: #5bbec3;
}
```

### HTML

ここで、タイトルバーにHTMLを追加する必要があります。 `<body>` タグの上にこれを置いてください:

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

タイトルバーがカバーしていないように、残りのコンテンツを下に移動する必要がある場合があります。

### JS

最後に、ボタンを動作させる必要があります。

```js
import { appWindow } from '@tauri-apps/api/window'
document
  .getElementById('titlebar-minimize')
  .addEventListener('click', () => appWindow.minimize())
document
  .getElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
document
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close())
```
