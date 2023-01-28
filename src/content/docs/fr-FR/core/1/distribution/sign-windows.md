---
sidebar_label: Signature du code Windows
sidebar_position: 2
---

# Windows - Guide de signature de code localement & avec GitHub Actions

## Introduction

La signature de code de votre application permet aux utilisateurs de savoir qu'ils ont téléchargé l'exécutable officiel de votre application et non un logiciel malveillant tiers qui se présente comme votre application. Bien qu'il ne soit pas nécessaire, il améliore la confiance des utilisateurs dans votre application.

## Pré-requis

- Windows - vous pouvez probablement utiliser d'autres plates-formes, mais ce tutoriel utilise des fonctionnalités natives de Powershell.
- Une application Tauri fonctionnelle
- Certificat de signature de code - vous pouvez en acquérir un sur les services listés dans la documentation de [Microsoft][]. Il y a probablement des autorités supplémentaires pour les certificats autres que ceux inclus dans cette liste, veuillez les comparer vous-même et en choisir une à vos propres risques.
  - Veuillez vous assurer d'avoir un certificat **de signature de code** , les certificats SSL ne fonctionnent pas !

Ce guide suppose que vous avez un certificat de signature de code standard> Si vous avez un certificat EV, qui implique généralement un jeton matériel, veuillez suivre la documentation de votre émetteur à la place.

:::note

Si vous signez l'application avec un certificat EV, elle recevra une réputation immédiate avec Microsoft SmartScreen et ne montrera aucun avertissement aux utilisateurs.

Si vous optez pour un certificat OV, qui est généralement moins cher et disponible pour les personnes, Microsoft SmartScreen affichera toujours un avertissement aux utilisateurs lorsqu'ils téléchargeront l'application. Cela peut prendre un certain temps jusqu'à ce que votre certificat construise suffisamment de réputation. Vous pouvez choisir de [soumettre votre application][] à Microsoft pour vérification manuelle. Bien que non garanti, si l'application ne contient aucun code malveillant, Microsoft peut accorder une réputation supplémentaire et potentiellement supprimer l'avertissement pour ce fichier téléchargé spécifique.

:::

## Commencer

Il y a quelques choses que nous devons faire pour préparer Windows à la signature de code. Cela inclut la conversion de notre certificat dans un format spécifique, l'installation de ce certificat et le décodage des informations requises du certificat.

### R. Convertissez votre `.cer` en `.pfx`

1. Vous aurez besoin des éléments suivants :

   - fichier de certificat (mien est `cert.cer`)
   - fichier de clé privée (mien est `private-key.key`)

2. Ouvrez une invite de commande et changez vers votre répertoire actuel en utilisant `cd Documents/Certs`

3. Convertissez votre `.cer` en un `.pfx` en utilisant `openssl pkcs12 -export -in cert.cer -inkey private-key.key -out certificate.pfx`

4. Vous devriez être invité à entrer un mot de passe d'exportation **NE L'OUGISTREZ PAS !**

### B. Importez votre fichier `.pfx` dans le magasin de clés.

Nous devons maintenant importer notre fichier `.pfx`.

1. Assigner votre mot de passe d'exportation à une variable en utilisant `$WINDOWS_PFX_PASSWORD = 'MYPASSWORD'`

2. Maintenant, Importez le certificat en utilisant `Import-PfxCertificate -FilePath Certs/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_PFX_PASSWORD -Force -AsPlainText)`

### C. Préparer les variables

1. Nous avons besoin de l'impression de pouce SHA-1 du certificat; vous pouvez l'obtenir en utilisant `openssl pkcs12 -info -in certificate.pfx` et regarder ci-dessous

```
Attributs de sac
    localKeyID : A1 B1 A2 B2 A3 B3 B4 B4 A5 B5 A6 B6 A7 B7 B7 B8 B8 B8 B9 A0 B0 B0
```

2. Vous allez capturer le `localKeyID` mais sans espace, dans cet exemple, ce serait `A1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0`. Ceci est notre `certificateThumbprint`.

3. Nous avons besoin de l'algorithme de résumé SHA utilisé pour votre certificat (Indice : ceci est probable `sha256`

4. Nous avons également besoin d'une URL d'horodatage ; c'est un serveur de temps utilisé pour vérifier l'heure de la signature du certificat. J'utilise `http://timestamp.comodoca.com`, mais celui qui vous a obtenu votre certificat en a aussi un.

## Préparez le fichier `tauri.conf.json`

1. Maintenant que nous avons notre `certificateThumbprint`, `digestAlgorithm`, & `timestampUrl` nous allons ouvrir le `tauri. onf.json`.

2. Dans la section `tauri.conf.json` vous allez chercher le bundle `tauri` -> `` -> `fenêtres`. Vous voyez, il y a trois variables pour les informations que nous avons capturées. Remplissez-le comme ci-dessous.

```json tauri.conf.json
"windows": {
        "certificateThumbprint": "A1B1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0B0",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com"
}
```

3. Enregistrer et exécuter `yarn | yarn build`

4. Dans la sortie console, vous devriez voir la sortie suivante.

```
info: app de signature
info: lancez signtool "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041. \\x64\\signtool.exe"
info: "Terminé Ajouter un magasin supplémentaire\r\nsignée avec succès : PATTENTION DU FICHIER ICI
```

Ce qui montre que vous avez signé avec succès le `.exe`.

Et voilà! Vous avez signé avec succès votre fichier .exe.

## BONUS : Signez votre application avec GitHub Actions.

Nous pouvons également créer un workflow pour signer l'application avec des actions GitHub.

### GitHub Secrets

Nous devons ajouter quelques secrets GitHub pour la bonne configuration de GitHub Action. Ils peuvent être nommés comme vous le souhaitez.

- Vous pouvez consulter le guide des [secrets chiffrés][] sur comment ajouter des secrets GitHub.

Les secrets que nous avons utilisés sont les suivants

|            GitHub Secrets            |                                                               Valeur pour la variable                                                                |
|:------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------:|
|         CERTIFICATE_WINDOWS          | La version encodée en Base64 de votre certificat .pfx, peut être faite en utilisant cette commande `certutil -encode certificate.pfx base64cert.txt` |
| Mot de passe du CERTIFICATE_PASSWORD |                               Mot de passe d'exportation du certificat utilisé lors de la création du certificat .pfx                                |

### Modifications du flux de travail

1. Nous devons ajouter une étape dans le workflow pour importer le certificat dans l'environnement Windows. Ce workflow accomplit les tâches suivantes

   1. Assigner des secrets GitHub aux variables d'environnement
   2. Créer un nouveau répertoire `certificat`
   3. Importer `WINDOWS_CERTIFICATE` dans tempCert.txt
   4. Utilisez `certutil` pour décoder le tempCert.txt de base64 dans un fichier `.pfx`.
   5. Supprimer tempCert.txt
   6. Importez le `. fx` fichier dans le Cert store de Windows & convertissez le `WINDOWS_CERTIFICATE_PASSWORD` en une chaîne sécurisée à utiliser dans la commande d'importation.

2. Nous allons utiliser le [`tauri-action` publier le modèle][].

```yml
nom: 'publish'
sur:
  push:
    branches :
      - release

jobs:
  publish-tauri:
    strategy:
      fail-fast: false
      matrice:
        platform: [macos-latest, dernier ubuntu, windows-latest]

    runs-on: ${{ matrix.platform }}
    étapes :
      - utilisations : actions/checkout@v2
      - nom: config node
        utilisations : actions/setup-node@v1
        avec:
          node-version: 12
      - nom: installer Rust stable
        uses: actions-rs/toolchain@v1
        avec:
          toolchain: stable
      - nom: installer webkit2gtk (ubuntu seulement)
        if: matrice. latform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-4.
      - nom: installez les dépendances des applications et construisez-les
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN : ${{ secrets.GITHUB_TOKEN }}
        avec:
          tagName: app-v__VERSION__ # l'action remplace automatiquement \_\_VERSION\_\_ avec la version
          releaseName: 'App v__VERSION__'
          releaseBody: 'Voir les ressources pour télécharger cette version et installer.'
          releaseDraft: true
          prerelease: false
```

3. Juste au-dessus de `-name : installez les dépendances des applications et construisez-les` vous devrez ajouter l'étape suivante

```yml
- nom : certificat Windows d'importation
  si : matrice. latform == 'windows-latest'
  env:
    WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
    WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  run: |
    New Item -ItemType directory -Path certificate
    Set-Content -Path certificate/tempCert. xt -Value $env:WINDOWS_CERTIFICATE
    certutil -decode certificate/tempCert.txt certificate/certificate.pfx
    Remove-Item -path certificate -include tempCert. xt
    Import-PfxCertificate -FilePath certificate/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_CERTIFICATE_PASSWORD -Force -AsPlainText)
```

4. Enregistrez et poussez dans votre dépôt.

5. Votre flux de travail peut maintenant importer votre certificat Windows et l'importer dans l'exécuteur GitHub, permettant la signature automatique de code !

[Microsoft]: https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-cert-manage
[soumettre votre application]: https://www.microsoft.com/en-us/wdsi/filesubmission/
[secrets chiffrés]: https://docs.github.com/en/actions/reference/encrypted-secrets
[`tauri-action` publier le modèle]: https://github.com/tauri-apps/tauri-action
