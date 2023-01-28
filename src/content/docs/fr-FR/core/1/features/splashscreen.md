# Écran de partage

Si votre page Web peut prendre un certain temps pour se charger, ou si vous devez exécuter une procédure d'initialisation dans Rust avant d'afficher votre fenêtre principale, un splashscreen pourrait améliorer l'expérience de chargement pour l'utilisateur.

### Configuration

Premièrement, créez un `splashscreen.html` dans votre `distDir` qui contient le code HTML pour un splashscreen. Ensuite, mettez à jour votre `tauri.conf.json` comme ceci :

```diff
"windows": [
  {
    "title": "Application Tauri",
    "largeur": 800,
    "hauteur": 600,
    "redimensionnable" : vrai,
    "plein écran": false,
+ "visible": false // Cacher la fenêtre principale par défaut
  },
  // Ajoute la fenêtre splashscreen
+ {
+ "width": 400,
+ "height": 200,
+ "decorations": false,
+ "url": "splashscreen. tml",
+ "label": "splashscreen"
+ }
]
```

Maintenant, votre fenêtre principale sera masquée et la fenêtre splashscreen s'affichera lorsque votre application sera lancée. Ensuite, vous aurez besoin d'un moyen de fermer l'écran de démarrage et d'afficher la fenêtre principale lorsque votre application sera prête. La façon dont vous le faites dépend de ce que vous attendez avant de fermer l'écran de démarrage.

### En attente de la page Web

Si vous attendez votre code web, vous voudrez créer une commande `close_splashscreen` [](command).

```rust src-tauri/main.rs
use tauri::Manager;
// Créer la commande:
// Cette commande doit être async afin qu'elle ne s'exécute pas sur le thread principal.
#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Ferme splashscreen
  if let Some(splashscreen) = window. et_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Afficher la fenêtre principale
  window.get_window("main").unwrap(). comment(). nwrap();
}

// Enregistrer la commande:
fn main() {
  tauri::Builder::default()
    // Ajoute cette ligne
    . nvoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}

```

Ensuite, vous pouvez l'appeler depuis votre JS:

```js
// Avec le paquet npm de l'API Tauri:
importez { invoke } depuis '@tauri-apps/api/tauri'
// Avec le script global Tauri:
const invoke = window.__TAURI__.invoke

document. ddEventListener('DOMContentLoaded', () => {
  // Cela attendra le chargement de la fenêtre, mais vous pouvez
  // exécuter cette fonction sur n'importe quel déclencheur que vous voulez
  invoke('close_splashscreen')
})
```

### En attente de rouille

Si vous attendez que le code Rust fonctionne, mettez-le dans le gestionnaire de fonction `setup` pour que vous ayez accès à l'instance `App`:

```rust src-tauri/main.rs
utiliser tauri::Manager;
fn main() {
  tauri::Builder::default()
    . etup(|app| {
      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main"). nwrap();
      // nous exécutons le code d'initialisation sur une nouvelle tâche, donc l'application ne gèle pas
      tauri::async_runtime::spawn(async move {
        // initialise votre application ici au lieu de dormir :)
        println! Initialisation. .");
        est ::thread::sleep(std::time::Duration::from_secs(2));
        println! "Initialisation terminée. );

        // Après avoir terminé, fermez l'écran de démarrage et affichez la fenêtre principale
        splashscreen_window. lose().unwrap();
        main_window.show(). nwrap();
      });
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("failed to run app");
}
```
