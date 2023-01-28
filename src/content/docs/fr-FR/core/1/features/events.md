# Évènements

Le système d'événements Tauri est une primitive multiproductrice de communication multi-consommateurs qui permet de passer des messages entre le frontend et l'arrière-plan. Il est analogue au système de commande mais une vérification de type payload doit être écrite sur le gestionnaire d'événements et cela simplifie la communication du backend vers le frontend, fonctionne comme un canal.

Une application Tauri peut écouter et émettre des événements globaux et spécifiques à Windows. L'utilisation depuis le frontend et le backend est décrite ci-dessous.

## Frontend

Le système d'événements est accessible sur le frontend sur les modules `événement` et `fenêtre` du paquet `@tauri-apps/api`.

### Événements globaux

Pour utiliser le canal événement global, importez le module `événement` et utilisez les fonctions `émettre` et `écouter`:

```js
import { emit, listen } de '@tauri-apps/api/event'

// écoute l'évènement `click` et obtiens une fonction pour supprimer l'évènement listener
// il y a aussi une fonction `once` qui s'abonne à un événement et désabonne automatiquement le listener sur le premier événement
const unlisten = wait listen('click', (event) => {
  // événement. vent est le nom de l'événement (utile si vous voulez utiliser un simple callback fn pour plusieurs types d'événements)
  // événement. ayload est l'objet payload
})

// émet l'événement `click` avec l'objet payload
emit('click', {
  theMessage: 'Tauri est génial! ,
})
```

### Événements spécifiques à la fenêtre

Les événements spécifiques à Windows sont exposés sur le module `window`.

```js
import { appWindow, WebviewWindow } depuis '@tauri-apps/api/window'

// émet un événement qui n'est visible que dans la fenêtre actuelle
appWindow.emit('event', { message: 'Tauri est génial !' })

// crée une nouvelle fenêtre webview et émet un événement uniquement dans cette fenêtre
const webview = new WebviewWindow('window')
webview.emit('event')
```

## Backend

Sur le backend, le canal événement global est exposé sur l'app `` struct, et les événements spécifiques à une fenêtre peuvent être émis en utilisant la caractéristique `Fenêtre`.

### Événements globaux

```rust
use tauri::Manager;

// le type de payload doit implémenter `Serialize` et `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  tauri::Builder::default()
    . etup(|app| {
      // écoute le `event-name` (émis sur n'importe quelle fenêtre)
      let id = app. isten_global("event-name", |event| {
        println!("a reçu le nom de l'événement avec la charge utile {:?}", l'événement. ayload());
      });
      // déécoutez l'événement en utilisant le `id` retourné sur la fonction `listen_global`
      // une API `once_global` est également exposée sur l'application `App` struct
      . nlisten(id);

      // émet l'événement `event-name` dans toutes les fenêtres de webview sur l'application frontend
      . mit_all("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```

### Événements spécifiques à la fenêtre

Pour utiliser le canal d'événements spécifique à la fenêtre, un objet `Fenêtre` peut être obtenu sur un gestionnaire de commande ou avec la fonction `get_window`:

```rust
utilisez tauri::{Manager, Window};

// le type de bloc doit implémenter `Serialize` et `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

// init un processus d'arrière-plan dans la commande, et émettre des événements périodiques seulement dans la fenêtre qui a utilisé la commande
#[tauri::command]
fn init_process(window: Window) {
  std::thread::spawn(move || {
    loop {
      fenêtre. mit("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
    }
  });
}

fn main() {
  tauri::Builder::default()
    . etup(|app| {
      // `main` ici est l'étiquette de fenêtre; il est défini sur la création de la fenêtre ou sous `tauri. onf.json`
      // la valeur par défaut est `main`. Notez qu'il doit être unique
      let main_window = app.get_window("main"). nwrap();

      // écoute le `event-name` (émis sur la fenêtre `main`)
      let id = main_window. isten("event-name", |event| {
        println!("fenêtre avec payload {:?}", événement. ayload());
      });
      // dé-écoute l'évènement en utilisant le `id` retourné sur la fonction `listen`
      // une API `once` est également exposée sur le struct `Window`
      main_window. nlisten(id);

      // émet l'événement `event-name` dans la fenêtre `main`
      main_window. mit("event-name", Payload { message: "Tauri is awesome!".into() }). nwrap();
      Ok(())
    })
    . nvoke_handler(tauri::generate_handler![init_process])
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```
