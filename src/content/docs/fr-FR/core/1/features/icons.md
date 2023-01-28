Importer la commande depuis '@theme/Command'

# Icônes

Tauri est livré avec une icône par défaut basée sur son logo. Ce n'est PAS ce que vous voulez quand vous envoyez votre demande. Pour remédier à cette situation commune, Tauri fournit la commande `icône` qui prendra un fichier d'entrée (`". app-icon.png"` par défaut) et créez toutes les icônes nécessaires aux différentes plateformes.

:::info Note sur les types de fichiers

- `icon.icns` = macOS
- `icon.ico` = Windows
- `*.png` = Linux
- `Carré *Logo.png` & `StoreLogo.png` = Actuellement inutilisé mais destiné aux cibles AppX/MS Store.

Notez que les types d'icônes peuvent être utilisés sur d'autres plates-formes que celles listées ci-dessus (en particulier `png`). Par conséquent, nous vous recommandons d'inclure toutes les icônes, même si vous avez l'intention de construire uniquement pour un sous-ensemble de plates-formes.

:::

## Utilisation de la commande

À partir de `@tauri-apps/cli` / `tauri-cli` version 1.1 la sous-commande `icône` fait partie du clic principal :

<Command name="icon" />

```console
Icône > cargo tauri --help
cargo-tauri-icon 1.1.

Génère diverses icônes pour toutes les plates-formes majeures

UTILISATION :
    Icône cargo tauri [OPTIONS] [INPUT]

ARGS:
    <INPUT>    Chemin vers l'icône source (png, 1240x1240px avec transparence) [default: . icône de l'application. Ng]

OPTIONS :
    -h, --help Affiche les informations d'aide
    -o, --output <OUTPUT>    Répertoire de sortie. Par défaut : répertoire 'icons' à côté du fichier tauri.conf.json
    -v, --verbose Enables verbose logging
    -V, --version Print version information
```

Par défaut, les icônes seront placées dans votre dossier `src-tauri/icones` où elles seront automatiquement incluses dans votre application construite. Si vous voulez source vos icônes à partir d'un emplacement différent, vous pouvez modifier cette partie du fichier `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "icon": [
        "icons/32x32. ng",
        "icônes/128x128. ng",
        "icônes/128x128@2x.png",
        "icônes/icône. cns",
        "icônes/icônes. co"
      ]
    }
  }
}
```

## Création manuelle des icônes

Si vous préférez construire ces icônes vous-même (si vous voulez avoir un design plus simple pour de petites tailles ou parce que vous ne voulez pas dépendre du redimensionnement de l'image interne du CLI) les tailles de couche et les noms requis pour le fichier [`icns`][] sont décrits [dans le dépôt Tauri][] et le fichier [`ico`][] doit inclure des couches pour 16, 24, 32, 48, 64 et 256 pixels. Pour un affichage optimal de l'image ICO _en développement_, le calque 32px doit être le premier calque.

[dans le dépôt Tauri]: https://github.com/tauri-apps/tauri/blob/dev/tooling/cli/src/helpers/icns.json
[`icns`]: https://en.wikipedia.org/wiki/Apple_Icon_Image_format
[`ico`]: https://en.wikipedia.org/wiki/ICO_(file_format)
