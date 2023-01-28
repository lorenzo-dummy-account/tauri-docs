# Personalización de Ventana

Tauri proporciona muchas opciones para personalizar el aspecto de la ventana de tu aplicación. Puede crear barras de título personalizadas, tener ventanas transparentes, imponer restricciones de tamaño y más.

## Configuración

Hay tres maneras de cambiar la configuración de la ventana:

- [A través de tauri.conf.json](../../api/config.md#tauri.windows)
- [A través de la API JS](../../api/js/window.md#webviewwindow)
- [A través de la Ventana en Rust](https://docs.rs/tauri/1/tauri/window/struct.Window.html)

## Crear una barra de título personalizada

Un uso común de estas características de ventana es la creación de una barra de título personalizada. Este breve tutorial le guiará a través de ese proceso.

### CSS

Necesitarás añadir algo de CSS para la barra de título para mantenerlo en la parte superior de la pantalla y diseñar los botones:

```css
.titlebar {
  height: 30px;
  background: #329ea3;
  user-select: none;
  display: flex;
  justificar-contenido: flex-end;
  posición: fijado;
  arriba: 0;
  izquierda: 0;
  derecha: 0;
}
. itlebar-button {
  display: inline-flex;
  justificar-contenido: centro;
  elementos alineados: centro;
  ancho: 30px;
  altura: 30px;
}
. itlebar-button:hover {
  fondo: #5bbec3;
}
```

### HTML

Ahora, necesitarás añadir el HTML para la barra de título. Pon esto en la parte superior de tu etiqueta `<body>`:

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

Ten en cuenta que tal vez necesites mover el resto de tu contenido hacia abajo para que la barra de título no lo cubra.

### JS

Por último, necesitarás hacer que los botones funcionen:

```js
importar { appWindow } desde '@tauri-apps/api/window'
documento
  .getElementById('titlebar-minimize')
  . ddEventListener('click', () => appWindow.minimize())
documento
  . etElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
documento
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close())
```
