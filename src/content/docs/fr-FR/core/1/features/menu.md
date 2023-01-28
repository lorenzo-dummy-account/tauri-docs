# Menu Fenêtre

Les menus natifs des applications peuvent être attachés à une fenêtre.

### Création d'un menu

Pour créer un menu de fenêtre natif, importez les types `Menu`, `Sous-menu`, `MenuItem` et `CustomMenuItem`. L'énumération `MenuItem` contient une collection d'éléments spécifiques à la plate-forme (actuellement non implémentés sous Windows). Le `CustomMenuItem` vous permet de créer vos propres liens de menu et d'y ajouter des fonctionnalités spéciales.

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
```

Créer une instance `Menu`:

```rust
// ici `"quit".to_string()` définit l'id de l'élément de menu, et le deuxième paramètre est l'étiquette de l'élément de menu.
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let close = CustomMenuItem::new("close".to_string(), "Close");
let submenu = Submenu::new("File", Menu::new().add_item(quit). dd_item(close));
let menu = Menu::new()
  .add_native_item(MenuItem::Copy)
  .add_item(CustomMenuItem::new("hide", "Hide"))
  .add_submenu(sous-menu);
```

### Ajout du menu à toutes les fenêtres

Le menu défini peut être défini sur toutes les fenêtres en utilisant l'API `menu` sur la structure `tauri::Builder`:

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
  let menu = Menu::new(); // configure le menu
  tauri::Builder::default()
    . enu(menu)
    .run(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

### Ajout du menu à une fenêtre spécifique

Vous pouvez créer une fenêtre et définir le menu à utiliser. Cela permet de définir un menu spécifique pour chaque fenêtre d'application.

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri::WindowBuilder;

fn main() {
  let menu = Menu::new(); // configure le menu
  tauri::Builder::default()
    . etup(|app| {
      WindowBuilder::new(
        app,
        "fenêtre principale". o_string(),
        tauri::WindowUrl::App("index.html". nto()),
      )
      .menu(menu)
      . uild()?;
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

### Écoute des événements sur les liens de menu personnalisés

Chaque `CustomMenuItem` déclenche un événement lorsqu'il est cliqué. Utilisez l'API `on_menu_event` pour les gérer, soit sur le global `tauri::Builder` ou sur une fenêtre spécifique.

#### Écoute des événements sur les menus globaux

```rust
utiliser tauri::{CustomMenuItem, Menu, MenuItem};

fn main() {
  let menu = Menu::new(); // configure le menu
  tauri::Builder::default()
    . enu(menu)
    .on_menu_event(|event| {
      correspondent à l'événement. enu_item_id() {
        "quit" => {
          std::process::exit(0);
        }
        "close" => {
          événement. indow().close(). nwrap();
        }
        _ => {}
      }
    })
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

#### Écoute des événements dans les menus des fenêtres

```rust
utiliser tauri::{CustomMenuItem, Menu, MenuItem};
utiliser tauri::{Manager, WindowBuilder};

fn main() {
  laisser menu = Menu::new(); // configure le menu
  tauri::Builder::default()
    . etup(|app| {
      let window = WindowBuilder::new(
        app,
        "main window". o_string(),
        tauri::WindowUrl::App("index. tml".into()),
      )
      . enu(menu)
      .build()?;
      let window_ = fenêtre. lone();
      fenêtre. n_menu_event(déplacer |event| {
        événement correspondant. enu_item_id() {
          "quit" => {
            std::process::exit(0);
          }
          "close" => {
            window_. perdre(). nwrap();
          }
          _ => {}
        }
      });
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

### Mise à jour des éléments du menu

La structure de la fenêtre `` a une méthode `menu_handle` qui permet la mise à jour des éléments de menu :

```rust
fn main() {
  let menu = Menu::new(); // configure le menu
  tauri::Builder::default()
    . enu(menu)
    .setup(|app| {
      let main_window = app.get_window("main"). nwrap();
      let menu_handle = main_window. enu_handle();
      std::thread::spawn(move || {
        // vous pouvez aussi `set_selected`, `set_enabled` et `set_native_image` (macOS uniquement).
        menu_handle.get_item("item_id").set_title("New title");
      });
      Ok(())
    })
}
```
