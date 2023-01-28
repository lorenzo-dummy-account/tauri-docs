---
sidebar_label: Signature de code Linux
sidebar_position: 3
---

# Paquets Linux de signature de code

Ce guide fournit des informations sur la signature de code pour les paquets Linux.

## Exigences

- gpg ou gpg2

Une clé de signature doit être préparée. Une nouvelle génération peut être générée en utilisant :

```shell
gpg2 --clé gen-complète
```

Veuillez vous référer à la documentation de gpg ou gpg2 pour plus d'informations. Vous devriez prendre des précautions supplémentaires pour sauvegarder vos clés privées et publiques dans un endroit sûr.

## Signature pour les images d'applications

Vous pouvez intégrer une signature dans l'AppImage en définissant les variables d'environnement suivantes :

- **SIGN**: définir à `1` pour signer l'AppImage.
- **SIGN_KEY**: variable facultative pour utiliser une clé spécifique GPG pour signer.
- **APPIMAGETOOL_SIGN_PASSPHRASE**: la clé de signature mot de passe. Si non défini, gpg affiche une boîte de dialogue pour que vous puissiez la saisir. Vous devez définir ceci lors de l'exécution de tâches automatisées.

Vous pouvez afficher la signature intégrée dans l'AppImage en exécutant la commande suivante :

```shell
./src-tauri/target/release/bundle/appimage/$APPNAME_$VERSION_amd64.AppImage --appimage-signature
```

Notez que vous devez modifier les valeurs $APPNAME et $VERSION avec les valeurs correctes basées sur votre configuration.

:::prudence La signature n'est pas vérifiée

AppImage ne valide pas la signature, vous ne pouvez donc pas compter sur elle pour vérifier si le fichier a été altéré ou non. Pour valider la signature, vous devez fournir un outil externe pour vos utilisateurs. Voir [la documentation officielle d'AppImage][] pour plus d'informations.

:::

[la documentation officielle d'AppImage]: https://docs.appimage.org/packaging-guide/optional/signatures.html
