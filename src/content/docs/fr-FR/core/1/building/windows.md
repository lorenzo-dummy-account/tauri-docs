---
sidebar_position: 2
---

Importer la commande depuis '@theme/Command'

# Installation de Windows

Les applications Tauri pour Windows sont distribuées en tant que Microsoft Installers ( fichiers`.msi`). Le CLI Tauri regroupe le binaire de votre application et des ressources supplémentaires. Veuillez noter que les installateurs de `.msi` ne peuvent **être créés que sous Windows** car la compilation croisée ne fonctionne pas encore. Ce guide fournit des informations sur les options de personnalisation disponibles pour l'installateur.

Pour compiler et regrouper votre application Tauri en un seul exécutable, exécutez simplement la commande suivante :

<Command name="build" shell="powershell"/>

Il construira votre Frontend, compilera le binaire Rust et récupérera tous les binaires et ressources externes et produira enfin des paquets et des installateurs propres à la plate-forme.

## Construction pour 32 bits ou ARM

L'CLI Tauri compile votre exécutable en utilisant l'architecture de votre machine par défaut. En supposant que vous développez sur une machine 64 bits, le CLI produira des applications 64 bits.

Si vous avez besoin de prendre en charge les machines **32 bits** , vous pouvez compiler votre application avec une cible **différente** [Rust][platform support] en utilisant l'option `--target`:

```powershell
tauri build --target i686-pc-windows-msvc
```

Par défaut, Rust n'installe que des chaînes de compilation pour la cible de votre machine, donc vous devez d'abord installer la chaîne de compilation Windows 32 bits : `rustup target add i686-pc-windows-msvc`.

Si vous avez besoin de compiler pour **ARM64** , vous devez d'abord installer des outils de construction supplémentaires. Pour ce faire, ouvrez `Visual Studio Installer`, cliquez sur "Modifier" et dans l'onglet "Composants individuels" installez les outils de compilation "C++ ARM64". Au moment de l'écrire, le nom exact dans VS2022 est `MSVC v143 - VS 2022 C++ ARM64 outils de construction ARM64 (Latest)`.  
Maintenant vous pouvez ajouter la cible de rouille avec `la cible de rouille ajouter aarch64-pc-windows-msvc` et ensuite utiliser la méthode susmentionnée pour compiler votre application :

```powershell
tauri build --target aarc64-pc-windows-msvc
```

## Prise en charge Windows 7

Par défaut, l'installateur Microsoft ne fonctionne pas sous Windows 7 car il a besoin de télécharger le bootstrapper Webview2 si non installé (ce qui pourrait échouer si TLS 1. n'est pas activé dans le système d'exploitation). Tauri inclut une option pour intégrer le bootstrapper Webview2 (voir la section [Embedding the Webview2 Bootstrapper](#embedded-bootstrapper) ci-dessous).

De plus, pour utiliser l'API Notification dans Windows 7, vous devez activer la fonctionnalité `windows7-compat` Cargo :

```toml title="Cargo.toml"
[dependencies]
tauri = { version = "1", caractéristiques = [ "windows7-compat" ] }
```

## Options d'installation de Webview2

L'installateur de Windows télécharge par défaut le bootstrapper Webview2 et l'exécute si le runtime n'est pas installé. Alternativement, vous pouvez intégrer le bootstrapper, intégrer l'installateur hors ligne, ou utiliser une version d'exécution Webview2 fixe. Voir le tableau suivant pour une comparaison entre ces méthodes :

| Méthode d'installation                             | Nécessite une connexion Internet ? | Taille supplémentaire de l'installateur | Notes                                                                                                                                          |
|:-------------------------------------------------- |:---------------------------------- |:--------------------------------------- |:---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`downloadBootstrapper`](#downloaded-bootstrapper) | Oui                                | 0 Mo                                    | `Par défaut` <br /> Résultats dans une taille de l'installateur plus petite, mais n'est pas recommandé pour le déploiement de Windows 7. |
| [`embedBootstrapper`](#embedded-bootstrapper)      | Oui                                | ~1,8 Mo                                 | Meilleure prise en charge sur Windows 7.                                                                                                       |
| [`installateur hors-ligne`](#offline-installer)    | Non                                | ~127 Mo                                 | Intégrer l'installateur Webview2. Recommandé pour les environnements hors ligne                                                                |
| [`Version fixe`](#fixed-version)                   | Non                                | ~180Mo                                  | Intègre une version fixe de Webview2                                                                                                           |
| [`sauter`](#skipping-installation)                 | Non                                | 0 Mo                                    | ⚠️ Non recommandé <br /> N'installe pas Webview2 dans le cadre de l'installateur Windows.                                                |

:::info

Sous Windows 10 (avril 2018 ou plus récent) et Windows 11, l'exécutable Webview2 est distribué dans le cadre du système d'exploitation.

:::

### Bootstrapper téléchargé

C'est le paramètre par défaut pour compiler l'installateur Windows. Il télécharge le bootstrapper et l'exécute. Nécessite une connexion Internet, mais la taille de l'installateur est plus petite. Ce n'est pas recommandé si vous allez distribuer à Windows 7.

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "downloadBootstrapper"
        }
      }
    }

 } } }
