# Appel de la rouille depuis le frontend

Tauri fournit un système de commande `simple et puissant` pour appeler les fonctions Rust depuis votre application web. Les commandes peuvent accepter les arguments et les valeurs retournées. Ils peuvent également retourner des erreurs et être `async`.

## Exemple basique

Les commandes sont définies dans votre fichier `src-tauri/src/main.rs`. Pour créer une commande, ajoutez simplement une fonction et annotez-la avec `#[tauri::command]`:

```rust
#[tauri::command]
fn my_custom_command() {
  println!("J'ai été appelé à partir de JS!");
}
```

Vous devrez fournir une liste de vos commandes à la fonction du constructeur comme ceci:

```rust
// Également dans main. s
fn main() {
  tauri::Builder::default()
    // C'est là que vous passez vos commandes
    . nvoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}
```

Maintenant, vous pouvez appeler la commande à partir de votre code JS:

```js
// Lorsque vous utilisez le paquet npm de l'API Tauri:
importez { invoke } depuis '@tauri-apps/api/tauri'
// Lorsque vous utilisez le script global Tauri (si vous n'utilisez pas le paquet npm)
// Assurez-vous de définir `build. ithGlobalTauri` dans `tauri.conf.json` à true
const invoke = fenêtre.__TAURI__.invoke

// Invoque la commande
invoke('my_custom_command')
```

## Arguments de passes

Vos gestionnaires de commandes peuvent prendre des arguments :

```rust
#[tauri::command]
fn my_custom_command(invoke_message: String) {
  println!("J'ai été appelé à partir de JS, avec ce message: {}", invoke_message);
}
```

Les arguments doivent être passés en tant qu'objet JSON avec les clés CamelCase :

```js
invoke('my_custom_command', { invokeMessage: 'Bonjour!' })
```

Les arguments peuvent être de n'importe quel type, tant qu'ils implémentent [`serde::Désérialiser`][].

## Renvoi des données

Les gestionnaires de commandes peuvent également renvoyer des données :

```rust
#[tauri::command]
fn my_custom_command() -> String {
  "Bonjour de Rust!".into()
}
```

La fonction `invoque` retourne une promesse qui résout avec la valeur retournée :

```js
invoke('mon_custom_command').then((message) => console.log(message))
```

Les données retournées peuvent être de n'importe quel type, à condition qu'elles implémentent [`serde::Serialize`][].

## Gestion des erreurs

Si votre gestionnaire peut échouer et doit être en mesure de retourner une erreur, la fonction retourne un `résultat`:

```rust
#[tauri::command]
fn my_custom_command() -> Résultat<String, String> {
  // Si quelque chose échoue
  Err("This failed !". nto())
  // Si cela a fonctionné
  Ok("Cela a fonctionné!".into())
}
```

Si la commande renvoie une erreur, la promesse sera rejetée, sinon, elle résout :

```js
invoke('my_custom_command')
  .then((message) => console.log(message))
  .catch((error) => console.error(error))
```

## Commandes Async

:::note

Les commandes asynchrones sont exécutées sur un fil séparé en utilisant [`async_runtime::spawn`][]. Les commandes sans le mot-clé _async_ sont exécutées sur le thread principal, sauf si défini avec _#[tauri::command(async)]_.

:::

Si votre commande doit s'exécuter de manière asynchrone, il suffit de la déclarer comme `async`:

```rust
#[tauri::command]
async fn my_custom_command() {
  // Appelez une autre fonction async et attendez qu'elle se termine
  let result = some_async_function(). attendre;
  println!("Résultat: {}", résultat);
}
```

Puisque invoquer la commande de JS renvoie déjà une promesse, elle fonctionne comme n'importe quelle autre commande :

```js
invoke('mon_custom_command').then(() => console.log('Terminé!'))
```

## Accéder à la fenêtre dans les commandes

Les commandes peuvent accéder à l'instance `Fenêtre` qui a invoqué le message :

```rust
#[tauri::command]
async fn my_custom_command(window: tauri::Window) {
  println!("Window: {}", window.label());
}
```

## Accéder à une application dans les commandes

Les commandes peuvent accéder à une instance `AppHandle`:

```rust
#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle) {
  let app_dir = app_handle.path_resolver().app_dir();
  use tauri::GlobalShortcutManager;
  app_handle.global_shortcut_manager().register("CTRL + U", move || {});
}
```

## Accès à l'état géré

Tauri peut gérer l'état en utilisant la fonction `manage` sur `tauri::Builder`. L'état est accessible sur une commande en utilisant `tauri::State`:

```rust
struct MyState(String);

#[tauri::command]
fn my_custom_command(state: tauri::State<MyState>) {
  assert_eq!(state. == "une valeur d'état", true);
}

fn main() {
  tauri::Builder::default()
    . anage(MyState("some state value".into()))
    .invoke_handler(tauri::generate_handler![my_custom_command])
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

## Création de plusieurs commandes

Le `tauri::generate_handler !` macro prend une table de commandes. Pour enregistrer plusieurs commandes, vous ne pouvez pas appeler invoke_handler plusieurs fois. Seul le dernier appel sera utilisé. Vous devez passer chaque commande à un seul appel de `tauri::generate_handler !`.

```rust
#[tauri::command]
fn cmd_a() -> String {
    "Commande"
}
#[tauri::command]
fn cmd_b() -> String {
    "Commande b"
}

fn main() {
  tauri::Builder::default()
    . nvoke_handler(tauri::generate_handler![cmd_a, cmd_b])
    .run(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

## Exemple complet

Toutes les fonctionnalités ci-dessus peuvent être combinées :

```rust main.rs

struct Database;

#[derive(serde::Serialize)]
struct CustomResponse {
  message: String,
  other_val: usize,
}

async fn some_other_function() -> Option<String> {
  Some("response".into())
}

#[tauri::command]
async fn my_custom_command(
  window: tauri::Window,
  number: usize,
  database: tauri::State<'_, Database>,
) -> Result<CustomResponse, String> {
  println!("Called from {}", window.label());
  let result: Option<String> = some_other_function().await;
  if let Some(message) = result {
    Ok(CustomResponse {
      message,
      other_val: 42 + number,
    })
  } else {
    Err("No result".into())
  }
}

fn main() {
  tauri::Builder::default()
    .manage(Database {})
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

```js
// Invocation de JS

invoke('my_custom_command', {
  number: 42,
})
  . hen(res) =>
    console. og(`Message: ${res.message}, Autre Val: ${res.other_val}`)
  )
  .catch((e) => console.error(e))
```

[`async_runtime::spawn`]: https://docs.rs/tauri/1/tauri/async_runtime/fn.spawn.html
[`serde::Serialize`]: https://docs.serde.rs/serde/trait.Serialize.html
[`serde::Désérialiser`]: https://docs.serde.rs/serde/trait.Deserialize.html
