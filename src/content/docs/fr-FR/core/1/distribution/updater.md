---
sidebar_position: 5
---

# Mise à jour

## Configuration

Une fois que votre projet Tauri est prêt, vous devez configurer la mise à jour.

Ajouter ceci dans tauri.conf.json

```json
"updater": {
    "active": true,
    "endpoints": [
        "https://releases.myapp.com/{{target}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "YOUR_UPDATER_SIGNATURE_PUBKEY_HERE"
}
```

Les clés requises sont "actifs", "endpoints" et "pubkey"; les autres sont optionnelles.

« actif » doit être un booléen. Par défaut, il est réglé sur false.

"endpoints" doit être un tableau. La chaîne `{{target}}` et `{{current_version}}` sont automatiquement remplacées dans l'URL vous permettant de déterminer [côté serveur](#update-server-json-format) si une mise à jour est disponible. Si plusieurs points de terminaison sont spécifiés, la mise à jour se fera par défaut si un serveur ne répond pas dans le délai prédéfini.

"dialog" si présent doit être un booléen. Par défaut, la valeur est true. Si activé, [événements](#events) sont désactivés car la mise à jour gère tout. Si vous avez besoin des événements personnalisés, vous DEVEZ désactiver la boîte de dialogue intégrée.

"pubkey" doit être une clé publique valide générée avec Tauri CLI. Voir [Mises à jour de signature](#signing-updates).

### Demandes de mise à jour

Tauri est indifférent à la requête que l'application client fournit pour la vérification des mises à jour.

`Accepter : application/json` est ajouté aux en-têtes de requête car Tauri est responsable de l'analyse de la réponse.

Pour les exigences imposées aux réponses et au format corporel d'une mise à jour, réponse voir [Support serveur](#server-support).

Votre requête de mise à jour doit _au moins_ inclure un identifiant de version afin que le serveur puisse déterminer si une mise à jour pour cette version spécifique est nécessaire.

Il peut également inclure d'autres critères d'identification, tels que la version du système d'exploitation, pour permettre au serveur de livrer une mise à jour aussi fine que vous le souhaitez.

La façon dont vous incluez l'identifiant de version, ou d'autres critères, est spécifique au serveur à partir duquel vous demandez des mises à jour. Une approche commune est d'utiliser les paramètres de requête, [La configuration](#configuration) montre un exemple.

### Boîte de dialogue intégrée

Par défaut, la mise à jour utilise une API de dialogue intégrée de Tauri.

![Nouvelle mise à jour](https://i.imgur.com/UMilB5A.png)

Les notes de version de la boîte de dialogue sont représentées par la note `de mise à jour` fournie par le [serveur](#server-support). Si l'utilisateur accepte, la mise à jour est téléchargée et installée. Ensuite, l'utilisateur est invité à redémarrer l'application.

### API Javascript

:::caution
Vous devez _désactiver la boîte de dialogue intégrée_ dans votre [configuration tauri](#configuration); Sinon, l'API javascript ne fonctionnera pas.
:::

```js
import { checkUpdate, installUpdate } depuis '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
try {
  const { shouldUpdate, manifest } = wait checkUpdate()
  if (shouldUpdate) {
    // dialogue d'affichage
    wait installUpdate()
    // install complete, redémarrez l'application
    waiting relaunch()
  }
} catch (error) {
  console. og(erreur)
}
```

### Évènements

:::prudence

Vous devez _désactiver la boîte de dialogue intégrée_ dans votre [configuration tauri](#configuration); Sinon, les événements ne sont pas émis.

:::

Pour savoir quand une mise à jour est prête à être installée, vous pouvez vous abonner à ces événements :

#### Initialiser la mise à jour et vérifier si une nouvelle version est disponible

##### Si une nouvelle version est disponible, l'événement `tauri://update-available` est émis.

Event: `tauri://update`

#### Rouille

```rust
window.emit("tauri://update".to_string(), Aucun);
```

#### Javascript

```js
importer { emit } depuis '@tauri-apps/api/event'
emit('tauri://update')
```

#### Écouter la nouvelle mise à jour disponible

Événement : `tauri://update-available`

Données émises :

```
version annoncée par la date de
du serveur annoncée par le serveur
Body Note annoncée par le serveur
```

#### Rouille

```rust
window.listen("tauri://update-available".to_string(), move |msg| {
  println!("Nouvelle version disponible : {:?}", msg);
})
```

#### Javascript

```js
importer { listen } depuis '@tauri-apps/api/event'
listen('tauri://update-available', function (res) {
  console.log('Nouvelle version disponible: ', res)
})
```

#### Émettre les événements d'installation et de téléchargement

Vous devez émettre cet événement pour initialiser le téléchargement et écouter la [progression de l'installation](#listen-install-progress).

Event: `tauri://update-install`

#### Rouille

```rust
window.emit("tauri://update-install".to_string(), Aucun);
```

#### Javascript

```js
importer { emit } depuis '@tauri-apps/api/event'
emit('tauri://update-installl')
```

#### Écouter la progression de l'installation

Event: `tauri://update-status`

Données émises :

```
statut [ERREUR/PENDING/DONE]
erreur String/null
```

EN ATTENTE est émise lorsque le téléchargement est démarré et FAIT quand l'installation est terminée. Vous pouvez ensuite demander à redémarrer l'application.

ERREUR est émis quand il y a une erreur avec la mise à jour. Nous vous suggérons d'écouter cet événement même si la boîte de dialogue est activée.

#### Rouille

```rust
window.listen("tauri://update-status".to_string(), move |msg| {
  println!("Nouveau statut: {:?}", msg);
})
```

#### Javascript

```js
importer { listen } depuis '@tauri-apps/api/event'
listen('tauri://update-status', function (res) {
  console.log('Nouveau statut: ', res)
})
```

## Support serveur

Votre serveur devrait déterminer si une mise à jour est nécessaire en fonction de la requête de mise à jour [](#update-requests) de votre client.

Si une mise à jour est requise, votre serveur devrait répondre avec un code de statut de [200 OK][] et inclure le [JSON de mise à jour](#update-server-json-format) dans le corps.

Si aucune mise à jour n'est requise, votre serveur doit répondre avec un code de statut de [204 No Content][].

### Mise à jour du format JSON du serveur

Lorsqu'une mise à jour est disponible, Tauri attend le schéma suivant en réponse à la requête de mise à jour fournie :

```json
{
  "url": "https://mycompany.example.com/myapp/releases/myrelease.tar.gz",
  "version": "0.0.1",
  "notes": "Theses are some release notes",
  "pub_date": "2020-09-18T12:29:53+01:00",
  "signature": ""
}
```

Les clés requises sont "url", "version" et "signature"; les autres sont optionnelles.

"pub_date" si présent doit être formaté selon la [RFC 3339][date and time on the internet: timestamps].

"signature" est le contenu du fichier `.sig` qui a été généré par le CLI de Tauri. Reportez-vous à la section [Mises à jour d'inscription](#signing-updates) pour des instructions sur la façon de configurer les clés requises.

### Mettre à jour le format JSON du fichier

La technique de mise à jour alternative utilise un fichier JSON simple, stockant vos métadonnées de mise à jour sur S3, gist ou un autre magasin de fichiers statique. Tauri vérifie le champ de version, et si la version du processus en cours d'exécution est plus petite que le JSON signalé et que la plate-forme est disponible, il déclenche une mise à jour. Le format de ce fichier est détaillé ci-dessous:

```json
{
  "version": "v1.0. ",
  "notes": "Version de test",
  "pub_date": "2020-06-22T19:25:57Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.app.tar. z"
    },
    "darwin-aarch64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1. .0/silicon/app.app.tar. z"
    },
    "linux-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.AppImage.tar. z"
    },
    "windows-x86_64": {
      "signature": "",
      "url": "https://github. om/lemarier/tauri-test/releases/download/v1.0.0/app.x64.msi.zip"
    }
  }
}
```

Notez que chaque clé de plateforme est au format `OS-ARCH` , où `OS` est l'un des `Linux`, `darwin` ou `fenêtres`, et `ARCH` est un des `x86_64`, `aarch64`, `i686` ou `armv7`.

## Bundler (Artéfacts)

Le bundler Tauri génère automatiquement des artefacts de mise à jour si la mise à jour est activée dans `tauri.conf. fils` Vos artefacts de mise à jour sont automatiquement signés si le bundler peut localiser vos clés privées et publiques.

La signature est le contenu du fichier `.sig` généré. La signature peut être téléchargée sur GitHub en toute sécurité ou rendue publique si votre clé privée est sécurisée.

Vous pouvez voir comment il est [fourni avec le CI][artifacts updater workflow] et un échantillon de [tauri.conf.json][].

### macOS

Sur macOS, nous créons un .tar.gz à partir de toute l'application. (.app)

```
cible/release/bundle
<unk> ─ macos
    <unk> ─ app.app
    <unk> ─ app.app.tar.gz (lot de mise à jour)
    <unk> ─ app.app.tar.gz.sig
```

### Fenêtres

Sous Windows, nous créons un .zip à partir du MSI; une fois téléchargés et validés, nous exécutons l'installation MSI.

```
cible/release/bundle
<unk> ─ msi
    <unk> ─ app.x64.msi
    <unk> ─ app.x64.msi.zip (lot de mise à jour)
    <unk> ─ app.x64.msi.zip.sig
```

### Linux

Sous Linux, nous créons un .tar.gz à partir de l'AppImage.

```
cible/release/bundle
<unk> ─ appimage
    <unk> ─ app.AppImage
    <unk> ─ app.AppImage.tar.gz (lot de mise à jour)
    <unk> ─ app.AppImage.tar.gz.sig
```

## Mises à jour de la signature

Nous offrons une signature intégrée pour vous assurer que votre mise à jour est sûre à installer.

Pour signer vos mises à jour, vous avez besoin de deux choses.

La _clé publique_ (pubkey) doit être ajoutée dans votre `tauri.conf.json` pour valider l'archive de mise à jour avant l'installation.

La _clé privée_ (clé privée) est utilisée pour signer votre mise à jour et ne devrait JAMAIS être partagée avec quiconque. En outre, si vous avez perdu cette clé, vous NE serez PAS en mesure de publier une nouvelle mise à jour vers la base d'utilisateurs actuelle. Il est crucial de le sauvegarder dans un endroit sûr, et vous pouvez toujours y accéder.

Pour générer vos clés, vous devez utiliser le CLI Tauri :

```shell
tauri signer generate -w ~/.tauri/myapp.key
```

Vous avez plusieurs options disponibles

```
Générer une paire de clés pour signer des fichiers

USAGE :
    Le signataire tauri génère [OPTIONS]

OPTIONS :
    -f, --force Écraser la clé privée même si elle existe sur le chemin spécifié
    -h, --help Imprimer les informations d'aide
    -p, --password <PASSWORD>        Définir le mot de passe de la clé privée lors de la signature de
    -V, --version Imprimer les informations de version
    -w, --write-keys <WRITE_KEYS>    Écrire une clé privée dans un fichier
```

---

Variables d'environnement utilisées pour signer avec le bundler `Tauri`:<br/> Si elles sont définies, le bundler génère et signe automatiquement les artefacts de mise à jour.<br/> `TAURI_PRIVATE_KEY` Chemin ou Chaîne de votre clé privée<br/> `TAURI_KEY_PASSWORD` Votre mot de passe de clé privée (facultatif)

[200 OK]: http://tools.ietf.org/html/rfc2616#section-10.2.1
[204 No Content]: http://tools.ietf.org/html/rfc2616#section-10.2.5
[date and time on the internet: timestamps]: https://datatracker.ietf.org/doc/html/rfc3339#section-5.8
[artifacts updater workflow]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/.github/workflows/artifacts-updater.yml#L44
[tauri.conf.json]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/examples/updater/src-tauri/tauri.conf.json#L52