```

### Embedded Bootstrapper

Pour intégrer le Bootstrapper Webview2, définissez le [webviewInstallMode][] à `embedBootstrapper`. Cela augmente la taille de l'installateur d'environ 1,8 Mo, mais augmente la compatibilité avec les systèmes Windows 7.

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "embedBootstrapper"
        }
      }
    }

 } } } } 
 }
```

### Installateur hors ligne

Pour intégrer le Bootstrapper Webview2, définissez le [webviewInstallMode][] à `hors-lineInstaller`. Cela augmente la taille de l'installateur d'environ 127 Mo, mais permet d'installer votre application même si une connexion Internet n'est pas disponible.

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "offlineInstaller"
        }
      }
    }
  }
 } }
```

### Version fixe

L'utilisation du runtime fourni par le système est excellente pour la sécurité car les correctifs de vulnérabilité sur le Web sont gérés par Windows. Si vous voulez contrôler la distribution Webview2 sur chacune de vos applications (soit pour gérer les correctifs de mise à jour soit pour distribuer des applications sur des environnements où une connexion Internet pourrait ne pas être disponible), Tauri peut regrouper les fichiers d'exécution pour vous.

:::prudence
Distribuer une version d'exécution fixe Webview2 augmente l'installateur Windows d'environ 180 Mo.
:::

1. Téléchargez le runtime de la version corrigée de Webview2 à partir du site web [Microsoft][download-webview2-runtime]. Dans cet exemple, le nom du fichier téléchargé est `Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab`
2. Extraire le fichier dans le dossier de base :

```powershell
Développer .\Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab -F:* ./src-tauri
```

3. Configurer le chemin du runtime Webview2 dans `tauri.conf.json`:

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "fixedRuntime",
          "chemin": ". Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50. 64/"
        }
      }
    }
  }
}
```

4. Exécutez `tauri build` pour produire l'installateur Windows avec le runtime fixe Webview2.

### Ignorer l'installation

Vous pouvez supprimer la vérification de téléchargement Webview2 Runtime de l'installateur en définissant [webviewInstallMode][] à `sauter`. Votre application ne fonctionnera pas si l'utilisateur n'a pas le runtime installé.

:::warning
Votre application NE FONT PAS fonctionner si l'utilisateur n'a pas le runtime installé et ne tente pas de l'installer.
:::

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "skip"
        }
      }
    }
  }
 } }
```

## Personnalisation de l'installateur

Le package Windows Installer est construit à l'aide du [WiX Toolset v3][]. Actuellement, vous pouvez le modifier en utilisant un code source WiX personnalisé (un fichier XML avec un `. xs` extension de fichier) ou à travers des fragments WiX.

### Remplacer le code d'installation par un fichier WiX personnalisé

Le XML Windows Installer défini par Tauri est configuré pour fonctionner pour la plupart des cas d'utilisation d'applications Web simples (vous pouvez le trouver [ici][default wix template]). Il utilise [guidons][] pour que le CLI Tauri puisse marquer votre installateur selon votre définition de `tauri.conf.json`. Si vous avez besoin d'un installateur complètement différent, un fichier de template personnalisé peut être configuré sur [`tauri.bundle.windows.wix.template`][].

### Extension de l'installateur avec des fragments WiX

Un [fragment de WiX][] est un conteneur où vous pouvez configurer presque tout ce qui est offert par WiX. Dans cet exemple, nous allons définir un fragment qui écrit deux entrées de registre :

```xml
<?xml version="1.0" encoding="utf-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Fragment>
    <!-- these registry entries should be installed
         to the target user's machine -->
    <DirectoryRef Id="TARGETDIR">
      <!-- groups together the registry entries to be installed -->
      <!-- Note the unique `Id` we provide here -->
      <Component Id="MyFragmentRegistryEntries" Guid="*">
        <!-- the registry key will be under
             HKEY_CURRENT_USER\Software\MyCompany\MyApplicationName -->
        <!-- Tauri uses the second portion of the
             bundle identifier as the `MyCompany` name
             (e.g. `tauri-apps` in `com.tauri-apps.test`)  -->
        <RegistryKey
          Root="HKCU"
          Key="Software\MyCompany\MyApplicationName"
          Action="createAndRemoveOnUninstall"
        >
          <!-- values to persist on the registry -->
          <RegistryValue
            Type="integer"
            Name="SomeIntegerValue"
            Value="1"
            KeyPath="yes"
          />
          <RegistryValue Type="string" Value="Default Value" />
        </RegistryKey>
      </Component>
    </DirectoryRef>
  </Fragment>
