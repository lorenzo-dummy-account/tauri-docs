# Créer votre propre CLI

Tauri permet à votre application d'avoir un CLI via [clap](https://github.com/clap-rs/clap), un analyseur d'arguments robuste en ligne de commande. Avec une définition simple de CLI dans votre `tauri.conf. son` fichier, vous pouvez définir votre interface et lire la carte de ses arguments correspondants sur JavaScript et/ou Rust.

## Configuration de base

Sous `tauri.conf.json`, vous avez la structure suivante pour configurer l'interface :

```json title=src-tauri/tauri.conf.json
{
  "tauri": {
    "cli": {
      "description": "", // description de la commande affichée à l'aide
      "longDescription": "", // description longue de la commande affichée à l'aide
      "beforeHelp": "", // contenu à afficher avant le texte d'aide
      "afterHelp": "", // contenu à afficher après le texte d'aide
      "args": [], // liste des arguments de la commande, nous l'expliquerons plus tard
      "subcommands": {
        "subcommand-name": {
          // configure une sous-commande accessible
          // avec `. app subcommand-name --arg1 --arg2 --etc`
          // configuration comme ci-dessus, avec "description", "args", etc.
        }
      }
    }
  }
}
```

:::note

Toutes les configurations JSON ici ne sont que des échantillons, de nombreux autres champs ont été omis par souci de clarté.

:::

## Ajout d'arguments

La table `args` représente la liste des arguments acceptés par sa commande ou sous-commande. Vous pouvez trouver plus de détails sur la façon de les configurer [ici][tauri config].

### Arguments positionnels

Un argument positionnel est identifié par sa position dans la liste des arguments. Avec la configuration suivante :

```json tauri.conf.json
{
  "args": [
    {
      "name": "source",
      "index": 1,
      "takesValue": vrai
    },
    {
      "name": "destination",
      "index": 2,
      "takesValue": vrai
    }
  ]
}
```

Les utilisateurs peuvent exécuter votre application en tant que `./app tauri.txt dest. xt` et la carte des correspondances de l'arg définira la `source` comme `"tauri. xt"` et `destination` comme `"dest.txt"`.

### Arguments nommés

Un argument nommé est une paire (clé, valeur) où la clé identifie la valeur. Avec la configuration suivante :

```json tauri.conf.json
{
  "args": [
    {
      "name": "type",
      "court": "t",
      "takesValue": vrai,
      "multiple": true,
      "possibleValues": ["foo", "bar"]
    }
  ]
}
```

Les utilisateurs peuvent exécuter votre application en tant que `./app --type foo bar`, `. app -t foo -t bar` ou `. app --type=foo,bar` et la carte des correspondances à l'arg définiront `type` comme `["foo", "bar"]`.

### Arguments du drapeau

Un argument de drapeau est une clé autonome dont la présence ou l'absence fournit des informations à votre application. Avec la configuration suivante :

```json tauri.conf.json
{
  "args": [
    "name": "verbose",
    "short": "v",
    "multipleOccurrences": true
  ]
}
```

Les utilisateurs peuvent exécuter votre application en tant que `./app -v -v -v`, `. app --verbose --verbose --verbose` ou `. app -vvv` et la carte des correspondances arg définiront `verbeux` comme `true`, avec `occurrences = 3`.

## Sous-commandes

Certaines applications CLI ont des interfaces supplémentaires en tant que sous-commandes. Par exemple, le CLI `git` a la branche `git`, `git commit` et `git push`. Vous pouvez définir des interfaces imbriquées supplémentaires avec le tableau `sous-commandes`:

```json tauri.conf.json
{
  "cli": {
...
    "subcommands": {
      "branche": {
        "args": []
      },
      "push": {
        "args": []
      }
    }
  }
 } } } } }
```

Sa configuration est la même que la configuration de l'application racine, avec la `description`, `longDescription`, `args`, etc.

## Lecture des matchs

### Rouille

```rust
fn main() {
  tauri::Builder::default()
    .setup(|app| {
      match app.get_cli_matches() {
        // `matches` ici est une Structe avec { args, subcommand }.
        // `args` est `HashMap<String, ArgData>` où `ArgData` est un struct avec { value, occurrences }.
        // `subcommand` est `Option<Box<SubcommandMatches>>` où `SubcommandMatches` est un struct avec { name, matches }.
        Ok(matchs) => {
          println! "{:?}", matchs)
        }
        Err(_) => {}
      }
      Ok(())
    })
    . un(tauri::generate_context!())
    .expect("erreur lors de l'exécution de l'application tauri");
}
```

### JavaScript

```js
importer { getMatches } depuis '@tauri-apps/api/cli'

getMatches().then((matchs) => {
  // faire quelque chose avec les { args, subcommand } correspondances
})
```

## Documentation complète

Vous pouvez en savoir plus sur la configuration du CLI [ici][tauri config].

[tauri config]: ../../api/config.md#tauri
