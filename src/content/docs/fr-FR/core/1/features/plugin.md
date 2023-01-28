# Tauri Plugins

Les plugins vous permettent de vous connecter au cycle de vie de l'application Tauri et d'introduire de nouvelles commandes.

## Utiliser un Plugin

Pour utiliser un plugin, il suffit de passer l'instance du plugin à la méthode `plugin` de l'application :

```rust
fn main() {
  tauri::Builder::default()
    .plugin(my_awesome_plugin::init())
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

## Écrire un Plugin

Les plugins sont des extensions réutilisables à l'API Tauri qui résolvent des problèmes communs. Ils sont aussi un moyen très pratique de structurer votre base de code !

Si vous avez l'intention de partager votre plugin avec d'autres, nous fournissons un modèle prêt à l'emploi ! Avec le tauri-cli installé il suffit de tourner:

```shell
tauri plugin init --name génial
```

### Paquet API

Par défaut, les utilisateurs de votre plugin peuvent appeler les commandes fournies comme ceci :

```js
importer { invoke } depuis '@tauri-apps/api'
invoke('plugin:awesome|do_something')
```

où `génial` sera remplacé par le nom de votre plugin.

Ce n'est pas très pratique, cependant, il est courant pour les plugins de fournir un paquet d'API __, un paquet JavaScript qui fournit un accès pratique à vos commandes.

> Un exemple de ceci est le [tauri-plugin-store](https://github.com/tauri-apps/tauri-plugin-store), qui fournit une structure de classes pratique pour accéder à un magasin. Vous pouvez échafauder un plugin tauri avec le paquet d'API javascript attaché comme ceci :

```shell
tauri plugin init --name awesome --api
```

## Écrire un Plugin

En utilisant le taurier `::plugin::Builder` vous pouvez définir des plugins similaires à la façon dont vous définissez votre application :

```rust
utiliser tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

// les gestionnaires de commandes personnalisées du plugin si vous choisissez d'étendre l'API :

#[tauri::command]
// cela sera accessible avec `invoke('plugin:awesome|initialize')`.
// où `awesome` est le nom du plugin.
fn initialize() {}

#[tauri::command]
// ceci sera accessible avec `invoke('plugin:awesome|do_something')`.
fn do_something() {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    .invoke_handler(tauri::generate_handler![initialize, do_something])
    .build()
}
```

Les plugins peuvent configurer et maintenir l'état, tout comme votre application peut :

```rust
utiliser tauri::{
  plugin::{Builder, TauriPlugin},
  AppHandle, Manager, Runtime, State,
};

#[derive(Default)]
struct MyState {}

#[tauri::command]
// ceci sera accessible avec `invoke('plugin:awesome|do_something')`.
fn do_something<R: Runtime>(_app: AppHandle<R>, state: State<'_, MyState>) {
  // vous pouvez accéder à `MyState` ici!
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("awesome")
    . nvoke_handler(tauri::generate_handler![do_something])
    . etup(|app_handle| {
      // configure l'état spécifique du plugin ici
      app_handle. anage(MyState::default());
      Ok(())
    })
    .build()
}
```

### Conventions

- La caisse exporte une méthode `init` pour créer le plugin.
- Les plugins doivent avoir un nom clair avec le préfixe `tauri-plugin-`.
- Inclure le mot-clé `tauri-plugin` dans `Cargo.toml`/`package.json`.
- Documentez votre plugin en anglais.
- Ajouter un exemple d'application montrant votre plugin.

### Avancé

Au lieu de s'appuyer sur le tauri `::plugin::TauriPlugin` struct retourné par `tauri::plugin::Builder::build`, vous pouvez implémenter le tauri `::plugin::Plugin` vous-même. Cela vous permet d'avoir un contrôle total sur les données associées.

Notez que chaque fonction sur la caractéristique `Plugin` est optionnelle, hormis la fonction `name`.

```rust
use tauri::{plugin::{Plugin, Result as PluginResult}, Runtime, PageLoadPayload, Window, Invoke, AppHandle};

struct MyAwesomePlugin<R: Runtime> {
  invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
  // état du plugin, les champs de configuration
}

// les gestionnaires de commandes personnalisées du plugin si vous choisissez d'étendre l'API.
#[tauri::command]
// ceci sera accessible avec `invoke('plugin:awesome|initialize')`.
// où `awesome` est le nom du plugin.
fn initialize() {}

#[tauri::command]
// ceci sera accessible avec `invoke('plugin:awesome|do_something')`.
fn do_something() {}

impl<R: Runtime> MyAwesomePlugin<R> {
  // vous pouvez ajouter des champs de configuration ici,
  // voir https://doc. ust-lang.org/1.0.0/style/ownership/builders. tml
  pub fn new() -> Self {
    Self {
      invoke_handler: Box::new(tauri::generate_handler! initialiser, faire quelque chose]),
    }
  }
}

impl<R: Runtime> Plugin<R> pour MyAwesomePlugin<R> {
  /// Le nom du plugin. Doit être défini et utilisé lors des appels `invoke`.
  fn name(&self) -> &'static str {
    "awesome"
  }

  /// Le script JavaScript à évaluer lors de l'initialisation.
  /// Utile lorsque votre plugin est accessible via `window`
  /// ou a besoin d'effectuer une tâche JavaScript lors de l'initialisation de l'application
  /// e. . "fenêtre". wesomePlugin = { ... the plugin interface }"
  fn initialization_script(&self) -> Option<String> {
    None
  }

  /// initialise le plugin avec la configuration fournie sur `tauri. onf.json > plugins > $yourPluginName` ou la valeur par défaut.
  fn initialize(&mut self, app: &AppHandle<R>, config: serde_json::Value) -> PluginResult<()> {
    Ok(())
  }

  /// Callback invoqué lorsque la fenêtre est créée.
  fn créé (&mut self, window: Fenêtre<R>) {}

  /// Callback invoqué lorsque le webview effectue la navigation.
  fn on_page_load(&mut self, window: Fenêtre<R>, payload : PageLoadPayload) {}

  /// Prolonger le gestionnaire d'appel.
  fn extend_api(&mut self, message: Invoke<R>) {
    (self.invoke_handler)(message)
  }
}
```
