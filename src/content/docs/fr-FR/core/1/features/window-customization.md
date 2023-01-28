# Personnalisation de la fenêtre

Tauri fournit de nombreuses options pour personnaliser l'apparence de la fenêtre de votre application. Vous pouvez créer des barres de titre personnalisées, avoir des fenêtres transparentes, imposer des contraintes de taille, et plus encore.

## Configuration

Il y a trois façons de modifier la configuration de la fenêtre:

- [Par tauri.conf.json](../../api/config.md#tauri.windows)
- [À travers l'API JS](../../api/js/window.md#webviewwindow)
- [À travers la fenêtre en rouille](https://docs.rs/tauri/1/tauri/window/struct.Window.html)

## Création d'une barre de titre personnalisée

Une utilisation courante de ces fonctionnalités de fenêtre est la création d'une barre de titre personnalisée. Ce court tutoriel vous guidera tout au long de ce processus.

### CSS

Tu devras ajouter du CSS pour la barre de titre afin de le garder en haut de l'écran et de styliser les boutons:

```css
.titlebar {
  height: 30px;
  background: #329ea3;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  position: fixée;
  top: 0;
  à gauche : 0;
  à droite : 0;
}
. itlebar-button {
  display: inline-flex;
  justify-content: center;
  aligne-éléments : centre ;
  largeur: 30px ;
  hauteur : 30px ;
}
. itlebar-button:hover {
  arrière-plan: #5bbec3;
}
```

### HTML

Maintenant, vous devrez ajouter le HTML pour la barre de titre. Placez ceci en haut de votre balise `<body>`:

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

Notez que vous devrez peut-être déplacer le reste de votre contenu vers le bas pour que la barre de titre ne le couvre pas.

### JS

Enfin, tu devras faire fonctionner les boutons :

```js
importer { appWindow } depuis '@tauri-apps/api/window'
document
  .getElementById('titlebar-minimize')
  . ddEventListener('click', () => appWindow.minimize())
document
  . etElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
document
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close())
```