</Wix>
```

<!-- Would be good to include here WHERE we recommend to save it -->

Enregistrez le fichier de fragment avec l'extension `.wxs` quelque part dans votre projet et référencez-le sur `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "fragmentPaths": [". chemin/vers/registre. xs"],
          "componentRefs": ["MyFragmentRegistryEntries"]
        }
      }
    }
  }
}
```

Notez que `ComponentGroup`, `Component`, `FeatureGroup`, `Les identifiants d'élément` et `Fusion` doivent être référencés sur l'objet `wix` de `tauri. onf.json` sur le `componentGroupRefs`, `componentRefs`, `featureGroupRefs`, `featureRefs` et `fugeRefs` respectivement à inclure dans l'installateur.

## Internationalisation

L'installateur Windows est construit en utilisant la langue `en-US` par défaut. L'internationalisation (i18n) peut être configurée en utilisant la propriété [`tauri.bundle.windows.wix.language`][] définissant les langues contre lesquelles Tauri devrait construire un installateur. Vous pouvez trouver les noms de langue à utiliser dans la colonne Langue Culture sur le site Web de [Microsoft][localizing the error and actiontext tables].

### Compiler un installateur pour une seule langue

Pour créer un seul installateur ciblant une langue spécifique, définissez la valeur `langue` sur une chaîne de caractères :

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": "fr-FR"
        }
      }
    }
  }
 } } }
```

### Compiler un installateur pour chaque langue dans une liste

Pour compiler un installateur ciblant une liste de langues, utilisez un tableau. Un installateur spécifique pour chaque langue sera créé, avec la clé de langue comme suffixe :

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": ["en-US", "pt-BR", "fr-FR"]
        }
      }
    }
  }
 } } }
```

### Configuration de l'installateur pour chaque langue

Un objet de configuration peut être défini pour chaque langue pour configurer les chaînes de localisation :

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": {
            "en-US": null,
            "pt-BR": {
              "localePath": ". wix/locales/pt-BR. xl"
            }
          }
        }
      }
    }
  }
}
```

La propriété `localePath` définit le chemin vers un fichier de langue, un XML configurant la culture de langue :

```xml
<WixLocalization
  Culture="en-US"
  xmlns="http://schemas.microsoft.com/wix/2006/localization"
>
  <String Id="LaunchApp"> Lancez MyApplicationName </String>
  <String Id="DowngradeErrorMessage">
    Une nouvelle version de MyApplicationName est déjà installée.
  </String>
  <String Id="PathEnvVarFeature">
    Ajoute l'emplacement d'installation de l'exécutable MyApplicationName à
    la variable d'environnement PATH. Cela permet à l'exécutable
    MyApplicationName d'être appelé depuis n'importe quel emplacement.
  </String>
  <String Id="InstallAppFeature">
    Installe MyApplicationName.
  </String>
</WixLocalization>
```

:::note
Le champ `WixLocalization` de l'élément `Culture` doit correspondre à la langue configurée.
:::

Actuellement, Tauri fait référence aux chaînes locales suivantes : `LaunchApp`, `DowngradeErrorMessage`, `PathEnvVarFeature` et `InstallAppFeature`. Vous pouvez définir vos propres chaînes et les référencer sur votre modèle ou fragments personnalisés avec `"!(loc.TheStringId)"`. Consultez la [documentation de localisation WiX][] pour plus d'informations.

[platform support]: https://doc.rust-lang.org/nightly/rustc/platform-support.html
[webviewInstallMode]: ../../api/config.md#webviewinstallmode
[download-webview2-runtime]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section
[WiX Toolset v3]: https://wixtoolset.org/documentation/manual/v3/
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[guidons]: https://docs.rs/handlebars/latest/handlebars/
[`tauri.bundle.windows.wix.template`]: ../../api/config.md#wixconfig.template
[fragment de WiX]: https://wixtoolset.org/documentation/manual/v3/xsd/wix/fragment.html
[`tauri.bundle.windows.wix.language`]: ../../api/config.md#wixconfig.language
[documentation de localisation WiX]: https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/make_installer_localizable.html
[localizing the error and actiontext tables]: https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables
