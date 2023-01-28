# Personalizzazione Finestra

Tauri offre un sacco di opzioni per personalizzare l'aspetto e la sensazione della finestra della tua app. È possibile creare barre dei titoli personalizzate, avere finestre trasparenti, imporre vincoli di dimensione e altro ancora.

## Configurazione

Ci sono tre modi per cambiare la configurazione della finestra:

- [Attraverso tauri.conf.json](../../api/config.md#tauri.windows)
- [Attraverso l'API JS](../../api/js/window.md#webviewwindow)
- [Attraverso la finestra in ruggine](https://docs.rs/tauri/1/tauri/window/struct.Window.html)

## Creazione di una barra del titolo personalizzata

Un uso comune di queste funzioni della finestra è la creazione di una barra del titolo personalizzata. Questo breve tutorial ti guiderà attraverso quel processo.

### CSS

È necessario aggiungere alcuni CSS per la barra del titolo per mantenerlo nella parte superiore dello schermo e stile i pulsanti:

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
. itlebar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  larghezza: 30px;
  altezza: 30px;
}
. itlebar-button:hover {
  background: #5bbec3;
}
```

### HTML

Ora, è necessario aggiungere l'HTML per la barra del titolo. Metti questo in cima al tuo tag `<body>`:

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

Nota che potrebbe essere necessario spostare il resto del tuo contenuto in modo che la barra del titolo non lo copra.

### JS

Infine, dovrai far funzionare i pulsanti:

```js
import { appWindow } from '@tauri-apps/api/window'
document
  .getElementById('titlebar-minimize')
  . ddEventListener('click', () => appWindow.minimize())
documento
  . etElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
documento
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close())
```
