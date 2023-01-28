---
sidebar_position: 3
---

Importer TauriBuild depuis './\_tauri-build.md'

# macOS Bundle

Les applications Tauri pour macOS sont distribuées avec un [Pack d'Applications][] (`. pp` fichier) ou une image de disque Apple (`fichier .dmg`). La CLI Tauri regroupe automatiquement le code de votre application dans ces formats, offrant des options pour coconcevoir et notarier votre application. Please note that `.app` and `.dmg` bundles can **only be created on macOS** as cross-compilation doesn't work yet.

:::note

Les applications GUI sur macOS et Linux n'héritent pas des `$PATH` de vos dotfiles shell (`. ashrc`, `.bash_profile`, `.zshrc`, etc.). Consultez la caisse [fix-path-env-rs][] de Tauri pour résoudre ce problème.

:::

<TauriBuild />

## Définir une version minimale du système

La version minimale du système d'exploitation nécessaire pour qu'une application Tauri puisse fonctionner sur macOS est `10.13`. Si vous avez besoin du support pour les nouvelles API macOS comme `window.print` qui n'est pris en charge que depuis la version macOS `11.` à partir de là, vous pouvez changer la [`tauri.bundle.macOS.minimumSystemVersion`][]. Cela définira la propriété `Info.plist` [LSMinimumSystemVersion][] et la variable d'environnement `MACOSX_DEPLOYMENT_TARGET`.

## Cibles binaires

Vous pouvez compiler votre application en ciblant des binaires Apple Silicon, des ordinateurs Mac basés sur Intel, ou des binaires macOS universels. Par défaut, le CLI construit un binaire ciblant l'architecture de votre machine. Si vous voulez construire pour une cible différente, vous devez d'abord installer la cible de rouille manquante pour cette cible en exécutant `rustup target ajouter aarch64-apple-darwin` ou `la cible de rustup ajoute x86_64-apple-darwin`, alors vous pouvez construire votre application en utilisant le drapeau `--target`:

- `tauri build --target aarch64-pomle-darwin`: cible les machines à silicium Apple.
- `tauri build --target x86_64-apple-darwin`: cible les machines Intel.
- `tauri build --target universal-apple-darwin`: produit un [binaire universel macOS][] qui fonctionne à la fois sur les Mac Apple silicone et Intel.

Alors que les machines silicones Apple peuvent exécuter des applications compilées pour Macs basés sur Intel, à travers une couche de traduction appelée [Rosetta][], Cela conduit à une réduction des performances en raison des traductions des instructions du processeur. Il est courant de permettre à l'utilisateur de choisir la cible correcte lors du téléchargement de l'application, mais vous pouvez également choisir de distribuer un [Binaire Universel][universal macos binary]. Les binaires universels incluent à la fois les exécutables `aarch64` et `x86_64` , vous donnant la meilleure expérience sur les deux architectures. Notez toutefois que cela augmente considérablement la taille de votre paquet.

## Personnalisation du lot d'application

Le fichier de configuration de Tauri fournit les options suivantes pour personnaliser votre lot d'application :

- **Nom de lot :** Le nom lisible par l'homme de votre application. Configuré par la propriété [`package.productName`][].
- **Version du bundle :** La version de votre application. Configuré par la propriété [`package.version`][].
- **Catégorie d'application :** La catégorie qui décrit votre application. Configuré par la propriété [`tauri.bundle.category`][]. Vous pouvez voir une liste des catégories macOS [ici][macos app categories].
- **Droit d'auteur :** Une chaîne de copyright associée à votre application. Configuré par la propriété [`tauri.bundle.copyright`][].
- **Icône de Bundle :** L'icône de votre application. Utilise le premier fichier `.icns` listé dans le tableau [`tauri.bundle.icon`][].
- **Version minimale du système :** Configurée par la propriété [`tauri.bundle.macOS.minimumSystemVersion`][].
- **Fichier de licence DMG :** Une licence qui est ajoutée au fichier `.dmg`. Configurer par la propriété [`tauri.bundle.macOS.license`][].
- **[Fichier Entitlements.plist][]:** Les droits contrôlent les API auxquelles votre application aura accès. Configuré par la propriété [`tauri.bundle.macOS.entitlements`][].
- **Domaine d'exception :** un domaine non sécurisé auquel votre application peut accéder tel qu'un `localhost` ou un domaine distant `http`. C'est une configuration de commodité autour de `NSAppTransportSecurity > NSExceptionDomains` définissant `NSExceptionAllowsInsecureHTTPLoads` et `NSIncludesSubdomains` à true. Voir [`tauri.bundle.macOS.exceptionDomain`][] pour plus d'informations.

:::info

Ces options génèrent le lot d'application [fichier Info.plist][]. Vous pouvez étendre le fichier généré avec votre propre fichier `Info.plist` stocké dans le dossier Tauri (`src-tauri` par défaut). Le CLI fusionne à la fois les fichiers `.plist` en production, et la couche centrale les intègre dans le binaire pendant le développement.

:::

[Pack d'Applications]: https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html
[`tauri.bundle.macOS.minimumSystemVersion`]: ../../api/config.md#macconfig.minimumsystemversion
[LSMinimumSystemVersion]: https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion
[binaire universel macOS]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[universal macos binary]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[Rosetta]: https://support.apple.com/en-gb/HT211861
[macos app categories]: https://developer.apple.com/app-store/categories/
[`package.productName`]: ../../api/config.md#packageconfig.productname
[`package.version`]: ../../api/config.md#packageconfig.version
[`tauri.bundle.category`]: ../../api/config.md#bundleconfig.category
[`tauri.bundle.copyright`]: ../../api/config.md#bundleconfig.copyright
[`tauri.bundle.icon`]: ../../api/config.md#bundleconfig.icon
[`tauri.bundle.macOS.license`]: ../../api/config.md#bundleconfig.icon
[Fichier Entitlements.plist]: https://developer.apple.com/documentation/bundleresources/entitlements
[`tauri.bundle.macOS.entitlements`]: ../../api/config.md#macconfig.entitlements
[`tauri.bundle.macOS.exceptionDomain`]: ../../api/config.md#macconfig.exceptiondomain
[fichier Info.plist]: https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html
[fix-path-env-rs]: https://github.com/tauri-apps/fix-path-env-rs
