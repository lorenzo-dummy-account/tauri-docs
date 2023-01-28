# Fenêtre multiple

Gérer plusieurs fenêtres sur une seule application.

## Création d'une fenêtre

Une fenêtre peut être créée statiquement à partir du fichier de configuration Tauri ou à l'exécution.

### Fenêtre statique

Plusieurs fenêtres peuvent être créées avec le tableau de configuration [tauri.windows][]. Le snippet JSON suivant montre comment créer statiquement plusieurs fenêtres à travers la configuration :

```json tauri.conf.json
{
  "tauri": {
    "windows": [
      {
        "label": "external",
        "titre": "Tauri Docs",
        "url": "https://tauri. pp"
      },
      {
        "label": "local",
        "title": "Tauri",
        "url": "index. tml"
      }
    ]
  }
}
```

Notez que l'étiquette de fenêtre doit être unique et peut être utilisée lors de l'exécution pour accéder à l'instance de fenêtre. La liste complète des options de configuration disponibles pour les fenêtres statiques se trouve dans la documentation de [WindowConfig][].

### Fenêtre d'exécution

Vous pouvez également créer des fenêtres au moment de l'exécution, soit via la couche Rust ou via l'API Tauri.

#### Créer une fenêtre dans Rust

Une fenêtre peut être créée à l'exécution, en utilisant la structure [WindowBuilder][].

Pour créer une fenêtre, vous devez avoir une instance de l' [App][] en cours d'exécution ou un [AppHandle][].

##### Créer une fenêtre en utilisant l'instance [App][]

L'instance [App][] peut être obtenue dans le crochet d'installation ou après un appel à [Builder::build][].

```rust Using the setup hook
tauri::Builder::default()
  .setup(|app| {
    let docs_window = tauri::WindowBuilder::new(
      app,
      "external", /* the unique window label */
      tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
    ).build()?;
    let local_window = tauri::WindowBuilder::new(
      app,
      "local",
      tauri::WindowUrl::App("index.html".into())
    ).build()?;
    Ok(())
  })
```

L'utilisation du crochet permet de s'assurer que les fenêtres statiques et les plugins Tauri sont initialisés. Alternativement, vous pouvez créer une fenêtre après la construction de l'application [][]:

```rust Using the built app
let app = tauri::Builder::default()
  .build(tauri::generate_context!())
  . xpect("erreur lors de la construction de l'application tauri");

let docs_window = tauri::WindowBuilder::new(
  &app,
  "external", /* l'étiquette de fenêtre unique */
  tauri::WindowUrl::External("https://tauri. pp/".parse().unwrap())
).build(). xpect("échec de la construction de la fenêtre");

let local_window = tauri::WindowBuilder::new(
  &app,
  "local",
  tauri::WindowUrl::App("index. tml".into())
).build()?;
```

Cette méthode est utile lorsque vous ne pouvez pas déplacer la propriété des valeurs vers la fermeture de l'installation.

##### Créer une fenêtre en utilisant une instance [AppHandle][]

Une instance [AppHandle][] peut être obtenue en utilisant la fonction [`App::handle`] ou directement injectée dans les commandes Tauri.

```rust Create a window in a separate thread
tauri::Builder::default()
  .setup(|app| {
    let handle = app. bougie();
    std::thread::spawn(move || {
      let local_window = tauri::WindowBuilder::new(
        &handle,
        "local",
        tauri::WindowUrl::App("index. tml".into())
      ).build()?;
    });
    Ok(())
})
```

```rust Create a window in a Tauri command
#[tauri::command]
async fn open_docs(handle: tauri::AppHandle) {
  let docs_window = tauri::WindowBuilder::new(
    &handle,
    "external", /* the unique window label */
    tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
  ).build().unwrap();
}
```

:::info

Lors de la création de fenêtres dans une commande Tauri, assurez-vous que la fonction de commande est `async` pour éviter un blocage sur Windows en raison du problème [wry#583][].

:::

#### Créer une fenêtre en JavaScript

En utilisant l'API Tauri, vous pouvez facilement créer une fenêtre lors de l'exécution en important la classe [WebviewWindow][].

```js Create a window using the WebviewWindow class
import { WebviewWindow } depuis '@tauri-apps/api/window'
const webview = new WebviewWindow('theUniqueLabel', {
  url: 'path/to/page. tml',
})
// puisque la fenêtre webview est créée de manière asynchrone,
// Tauri émet les `tauri://created` et `tauri://error` pour vous informer de la réponse de création
webview. nce('tauri://created', function () {
  // webview créée avec succès
})
webview. nce('tauri://error', function (e) {
  // une erreur est survenue lors de la création de la fenêtre de webview
})
```

## Accéder à une fenêtre lors de l'exécution

L'instance de fenêtre peut être interrogée en utilisant son label et la méthode [get_window][] sur Rust ou [WebviewWindow.getByLabel][] sur JavaScript.

```rust Using get_window
utiliser tauri::Manager;
tauri::Builder::default()
  .setup(|app| {
    laisser main_window = app.get_window("main").unwrap();
    Ok((())
})
```

Notez que vous devez importer [tauri::Manager][] pour utiliser la méthode [get_window][] sur les instances [App][] ou [AppHandle][].

```js Using WebviewWindow.getByLabel
importer { WebviewWindow } depuis '@tauri-apps/api/window'
const mainWindow = WebviewWindow.getByLabel('main')
```

## Communiquer avec d'autres fenêtres

La communication avec les fenêtres peut être effectuée à l'aide du système d'événements. Consultez le [Guide des événements][] pour plus d'informations.

[tauri.windows]: ../../api/config.md#tauriconfig.windows
[WindowConfig]: ../../api/config.md#windowconfig
[WindowBuilder]: https://docs.rs/tauri/1.0.0/tauri/window/struct.WindowBuilder.html
[App]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[7]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[8]: https://docs.rs/tauri/1.0.0/tauri/struct.App.html
[AppHandle]: https://docs.rs/tauri/1.0.0/tauri/struct.AppHandle.html
[Builder::build]: https://docs.rs/tauri/1.0.0/tauri/struct.Builder.html#method.build
[get_window]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html#method.get_window
[wry#583]: https://github.com/tauri-apps/wry/issues/583
[WebviewWindow]: ../../api/js/window.md#webviewwindow
[WebviewWindow.getByLabel]: ../../api/js/window.md#getbylabel
[tauri::Manager]: https://docs.rs/tauri/1.0.0/tauri/trait.Manager.html
[Guide des événements]: ./events.md
