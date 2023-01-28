---
sidebar_position: 4
---

Importer TauriBuild depuis './\_tauri-build.md'

# Pack Linux

## Limitation

Les bibliothèques de base telles que glibc rompent fréquemment la compatibilité avec les anciens systèmes. Pour cette raison, vous devez construire votre application Tauri en utilisant le plus ancien système de base que vous comptez supporter. Un système relativement vieux comme Ubuntu 18.04 est plus adapté que Ubuntu 22.04, comme le binaire compilé sur Ubuntu 22. 4 aura une exigence plus élevée de la version de la glibc, donc lorsque vous exécutez sur un ancien système, vous allez faire face à une erreur d'exécution comme `/usr/lib/libc. o.6 : version 'GLIBC_2.33' introuvable`. Nous vous recommandons d'utiliser un conteneur Docker ou des actions GitHub pour construire votre application Tauri pour Linux.

Voir les problèmes [tauri-apps/tauri#1355][] et [rust-lang/rust#57497][], en plus du [guide AppImage][] pour plus d'informations.

## Debian

Tauri permet à votre application d'être empaquetée en tant que fichier `.deb` (paquet Debian). Le CLI Tauri regroupe les binaires de votre application et les ressources supplémentaires dans ce format si vous construisez sous Linux. Veuillez noter que les paquets `.deb` ne peuvent **être créés que sur Linux** car la compilation croisée ne fonctionne pas encore.

Le paquet Debian généré par le bundler Tauri contient tout ce dont vous avez besoin pour envoyer votre application aux distributions Linux basées sur Debian, définissant les icônes de votre application, générant un fichier de bureau et spécifiant les dépendances `libwebkit2gtk-4. -37` et `libgtk-3-0`, ainsi que `libappindicator3-1` si votre application utilise la barre d'état système.

:::note
Les applications GUI sur macOS et Linux n'héritent pas de `$PATH` de vos fichiers shell (`. ashrc`, `.bash_profile`, `.zshrc`, etc.). Consultez la caisse [fix-path-env-rs](https://github.com/tauri-apps/fix-path-env-rs) de Tauri pour résoudre ce problème.
:::

<TauriBuild />

### Fichiers personnalisés

Tauri expose quelques configurations pour le paquet Debian au cas où vous auriez besoin de plus de contrôle.

Si votre application dépend des dépendances système supplémentaires, vous pouvez les spécifier dans `tauri.conf.json > tauri > bundle > deb > dépend`.

Pour inclure des fichiers personnalisés dans le paquet Debian, vous pouvez fournir une liste de fichiers ou de dossiers dans `tauri. onf.json > tauri > bundle > deb > fichiers`. The configuration object maps the path in the Debian package to the path to the file on your filesystem, relative to the `tauri.conf.json` file. Voici un exemple de configuration :

```json
{
  "tauri": {
    "bundle": {
      "deb": {
        "files": {
          "/usr/share/README. d": "../README.md", // copie le fichier README.md vers /usr/share/README. d
          "usr/share/assets": ".. assets/" // copie le répertoire entier des assets dans /usr/share/assets
        }
      }
    }
  }
}
```

Si vous avez besoin de regrouper des fichiers de manière multiplateforme, vérifiez les mécanismes [ressource][] et [sidecar][] de Tauri.

## AppImage

AppImage est un format de distribution qui ne repose pas sur les paquets installés par le système et qui regroupe à la place toutes les dépendances et les fichiers nécessaires à l'application. Pour cette raison, le fichier de sortie est plus grand mais plus facile à distribuer car il est supporté sur de nombreuses distributions Linux et peut être exécuté sans installation. L'utilisateur a juste besoin de rendre le fichier exécutable (`chmod a+x MyProject. ppImage`) et peut ensuite l'exécuter (`./MyProject.AppImage`).

AppImages est pratique, simplifiant le processus de distribution si vous ne pouvez pas créer un paquet ciblant le gestionnaire de paquets de la distribution. Cependant, vous devriez l'utiliser avec précaution car la taille du fichier passe de 2 à 6 Mo à 70 Mo et plus.

:::prudence

Si votre application lit l'audio/la vidéo, vous devez activer `tauri.conf.json > tauri > bundle > appimage > bundleMediaFramework`. Cela augmentera la taille du bundle AppImage pour inclure des fichiers `gstreamer` nécessaires à la lecture des médias. Ce drapeau n'est actuellement pris en charge que sur les systèmes de compilation Ubuntu.

:::

[ressource]: resources.md
[sidecar]: sidecar.md
[tauri-apps/tauri#1355]: https://github.com/tauri-apps/tauri/issues/1355
[rust-lang/rust#57497]: https://github.com/rust-lang/rust/issues/57497
[guide AppImage]: https://docs.appimage.org/reference/best-practices.html#binaries-compiled-on-old-enough-base-system
