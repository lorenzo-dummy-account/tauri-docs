Importer HelloTauriWebdriver depuis '@site/static/img/webdriver/hello-tauri-webdriver.png'

# Exemple de configuration

Cet exemple d'application se concentre uniquement sur l'ajout de tests WebDriver à un projet déjà existant. Pour avoir un projet à tester dans les deux sections suivantes, nous allons mettre en place une application Tauri extrêmement minimale à utiliser dans notre test. Nous n'utiliserons pas le CLI Tauri, les dépendances du frontend ou les étapes de compilation, et ne regrouperons pas l'application par la suite. Il s'agit de présenter exactement une suite minimale pour montrer l'ajout de WebDriver test à une application existante.

Si vous voulez juste voir le projet d'exemple terminé qui utilise ce qui sera montré dans ce guide d'exemple, alors vous pouvez voir https://github. om/chippers/hello_tauri.

## Initialisation d'un projet de fret

Nous voulons créer un nouveau projet Cargo binaire pour héberger cet exemple d'application. Nous pouvons facilement le faire à partir de la ligne de commande avec `cargo nouveau hello-tauri-webdriver --bin`, qui fera échafauder un projet Cargo binaire minimal pour nous. Ce répertoire servira de répertoire de travail pour le reste de ce guide, donc assurez-vous que les commandes que vous exécutez sont à l'intérieur de ce nouveau répertoire `hello-tauri-webdriver/`.

## Création d'une interface minimale

Nous allons créer un fichier HTML minimal pour agir comme le front end de notre application par exemple. Nous utiliserons également quelques choses de ce site web plus tard lors de nos tests WebDriver.

Tout d'abord, créons notre Tauri `distDir` dont nous savons que nous aurons besoin une fois que nous construirons la portion Tauri de l'application. `mkdir dist` doit créer un nouveau répertoire appelé `dist/` dans lequel nous allons placer le fichier `index.html` suivant.

`dist/index.html`:

```html
<! OCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Bonjour Tauri!</title>
    <style>
      corps {
        /* Ajoute une belle couleur */
        couleur d'arrière-plan : #222831;
        couleur : #ececec ;

        /* Faire du corps la taille exacte de la fenêtre */
        marge : 0 ;
        hauteur: 100vh;
        largeur: 100vw;

        /* Centrent verticalement et horizontalement les enfants de la balise body */
        affichage : flex;
        justification-contenu: centre;
        alignements-éléments : centre ;
      }
    </style>
  </head>
  <body>
    <h1>Bonjour, « Tauri! »</h1>
  </body>
</html>
```

## Ajouter Tauri au Projet Cargo

Ensuite, nous ajouterons les objets nécessaires pour transformer notre projet Cargo en projet Tauri. Tout d'abord, est d'ajouter les dépendances au Manifeste de Cargo (`Cargo. oml`) pour que Cargo sache tirer dans nos dépendances pendant la construction.

`Cargo.toml`:

```toml
[package]
nom = "hello-tauri-webdriver"
version = "0.1.0"
édition = "2021"
rust-version = "1. 6"

# Nécessite de configurer certaines choses pour Tauri au moment de la compilation
[build-dependencies]
tauri-build = "1"

# La dépendance Tauri réelle, avec `custom-protocol` pour servir les pages.
[dependencies]
tauri = { version = "1", features = ["custom-protocol"] }

# Make --release build a binary that is small (opt-level = "s") and fast (lto = true).
# Ceci est complètement optionnel, mais montre que tester l'application aussi près des paramètres de la version
# typique est possible. Note : cela ralentira la compilation.
[profile.release]
incrémentiel = faux
codegen-unités = 1
panique = "abandon"
opt-level = """
lto = true
```

Nous avons ajouté un `[build-dependency]` comme vous l'avez peut-être remarqué. Pour utiliser la dépendance de compilation, nous devons l'utiliser à partir d'un script de compilation. Nous allons en créer un maintenant sur `build.rs`.

`build.rs`:

```rust
fn main() {
    // Surveille uniquement le dossier `dist/` pour la recompilation, empêchant les changements inutiles
    // lorsque nous changeons des fichiers dans d'autres sous-répertoires de projet.
    println!("cargo:rerun-if-changed=dist");

    // Exécute les aides Tauri de construction
    tauri_build::build()
}
```

Notre projet Cargo sait maintenant comment intégrer et construire nos dépendances Tauri avec tout ce qui est installé. Finissons de faire cet exemple minimal d'application Tauri en configurant Tauri dans le code du projet. Nous allons éditer le fichier `src/main.rs` pour ajouter cette fonctionnalité Tauri.

`src/main.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("impossible d'exécuter l'application Tauri");
}
```

Assez simple, n'est-ce pas?

## Tauri Configuration

Nous allons avoir besoin de 2 choses pour construire l'application avec succès. Tout d'abord, nous avons besoin d'un fichier d'icônes. Vous pouvez utiliser n'importe quel PNG pour cette partie suivante et le copier dans `icon.png`. Généralement, cela sera fourni dans le cadre de l'échafaudage lorsque vous utiliserez le CLI Tauri pour créer un projet. Pour obtenir l'icône Tauri par défaut, nous pouvons télécharger l'icône utilisée par le dépôt d'exemple Hello Tauri avec la commande `curl -L "https://github. om/chippers/hello_tauri/raw/main/icon.png" --output icon.png`.

Nous aurons besoin d'un `tauri.conf.json` pour définir des valeurs de configuration importantes pour Tauri. Encore une fois, cela viendrait typiquement de la commande `tauri init` échafaudage, mais nous allons créer notre propre configuration minimale ici.

`tauri.conf.json`:

```json
{
  "build": {
    "distDir": "dist"
  },
  "tauri": {
    "bundle": {
      "identifier": "studio. hello_tauri_webdriver",
      "icon": ["icon. ng"]
    },
    "allowlist": {
      "all": faux
    },
    "windows": [
      {
        "width": 800,
        "hauteur": 600,
        "redimensionnable": vrai,
        "fullscreen": false
      }
    ]
  }
}
```

« Je vais en examiner quelques-unes. » Vous pouvez voir le répertoire `dist/` que nous avons créé précédemment spécifié comme la propriété `distDir`. Nous avons défini un identifiant de paquet pour que l'application construite ait un id unique et définisse l'icône `. ng` comme la seule icône . Nous n'utilisons pas d'API ou de fonctionnalités Tauri, donc nous les désactivons dans la `liste d'autorisations` en définissant `"all": false`. Les valeurs de la fenêtre ne définissent qu'une seule fenêtre à créer avec des valeurs raisonnables par défaut.

A ce stade, nous avons une application de base Hello World qui devrait afficher un salut simple lors de l'exécution.

## Exécution de l'Exemple Application

Pour être sûr que nous avons bien fait, construisons cette application! Nous allons l'exécuter sous la forme d'une application `--release` car nous allons également exécuter nos tests WebDriver avec un profil de publication. Exécutez `cargo run --release`, et après une certaine compilation, nous devrions voir apparaître l'application suivante.

<div style={{textAlign: 'center'}}>
  <img src={HelloTauriWebdriver}/>
</div>

_Note : Si vous modifiez l'application et que vous voulez utiliser les Devtools, alors exécutez-le sans `--release` et "Inspecter l'élément devrait être disponible dans le menu du clic droit._

Nous devrions maintenant être prêts à commencer à tester cette application avec quelques frameworks WebDriver. Ce guide ira sur [WebdriverIO](webdriverio) et [Selenium](selenium) dans cet ordre.
