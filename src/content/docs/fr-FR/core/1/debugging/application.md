Importer la commande depuis '@theme/Command'

# Débogage de l'application

Avec toutes les pièces mobiles de Tauri, vous pouvez rencontrer un problème qui nécessite un débogage. Il y a de nombreux endroits où les détails de l'erreur sont imprimés, et Tauri inclut quelques outils pour rendre le processus de débogage plus simple.

## Console de rouille

Le premier endroit où chercher des erreurs est dans la console de rouille. Ceci est dans le terminal où vous courrez, par exemple `tauri dev`. Tu peux utiliser le code suivant pour imprimer quelque chose dans cette console à partir d'un fichier Rust :

```rust
println !("Message de Rust : {}", msg);
```

Parfois, vous pouvez avoir une erreur dans votre code Rust et le compilateur Rust peut vous donner beaucoup d'informations. Si, par exemple, le dev `tauri` plante, vous pouvez le relancer sur Linux et macOS :

```shell
format@@0 RUST_BACKTRACE=1 tauri dev
```

ou comme ça sous Windows:

```shell
définir RUST_BACKTRACE=1
tauri dev
```

Cette commande vous donne une trace de pile granulaire. En général, le compilateur Rust vous aide en vous fournissant des informations détaillées sur le problème, telles que:

```
erreur[E0425]: impossible de trouver la valeur `sun` dans cette portée
  --> src/main. s:11:5
   |
11 | soleil += i.to_string().parse::<u64>(). nwrap();
   | ^^^ help: une variable locale avec un nom similaire existe : `sum`

erreur : abandon dû à l'erreur précédente

Pour plus d'informations sur cette erreur, essayez `rustc --explain E0425`.
```

## WebView Console

Faites un clic droit dans la WebView, et choisissez `Inspecter l'élément`. Cela ouvre un web-inspecteur similaire aux outils de développement Chrome ou Firefox auxquels vous êtes habitués. Vous pouvez également utiliser le raccourci `Ctrl + Shift + i` sous Linux et Windows, et `Commande + Option + i` sur macOS pour ouvrir l'inspecteur.

L'inspecteur est spécifique à la plate-forme, rendant le webkit2gtk WebInspector sur Linux, l'inspecteur de Safari sur macOS et le DevTools de Microsoft Edge sous Windows.

### Ouverture des Devtools Programmatiquement

Vous pouvez contrôler la visibilité de la fenêtre de l'inspecteur en utilisant les fonctions [`Window::open_devtools`][] et [`Window::close_devtools`][]:

```rust
utilisez tauri::Manager;
tauri::Builder::default()
  . etup(|app| {
    #[cfg(debug_assertions)] // n'inclut que ce code sur les builds de débogage
    {
      let window = app. et_window("main").unwrap();
      window.open_devtools();
      fenêtre. lose_devtools();
    }
    Ok(())
});
```

### Utiliser l'inspecteur en production

Par défaut, l'inspecteur n'est activé que dans les versions de développement et de débogage, à moins que vous ne l'activiez avec une fonctionnalité Cargo.

#### Créer une version de débogage

Pour créer une version de débogage, exécutez la commande `tauri build --debug`.

<Command name="build --debug" />

Comme les processus de compilation et de développement normaux, la compilation prend un certain temps la première fois que vous exécutez cette commande mais est beaucoup plus rapide lors des exécutions suivantes. L'application groupée finale a activé la console de développement et est placée dans `src-tauri/target/debug/bundle`.

Vous pouvez également exécuter une application construite depuis le terminal, vous donnant les notes du compilateur Rust (en cas d'erreurs) ou vos messages `println`. Naviguez dans le fichier `src-tauri/target/(release|debug)/[nom de l'application]` et exécutez-le directement dans votre console ou double-cliquez sur l'exécutable lui-même dans le système de fichiers (note : la console se ferme en cas d'erreurs avec cette méthode).

#### Activer la fonctionnalité Devtools

:::avertissement

L'API devtools est privée sur macOS. L'utilisation d'API privées sur macOS empêche votre application d'être acceptée dans l'App Store.

:::

Pour activer les devtools dans les constructions de production, vous devez activer la fonctionnalité `devtools` Cargo dans le fichier `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "...", fonctionnalités = ["...", "devtools"] }
```

## Débogage du processus de base

Le processus Core est propulsé par Rust pour que vous puissiez utiliser GDB ou LLDB pour le déboguer. Vous pouvez suivre le guide [Débogage dans VS Code][] pour apprendre comment utiliser l'extension LLDB VS Code pour déboguer le processus Core des applications Tauri.

[Débogage dans VS Code]: ./vs-code.md
[`Window::open_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.open_devtools
[`Window::close_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.close_devtools
