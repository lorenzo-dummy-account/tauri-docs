# Menu Finestra

I menu di applicazione nativi possono essere attaccati a una finestra.

### Creare un menu

Per creare un menu nativo della finestra, importa i tipi `Menu`, `Sottomenu`, `MenuItem` e `CustomMenuItem`. L'enum `MenuItem` contiene una raccolta di elementi specifici della piattaforma (attualmente non implementati su Windows). Il `CustomMenuItem` consente di creare i propri elementi di menu e di aggiungere loro funzionalità speciali.

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
```

Crea un'istanza `Menu`:

```rust
// qui `"quit".to_string()` definisce l'id della voce del menu, e il secondo parametro è l'etichetta della voce del menù.
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let close = CustomMenuItem::new("close".to_string(), "Close");
let submenu = Submenu::new("File", Menu::new().add_item(quit). dd_item(close));
let menu = Menu::new()
  .add_native_item(MenuItem::Copy)
  .add_item(CustomMenuItem::new("hide", "Hide"))
  .add_submenu(submenu);
```

### Aggiunta del menu a tutte le finestre

Il menu definito può essere impostato su tutte le finestre usando l'API del menu `` della struttura `tauri::Builder`:

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    . enu(menu)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### Aggiunta del menu a una finestra specifica

È possibile creare una finestra e impostare il menu da usare. Questo permette di definire un menu specifico impostato per ogni finestra dell'applicazione.

```rust
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri::WindowBuilder;

fn main() {
  let menu = Menu::new(); // configura il menu
  tauri::Builder::default()
    . etup(<unk> app<unk> {
      WindowBuilder::new(
        app,
        "finestra principale". o_string(),
        tauri::WindowUrl::App("index.html". nto()),
      )
      .menu(menu)
      . uild()?;
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### Ascoltare eventi su voci di menu personalizzate

Ogni `CustomMenuItem` attiva un evento quando cliccato. Utilizzare l'API `on_menu_event` per gestirli, sia sul `tauri::Builder` globale o su una finestra specifica.

#### Ascoltare gli eventi nei menu globali

```rust
use tauri::{CustomMenuItem, Menu, MenuItem};

fn main() {
  let menu = Menu::new(); // configura il menu
  tauri::Builder::default()
    . enu(menu)
    .on_menu_event(<unk> event<unk> {
      match event. enu_item_id() {
        "quit" => {
          std::process::exit(0);
        }
        "close" => {
          evento. indow().close(). nwrap();
        }
        _ => {}
      }
    })
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

#### Ascoltare gli eventi nei menu delle finestre

```rust
use tauri::{CustomMenuItem, Menu, MenuItem};
use tauri::{Manager, WindowBuilder};

fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    . etup(<unk> app<unk> {
      let window = WindowBuilder::new(
        app,
        "finestra principale". o_string(),
        tauri::WindowUrl::App("index. tml".into()),

      . enu(menu)
      .build()?;
      let window_ = window. solo();
      finestra. n_menu_event(move <unk> event<unk> {
        match event. enu_item_id() {
          "quit" => {
            std::process::exit(0);
          }
          "close" => {
            window_. perdere(). nwrap();
          }
          _ => {}
        }
      });
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### Aggiornamento voci di menu

La struttura `Window` ha un metodo `menu_handle` , che permette di aggiornare le voci di menu:

```rust
fn main() {
  let menu = Menu::new(); // configure the menu
  tauri::Builder::default()
    . enu(menu)
    .setup(<unk> app<unk> {
      let main_window = app.get_window("main"). nwrap();
      let menu_handle = main_window. enu_handle();
      std::thread::spawn(move <unk> <unk> {
        // puoi anche `set_selected`, `set_enabled` e `set_native_image` (solo macOS).
        menu_handle.get_item("item_id").set_title("New title");
      });
      Ok(())
    })
}
```
