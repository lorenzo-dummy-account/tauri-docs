# Barre d'état système

Barre d'état système des applications natives.

### Configuration

Configurer l'objet `systemTray` sur `tauri.conf.json`:

```json
{
  "tauri": {
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
 } } } }
```

Le `iconAsTemplate` est une valeur booléenne qui détermine si l'image représente une [image de modèle][] sur macOS.

#### Configuration de Linux

Sous Linux, vous devez installer un des paquets `libayatana-appindicator` ou `libappindicator3`. Tauri détermine quel paquet utiliser à l'exécution, `libayatana` étant le paquet préféré si les deux sont installés.

Par défaut, le paquet Debian ( fichier`.deb` ) ajoutera une dépendance sur `libayatana-appindicator3-1`. Pour créer un paquet Debian ciblant `libappindicator3`, définissez la variable d'environnement `TAURI_TRAY` à `libappindicator3`.

Le bundle AppImage intègre automatiquement la bibliothèque de plateau installée et vous pouvez également utiliser la variable d'environnement `TAURI_TRAY` pour la sélectionner manuellement.

:::info

`libappindicator3` n'est pas maintenu et n'existe pas sur certaines distributions comme `debian11`, mais `libayatana-appindicator` n'existe pas sur les anciennes versions.

:::

### Création d'une barre d'état système

Pour créer une barre d'état système native, importez le type `SystemTray`:

```rust
utiliser tauri::System Tray;
```

Initialiser une nouvelle instance de la zone de notification :

```rust
let tray = SystemTray::new();
```

### Configuration d'un menu contextuel de la barre d'état système

Vous pouvez également ajouter un menu contextuel qui est visible lorsque l'icône de la barre de tâches est cliqué avec le bouton droit. Importer les types `SystemTrayMenu`, `SystemTrayMenuItem` et `CustomMenuItem`:

```rust
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
```

Créer le `SystemTrayMenu`:

```rust
// ici `"quit".to_string()` définit l'id de l'élément de menu, et le deuxième paramètre est l'étiquette de l'élément de menu.
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let hide = CustomMenuItem::new("hide".to_string(), "Hide");
let tray_menu = SystemTrayMenu::new()
  .add_item(quit)
  .add_native_item(SystemTrayMenuItem::Separator)
  .add_item(hide);
```

Ajouter le menu dans la zone de notification à l'instance `SystemTray`:

```rust
let tray = SystemTray::new().with_menu(tray_menu);
```

### Configurer la zone de notification des applications

L'instance créée `SystemTray` peut être définie en utilisant l'API `system_tray` sur la structure `tauri::Builder`:

```rust
utiliser tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insérez les éléments du menu ici
  let system_tray = SystemTray::new()
    . ith_menu(tray_menu);
  tauri::Builder::default()
    .system_tray(system_tray)
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

### Écoute des événements de la barre d'état système

Chaque `CustomMenuItem` déclenche un événement lorsqu'il est cliqué. De plus, Tauri émet une icône dans la zone de notification cliquez sur les événements. Utilisez l'API `on_system_tray_event` pour les gérer :

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insérez les éléments de menu ici
  tauri::Builder::default()
    . ystem_tray(SystemTray::new().with_menu(tray_menu))
    . n_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        taille: _,
..
      } => {
        println!("bac système a reçu un clic gauche");
      }
      SystemTrayEvent::RightClick {
        position: _,
        size: _,
..
      } => {
        println!("bac système a reçu un clic droit");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
..
      } => {
        println!("la barre d'état système a reçu un double clic");
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        correspond à l'identifiant. s_str() {
          "quit" => {
            std::process::exit(0);
          }
          "cacher" => {
            let window = app. et_window("main").unwrap();
            fenêtre. idé(). nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

### Mise à jour de la barre d'état système

La structure `AppHandle` a une méthode `tray_handle` , qui retourne un gestionnaire dans la zone de notification permettant de mettre à jour l'icône de la zone de notification et les éléments du menu contextuel :

#### Mise à jour des éléments du menu contextuel

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // insérez les éléments de menu ici
  tauri::Builder::default()
    . ystem_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        // récupère une poignée vers l'élément de menu cliqué
        // note que `tray_handle` peut être appelé n'importe où,
        // obtenez juste une instance `AppHandle` avec `app. andle()` sur le crochet d'installation
        // et le déplacer vers une autre fonction ou un autre thread
        let item_handle = app. ray_handle().get_item(&id);
        correspond à l'identifiant. s_str() {
          "hide" => {
            let window = app. et_window("principal"). nwrap();
            window.hide(). nwrap();
            // vous pouvez aussi `set_selected`, `set_enabled` et `set_native_image` (macOS seulement).
            item_handle.set_title("Affichage"). nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

#### Mise à jour de l'icône de la barre d'état

Notez que vous devez ajouter `icon-ico` ou `icon-png` à la dépendance tauri de votre Cargo. oml pour pouvoir utiliser `Icon::Raw`

```rust
app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../path/to/myicon.ico").to_vec())).unwrap();
```

### Garder l'application en arrière-plan après la fermeture de toutes les fenêtres

Par défaut, tauri ferme l'application lorsque la dernière fenêtre est fermée. Si votre application doit s'exécuter en arrière-plan, vous pouvez appeler `api.prevent_close()` comme ceci :

```rust
tauri::Builder::default()
  .build(tauri::generate_context!())
  .expect("erreur lors de la construction de l'application tauri")
  .run(|_app_handle, event| match event {
    tauri::RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    _ => {}
});
```

[image de modèle]: https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc
