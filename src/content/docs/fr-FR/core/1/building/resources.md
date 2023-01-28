---
sidebar_position: 8
---

# Intégrer des fichiers supplémentaires

Vous devrez peut-être inclure des fichiers supplémentaires dans votre paquet d'application qui ne font pas partie de votre interface (votre `distDir`) directement ou qui sont trop gros pour être inclus dans le binaire. Nous appelons ces fichiers `ressources`.

Pour regrouper les fichiers de votre choix, vous pouvez ajouter la propriété `resources` au bundle `tauri >` dans votre `tauri. fichier onf.json`.

En savoir plus sur la configuration de tauri.conf.json [ici][tauri.bundle].

`resources` attend une liste de chaînes de caractères ciblant des fichiers avec des chemins absolus ou relatifs. Il supporte les motifs glob au cas où vous auriez besoin d'inclure plusieurs fichiers à partir d'un répertoire.

Voici un exemple pour illustrer la configuration. Ce n'est pas un fichier `tauri.conf.json` complet :

```json title=tauri.conf.json
{
  "tauri": {
    "bundle": {
      "resources": [
        "/absolute/path/to/textfile. xt",
        "relative/chemin/vers/jsonfile. fils",
        "ressources/*"
      ]
    },
    "allowlist": {
      "fs": {
        "scope": ["$RESOURCE/*"]
      }
    }

}
```

:::note

Les chemins et chemins absolus contenant les composants parents (`../`) ne peuvent être autorisés que via `"$RESOURCE/*"`. Les chemins relatifs tels que `"path/to/file.txt"` peuvent être autorisés explicitement via `"$RESOURCE/path/to/file.txt"`.

:::

## Accès aux fichiers en JavaScript

Dans cet exemple, nous voulons regrouper d'autres fichiers json i18n qui ressemblent à ceci :

```json title=de.json
{
  "hello": "Guten Tag!",
  "bye": "Auf Wiedersehen!"
}
```

Dans ce cas, nous stockons ces fichiers dans un répertoire `lang` à côté du `tauri.conf.json`. Pour cela, nous ajoutons `"lang/*"` à `ressources` et `$RESOURCE/lang/*` à la portée des fs comme indiqué ci-dessus.

Notez que vous devez configurer la liste d'autorisations pour activer `path > all` et les [`fs` APIs][] dont vous avez besoin, dans cet exemple `fs > readTextFile`.

```javascript
import { resolveResource } from '@tauri-apps/api/path'
// alternatively, use `window.__TAURI__.path.resolveResource`
import { readTextFile } from '@tauri-apps/api/fs'
// alternatively, use `window.__TAURI__.fs.readTextFile`

// `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
const resourcePath = await resolveResource('lang/de.json')
const langDe = JSON.parse(await readTextFile(resourcePath))

console.log(langDe.hello) // This will print 'Guten Tag!' to the devtools console
```

## Accès aux fichiers dans Rust

Ceci est basé sur l'exemple ci-dessus. Sur le côté Rust vous avez besoin d'une instance du [`PathResolver`][] que vous pouvez obtenir de [`App`][] et [`AppHandle`][]:

```rust
tauri::Builder::default()
  .setup(|app| {
    let resource_path = app.path_resolver()
      .resolve_resource("lang/de. fils")
      . xpect("impossible de résoudre la ressource");

    let file = std::fs::File::open(&resource_path). nwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    println!("{}", lang_de. et("hello").unwrap()); // Ceci affichera 'Guten Tag!' vers le terminal

    Ok(())
})
```

```rust
#[tauri::command]
fn hello(handle: tauri::AppHandle) -> String {
   let resource_path = handle. ath_resolver()
      .resolve_resource("lang/de.json")
      . xpect("impossible de résoudre la ressource");

    let file = std::fs::File::open(&resource_path). nwrap();
    let lang_de: serde_json::Value = serde_json::from_reader(file).unwrap();

    lang_de.get("hello").unwrap()
}
```

[tauri.bundle]: ../../api/config.md#tauri.bundle
[`fs` APIs]: ../../api/js/fs/
[`PathResolver`]: https://docs.rs/tauri/latest/tauri/struct.PathResolver.html
[`App`]: https://docs.rs/tauri/latest/tauri/struct.App.html
[`AppHandle`]: https://docs.rs/tauri/latest/tauri/struct.AppHandle.html
