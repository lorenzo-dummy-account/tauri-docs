# Vassoio Di Sistema

Vassoio di sistema di applicazione nativo.

### Configurazione

Configura l'oggetto `systemTray` su `tauri.conf.json`:

```json
{
  "tauri": {
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
}
```

L'iconasTemplate `` è un valore booleano che determina se l'immagine rappresenta un'immagine [Template][] su macOS.

#### Configurazione Linux

Su Linux, è necessario installare uno dei pacchetti `libayatana-appindicator` o `libappindicator3`. Tauri determina quale pacchetto usare in runtime, con `libayatana` come preferito se entrambi sono installati.

Per impostazione predefinita, il pacchetto Debian (`.deb` file) aggiungerà una dipendenza da `libayatana-appindicator3-1`. Per creare un pacchetto Debian target `libappindicator3`, impostare la variabile d'ambiente `TAURI_TRAY` su `libappindicator3`.

Il pacchetto AppImage incorpora automaticamente la libreria del vassoio installata, e puoi anche utilizzare la variabile di ambiente `TAURI_TRAY` per selezionarla manualmente.

:::info

`libappindicator3` is unmaintained and does not exist on some distros like `debian11`, ma `libayatana-appindicator` non esiste su vecchie versioni.

:::

### Creare un vassoio di sistema

Per creare un vassoio di sistema nativo, importare il `SystemTray` tipo:

```rust
usa tauri::SystemTray;
```

Inizializza una nuova istanza nel vassoio:

```rust
let vassoio = SystemTray::new();
```

### Configurazione di un menu contestuale nel vassoio di sistema

Opzionalmente è possibile aggiungere un menu contestuale che è visibile quando l'icona del vassoio è cliccata con il tasto destro del mouse. Importa i tipi `SystemTrayMenu`, `SystemTrayMenuItem` e `CustomMenuItem`:

```rust
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
```

Crea il `SystemTrayMenu`:

```rust
// qui `"quit".to_string()` definisce l'id della voce del menu, e il secondo parametro è l'etichetta della voce del menù.
let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let hide = CustomMenuItem::new("hide".to_string(), "Hide");
let tray_menu = SystemTrayMenu::new()
  .add_item(quit)
  .add_native_item(SystemTrayMenuItem::Separator)
  .add_item(hide);
```

Aggiungi il menu del vassoio all'istanza `SystemTray`:

```rust
let vassoio = SystemTray::new().with_menu(tray_menu);
```

### Configura il vassoio di sistema dell'app

L'istanza `SystemTray` creata può essere impostata utilizzando l'API `system_tray` sulla struttura `tauri::Builder`:

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

fn main() {
  let tray_menu = SystemTrayMenu::new(); // inserisci qui le voci di menu
  let system_tray = SystemTray::new()
    . ith_menu(tray_menu);
  tauri::Builder::default()
    .system_tray(system_tray)
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### Ascoltando eventi nel vassoio di sistema

Ogni `CustomMenuItem` attiva un evento quando cliccato. Inoltre, Tauri emette eventi clic icona vassoio. Usa l'API `on_system_tray_event` per gestirle:

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // inserisci qui le voci di menu
  tauri::Builder::default()
    . system tray(SystemTray::new().with_menu(tray_menu))
    . n_system_tray_event(<unk> app, event<unk> match event {
      SystemTrayEvent::LeftClick {
        position: _,
        dimensioni: _,
..
      } => {
        println!("system tray received a left click");
      }
      SystemTrayEvent::RightClick {
        position: _,
        size: _,
..
      } => {
        println!("system tray received a right click");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
..
      } => {
        println!("il vassoio di sistema ha ricevuto un doppio clic");
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id. s_str() {
          "quit" => {
            std::process::exit(0);
          }
          "hide" => {
            let window = app. et_window("main").unwrap();
            finestra. ide(). nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### Aggiornamento vassoio di sistema

La struttura `AppHandle` ha un metodo `tray_handle` , che restituisce una maniglia al vassoio di sistema consentendo di aggiornare l'icona del vassoio e le voci del menu contestuale:

#### Aggiornamento voci del menu contestuale

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
  let tray_menu = SystemTrayMenu::new(); // inserisci qui le voci di menu
  tauri::Builder::default()
    . ystem_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(<unk> app, event<unk> match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        // ottieni una maniglia alla voce di menu selezionata
        // nota che il file `tray_handle` può essere chiamato ovunque,
        // basta ottenere un'istanza `AppHandle` con `app. andle()` sul gancio di configurazione
        // e spostalo in un'altra funzione o thread
        let item_handle = app. ray_handle().get_item(&id);
        match id. s_str() {
          "hide" => {
            let window = app. et_window("main"). nwrap();
            window.hide(). nwrap();
            // puoi anche `set_selected`, `set_enabled` e `set_native_image` (solo macOS).
            item_handle.set_title("Show"). nwrap();
          }
          _ => {}
        }
      }
      _ => {}
    })
    . un(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

#### Aggiornamento icona vassoio

Nota che devi aggiungere il flag di funzionalità `icon-ico` o `icon-png` alla dipendenza tauri nel tuo Cargo. oml per poter usare `Icon::Raw`

```rust
app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../path/to/myicon.ico").to_vec())).unwrap();
```

### Mantieni l'applicazione in esecuzione in background dopo aver chiuso tutte le finestre

Per impostazione predefinita, tauri chiude l'applicazione quando l'ultima finestra è chiusa. Se la tua app dovrebbe essere eseguita in background, puoi chiamare `api.prevent_close()` così:

```rust
tauri::Builder::default()
  .build(tauri::generate_context!())
  .expect("error while building tauri application")
  .run(<unk> _app_handle, event<unk> match event {
    tauri::RunEvent::ExitRequested { api, .. } => {
      api.prevent_exit();
    }
    _ => {}
});
```

[Template]: https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc
