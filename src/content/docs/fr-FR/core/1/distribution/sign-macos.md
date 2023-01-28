---
sidebar_label: Signature du code macOS
sidebar_position: 4
---

# Applications macOS de signature de code

Ce guide fournit des informations sur la signature de code et la notariation des applications macOS.

:::note

Si vous n'utilisez pas les actions GitHub pour effectuer des compilations de DMG OSX, vous devrez vous assurer que la variable d'environnement <i>CI=true</i> existe. Pour plus d'informations, reportez-vous à [tauri-apps/tauri#592][].

:::

## Exigences

- macOS 10.13.6 ou ultérieur
- Xcode 10 ou ultérieur
- Un compte Apple Developer s'est inscrit dans le [Programme de Développeurs Apple][]

Pour plus de détails, veuillez lire l'article du développeur sur [notarier le logiciel macOS avant la distribution][].

## tl;dr

Le processus de signature et de notariation du code Tauri est configuré à travers les variables d'environnement suivantes :

- `APPLE_SIGNING_IDENTITY`: le nom de l'entrée du trousseau de clés qui contient le certificat de signature.
- `APPLE_CERTIFICATE`: chaîne base64 du `.p12` certificat, exporté du trousseau. Utile si vous n'avez pas le certificat sur le trousseau (par exemple, les machines CI).
- `APPLE_CERTIFICATE_PASSWORD`: le mot de passe pour le `.p12` certificat.
- `APPLE_ID` et `APPLE_PASSWORD`: votre compte Apple e-mail et un [mot de passe spécifique à l'application][]. Uniquement requis pour notarier l'application.
- `APPLE_API_ISSUER` et `APPLE_API_KEY`: authentification avec une clé API App Store Connect au lieu de l'identifiant Apple. Nécessaire uniquement si vous notez l'application.
- `APPLE_PROVIDER_SHORT_NAME`: Team provider nom court. Si votre identifiant Apple est connecté à plusieurs équipes, vous devez spécifier le nom abrégé du fournisseur de l'équipe que vous souhaitez utiliser pour notarier votre application. Vous pouvez lister les fournisseurs de votre compte en utilisant `xcrun altool --list-providers -u "AC_USERNAME" -p "AC_PASSWORD"` comme expliqué dans la notariation [](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow).

## Signature des applications Tauri

La première étape pour signer une application macOS consiste à obtenir un certificat de signature du programme Apple Developer.

### Création d'un certificat de signature

Pour créer un nouveau certificat de signature, vous devez générer un fichier de demande de signature de certificat (CSR) à partir de votre ordinateur Mac. [Créer une demande de signature de certificat][] décrit la création d'un CSR.

Sur votre compte Apple Developer, accédez aux [certificats, IDs & Page Profils][] et cliquez sur le bouton `Créer un certificat` pour ouvrir l'interface pour créer un nouveau certificat. Choisissez le type de certificat approprié (`Distribution Apple` pour envoyer des applications dans l'App Store, et `Application ID développeur` pour envoyer des applications en dehors de l'App Store). Téléchargez votre CSR, et le certificat sera créé.

:::note

Seul le détenteur du compte Apple Developer `de` peut créer des certificats _Developer ID Application_. Mais il peut être associé à un ID Apple différent en créant une CSR avec une adresse e-mail utilisateur différente.

:::

### Téléchargement d'un certificat

Sur [Certificats, IDs & Profils page][], cliquez sur le certificat que vous souhaitez utiliser et cliquez sur le bouton `Télécharger`. Il enregistre un fichier `.cer` qui installe le certificat sur le trousseau une fois ouvert. Le nom de l'entrée du trousseau représente l'identité `de signature`, qui peut également être trouvé en exécutant `security find-identity -v -p codesigning`.

:::note

Un certificat de signature n'est valide que s'il est associé à votre identifiant Apple. Un certificat invalide ne sera pas listé dans l'onglet <i>Trousseau d'accès > Mes certificats</i> ou dans l'onglet <i>security find-identity -v -p codesigning</i>.

:::

### Signature de l'application Tauri

La configuration de signature est fournie au bundler Tauri via des variables d'environnement. Vous devez configurer le certificat à utiliser et une configuration d'authentification optionnelle pour notarier l'application.

#### Variables d'environnement du certificat

- `APPLE_SIGNING_IDENTITY`: c'est la `identité de signature` que nous avons surlignée ci-dessus. Il doit être défini pour signer les applications localement et sur les machines CI.

De plus, pour simplifier le processus de signature de code sur CI, Tauri peut installer le certificat sur le trousseau si vous définissez les variables d'environnement `APPLE_CERTIFICATE` et `APPLE_CERTIFICATE_PASSWORD`.

1. Ouvrez l'application `Keychain Access` et trouvez l'entrée du trousseau de votre certificat.
2. Développez l'entrée, double-cliquez sur l'élément clé et sélectionnez `Exporter "$KEYNAME"`.
3. Sélectionnez le chemin d'accès pour enregistrer le fichier `.p12` et définir le mot de passe du certificat exporté.
4. Convertissez le fichier `.p12` en base64 exécutant le script suivant sur le terminal : `openssl base64 -in /path/to/certificate.p12 -out certificate-base64.txt`.
5. Définit le contenu du fichier `certificate-base64.txt` à la variable d'environnement `APPLE_CERTIFICATE`.
6. Définit le mot de passe du certificat à la variable d'environnement `APPLE_CERTIFICATE_PASSWORD`.

#### Variables d'environnement d'authentification

Ces variables ne sont requises que pour notarier la demande.

:::note

La notariation est requise lorsque vous utilisez un certificat <i>ID développeur</i>.

:::

- `APPLE_ID` et `APPLE_PASSWORD`: s'authentifier avec votre identifiant Apple, définissez le `APPLE_ID` sur votre e-mail de compte Apple (exemple : `export APPLE_ID=tauri@icloud. om`) et `APPLE_PASSWORD` à un [mot de passe spécifique à l'application][] pour le compte Apple.
- `APPLE_API_ISSUER` et `APPLE_API_KEY`: alternativement, vous pouvez vous authentifier en utilisant une clé API App Store Connecter. Ouvrez la [page Utilisateurs et Accès][]de l'App Store Connect, sélectionnez l'onglet `Touches` , cliquez sur le bouton `Ajouter` et sélectionnez un nom et l'accès `Développeur`. Le `APPLE_API_ISSUER` (`Identifiant d'émetteur`) est présenté au-dessus de la table des clés, et le `APPLE_API_KEY` est la valeur de la colonne `Key ID` de cette table. Vous devez également télécharger la clé privée, qui ne peut être fait qu'une seule fois et n'est visible qu'après le rechargement de la page (le bouton est affiché sur la ligne du tableau pour la clé nouvellement créée). Le fichier de clé privée doit être sauvegardé sur `./private_keys`, `~/private_keys`, `~/. rivate_keys` ou `~/.appstoreconnect/private_keys`, comme indiqué sur la commande `xcrun altool --help`.

### Construction de l'application

Le bundler Tauri signe et notarie automatiquement votre application avec toutes ces variables d'environnement définies lors de l'exécution de la commande `tauri build`.

### Exemple

L'exemple suivant utilise GitHub Actions pour signer une application en utilisant l'action [Tauri][].

Nous définissons d'abord les variables d'environnement que nous avons listées ci-dessus en tant que Secrets sur GitHub.

:::note

Vous pouvez consulter <a href="https://docs.github.com/en/actions/reference/encrypted-secrets">ce guide</a> pour en savoir plus sur les secrets de GitHub.

:::

Une fois que nous avons créé les secrets GitHub, nous créons un workflow de publication GitHub dans `.github/workflows/main.yml`:

```yml
name: 'publish'
on:
  push:
    branches:
      - release

jobs:
  publish-tauri:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v2
        with:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install app dependencies and build it
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ENABLE_CODE_SIGNING: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        with:
          tagName: app-v__VERSION__ # the action automatically replaces \_\_VERSION\_\_ with the app version
          releaseName: 'App v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          prerelease: false
```

Le workflow tire les secrets de GitHub et les définit comme des variables d'environnement avant de construire l'application en utilisant l'action Tauri. La sortie est une version GitHub avec l'application macOS signée et notariée.

[tauri-apps/tauri#592]: https://github.com/tauri-apps/tauri/issues/592
[Programme de Développeurs Apple]: https://developer.apple.com/programs/
[notarier le logiciel macOS avant la distribution]: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
[mot de passe spécifique à l'application]: https://support.apple.com/en-ca/HT204397
[Créer une demande de signature de certificat]: https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request
[certificats, IDs & Page Profils]: https://developer.apple.com/account/resources/certificates/list
[Certificats, IDs & Profils page]: https://developer.apple.com/account/resources/certificates/list
[page Utilisateurs et Accès]: https://appstoreconnect.apple.com/access/users
[Tauri]: https://github.com/tauri-apps/tauri-action
