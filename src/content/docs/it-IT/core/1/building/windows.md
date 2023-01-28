---
sidebar_position: 2
---

importa comando da '@theme/Command'

# Windows Installer

Le applicazioni Tauri per Windows sono distribuite come Microsoft Installers ( file`.msi`. Il Tauri CLI raggruppa le tue applicazioni binarie e risorse aggiuntive. Si prega di notare che gli installatori `.msi` possono **essere creati solo su Windows** poiché la cross-compilation non funziona ancora. Questa guida fornisce informazioni sulle opzioni di personalizzazione disponibili per l'installatore.

Per costruire e raggruppare la tua applicazione Tauri in un singolo eseguibile esegui semplicemente il seguente comando:

<Command name="build" shell="powershell"/>

Costruirà il tuo Frontend, compilerà il binario Rust, raccoglierà tutti i binari e le risorse esterni e infine produrrà pacchetti e installatori specifici per piattaforme pulite.

## Edificio per 32-bit o ARM

Il Tauri CLI compila il tuo eseguibile usando l'architettura della tua macchina per impostazione predefinita. Supponendo che si stia sviluppando su una macchina a 64 bit, il CLI produrrà applicazioni a 64 bit.

Se hai bisogno di supportare **macchine a 32 bit** , puoi compilare la tua applicazione con un **diverso** [Rust target][platform support] utilizzando il `--target` flag:

```powershell
tauri build --target i686-pc-windows-msvc
```

Per impostazione predefinita, Rust installa solo le toolchain per il target della macchina, quindi è necessario installare prima la toolchain di Windows a 32 bit: `rustup target add i686-pc-windows-msvc`.

Se hai bisogno di costruire per **ARM64** devi prima installare strumenti di build aggiuntivi. Per fare questo, apri `Visual Studio Installer`, clicca su "Modifica" e nella scheda "Individual Components" installa gli "C++ ARM64 build tools". Al momento della scrittura, il nome esatto in VS2022 è `MSVC v143 - VS 2022 C++ ARM64 build tools (Latest)`.  
Ora puoi aggiungere il target di ruggine con `il target di ruggine aggiungi aarch64-pc-windows-msvc` e quindi usare il metodo sopra menzionato per compilare la tua app:

```powershell
tauri build --target aarc64-pc-windows-msvc
```

## Supporto Per Windows 7

Per impostazione predefinita, Microsoft Installer non funziona su Windows 7 perché ha bisogno di scaricare il bootstrapper Webview2 se non installato (che potrebbe fallire se TLS 1. non è abilitato nel sistema operativo). Tauri include un'opzione per incorporare il bootstrapper Webview2 (vedere la sezione [Incorporare il Webview2 Bootstrapper](#embedded-bootstrapper) sotto).

Inoltre, per utilizzare l'API di notifica in Windows 7, è necessario abilitare la funzione `windows7-compat` Cargo funzione:

```toml title="Cargo.toml"
[dependencies]
tauri = { version = "1", features = [ "windows7-compat" ] }
```

## Opzioni Di Installazione Webview2

Il Windows Installer per impostazione predefinita scarica il Webview2 bootstrapper e lo esegue se il runtime non è installato. In alternativa, è possibile incorporare il bootstrapper, incorporare l'installatore offline, o utilizzare una versione di runtime Webview2 fissa. Cfr. la tabella seguente per un confronto tra questi metodi:

| Metodo Di Installazione                            | Richiede Connessione Internet? | Dimensione Aggiuntiva Dell'Installatore | Note                                                                                                                                       |
|:-------------------------------------------------- |:------------------------------ |:--------------------------------------- |:------------------------------------------------------------------------------------------------------------------------------------------ |
| [`downloadBootstrapper`](#downloaded-bootstrapper) | Sì                             | 0MB                                     | `Predefinito` <br /> Risultati in un programma di installazione più piccolo, ma non è raccomandato per l'installazione di Windows 7. |
| [`embedBootstrapper`](#embedded-bootstrapper)      | Sì                             | ~1,8MB                                  | Migliore supporto su Windows 7.                                                                                                            |
| [`offlineInstaller`](#offline-installer)           | No                             | ~127MB                                  | Incorpora il programma di installazione Webview2. Consigliato per ambienti offline                                                         |
| [`fixedVersion`](#fixed-version)                   | No                             | ~180MB                                  | Incorpora una versione fissa di Webview2                                                                                                   |
| [`salta`](#skipping-installation)                  | No                             | 0MB                                     | ⚠️ Non raccomandato <br /> Non installa Webview2 come parte dell'Installatore di Windows.                                            |

:::info

Su Windows 10 (aprile 2018 o successivo) e Windows 11, il runtime Webview2 è distribuito come parte del sistema operativo.

:::

### Bootstrapper Scaricato

Questa è l'impostazione predefinita per costruire l'Installatore di Windows. Scarica il bootstrapper ed eseguirlo. Richiede la connessione internet ma si traduce in una dimensione di installazione più piccola. Questo non è raccomandato se si sta per essere distribuzione a Windows 7.

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
  }
}
```

### Embedded Bootstrapper

Per incorporare il Webview2 Bootstrapper, impostare la [webviewInstallMode][] su `embedBootstrapper`. Ciò aumenta la dimensione del programma di installazione di circa 1,8MB, ma aumenta la compatibilità con i sistemi Windows 7.

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
  }
}
```

### Installatore Offline

Per incorporare il Webview2 Bootstrapper, impostare la [webviewInstallMode][] a `offlineInstaller`. Questo aumenta la dimensione del programma di installazione di circa 127MB, ma consente di installare la tua applicazione anche se non è disponibile una connessione internet.

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
}
```

### Versione Fissa

Utilizzando il runtime fornito dal sistema è grande per la sicurezza in quanto le patch di vulnerabilità della vista web sono gestite da Windows. Se si desidera controllare la distribuzione Webview2 su ciascuna delle applicazioni (sia per gestire le patch di rilascio da soli o distribuire applicazioni in ambienti in cui una connessione internet potrebbe non essere disponibile) Tauri può raggruppare i file runtime per voi.

:::cautela
Distribuire una versione fissa di Webview2 Runtime aumenta il Windows Installer di circa 180MB.
:::

1. Scarica il Webview2 versione fissa runtime da [Microsoft sito][download-webview2-runtime]. In questo esempio, il nome del file scaricato è `Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab`
2. Estrae il file nella cartella principale:

```powershell
Espandi .\Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab -F:* ./src-tauri
```

3. Configurare il percorso di runtime Webview2 in `tauri.conf.json`:

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "fixedRuntime",
          "percorso": ". Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50. 64/"
        }
      }
    }
  }
}
```

4. Esegui `tauri build` per produrre Windows Installer con la runtime fissa Webview2.

### Installazione Salto

Puoi rimuovere il controllo di download Webview2 Runtime dall'installer impostando [webviewInstallMode][] a `skip`. La tua applicazione NON funzionerà se l'utente non ha installato il runtime.

:::warning
La tua applicazione NON funzionerà se l'utente non ha il runtime installato e non tenterà di installarlo.
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
}
```

## Personalizzazione dell'installatore

Il pacchetto Windows Installer è costruito utilizzando il [WiX Toolset v3][]. Attualmente, è possibile modificarlo utilizzando un codice sorgente WiX personalizzato (un file XML con un `. xs` estensione del file) o attraverso frammenti WiX.

### Sostituire il codice di installazione con un file WiX personalizzato

Il Windows Installer XML definito da Tauri è configurato per funzionare per il caso di uso comune di semplici applicazioni webview-based (puoi trovarlo [qui][default wix template]). Utilizza [manubrio][] in modo che il Tauri CLI possa marcare il tuo installatore secondo la tua definizione `tauri.conf.json`. Se hai bisogno di un programma di installazione completamente diverso, un file di template personalizzato può essere configurato su [`tauri.bundle.windows.wix.template`][].

### Estendere il programma di installazione con frammenti WiX

Un frammento [WiX][] è un contenitore dove puoi configurare quasi tutto quello che WiX. In questo esempio, definiremo un frammento che scrive due voci del registro:

```xml
<?xml version="1. " encoding="utf-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Fragment>
    <! - queste voci del Registro di sistema dovrebbero essere installate
         sulla macchina dell'utente di destinazione -->
    <DirectoryRef Id="TARGETDIR">
      <! - raggruppa le voci del Registro di sistema da installare -->
      <! - Nota l'esclusivo `Id` che forniamo qui -->
      <Component Id="MyFragmentRegistryEntries" Guid="*">
        <! - la chiave del registro sarà sotto
             HKEY_CURRENT_USER\Software\MyCompany\MyApplicationName -->
        <! - Tauri utilizza la seconda parte dell'identificatore del pacchetto
             come nome `MyCompany`
             (e. . `tauri-apps` in `com.tauri-apps. est`) -->
        <RegistryKey
          Root="HKCU"
          Key="Software\MyCompany\MyApplicationName"
          Action="createAndRemoveOnUninstall"
        >
          <! - valori che persistono nel registro di sistema -->
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

Salva il file di frammento con l'estensione `.wxs` da qualche parte nel tuo progetto e fai riferimento a `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "fragmentPaths": [". percorso/per/registro. xs"],
          "componentRefs": ["MyFragmentRegistryEntries"]
        }
      }
    }
  }
}
```

Nota che `ComponentGroup`, `Component`, `FeatureGroup`, `Caratteristica` e `Unisci` id elemento deve essere referenziato sull'oggetto `wix` di `tauri. onf.json` su `componentGroupRefs`, `componentRefs`, `featureGroupRefs`, `funzionalitàRefs` e `mergeRefs` rispettivamente da includere nell'installatore.

## Internazionalizzazione

Il Windows Installer è costruito utilizzando la lingua `en-US` per impostazione predefinita. L'internazionalizzazione (i18n) può essere configurata usando la proprietà [`tauri.bundle.windows.wix.language`][] , definendo le lingue contro cui Tauri dovrebbe costruire un installer. Puoi trovare i nomi delle lingue da usare nella colonna Language-Culture sul sito web di [Microsoft][localizing the error and actiontext tables].

### Compilare un installatore per una lingua singola

Per creare un singolo programma di installazione mirato a una lingua specifica, imposta il valore `language` a una stringa:

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
}
```

### Compilare un installatore per ogni lingua in un elenco

Per compilare un programma di installazione che punta un elenco di lingue, usa un array. Verrà creato un programma di installazione specifico per ogni lingua, con la chiave della lingua come suffisso:

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
}
```

### Configurare l'installatore per ogni lingua

Un oggetto di configurazione può essere definito per ogni lingua per configurare le stringhe di localizzazione:

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

La proprietà `localePath` definisce il percorso di un file di lingua, un XML che configura la cultura della lingua:

```xml
<WixLocalization
  Culture="en-US"
  xmlns="http://schemas.microsoft.com/wix/2006/localization"
>
  <String Id="LaunchApp"> Lancia MyApplicationName </String>
  <String Id="DowngradeErrorMessage">
    Una nuova versione di MyApplicationName è già installata.
  </String>
  <String Id="PathEnvVarFeature">
    Aggiungi la posizione di installazione dell'eseguibile MyApplicationName per
    la variabile di ambiente del sistema PATH. Questo consente di chiamare l'eseguibile
    MyApplicationName da qualsiasi posizione.
  </String>
  <String Id="InstallAppFeature">
    Installa MyApplicationName.
  </String>
</WixLocalization>
```

:::note
Il campo `WixLocalization` dell'elemento `Cultura` deve corrispondere alla lingua configurata.
:::

Attualmente, Tauri fa riferimento alle seguenti stringhe locali: `LaunchApp`, `DowngradeErrorMessage`, `PathEnvVarFeature` e `InstallAppFeature`. Puoi definire le tue stringhe e riferirle sul tuo modello o frammenti personalizzati con `"!(loc.TheStringId)"`. Vedi la documentazione [di localizzazione WiX][] per maggiori informazioni.

[platform support]: https://doc.rust-lang.org/nightly/rustc/platform-support.html
[webviewInstallMode]: ../../api/config.md#webviewinstallmode
[download-webview2-runtime]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section
[WiX Toolset v3]: https://wixtoolset.org/documentation/manual/v3/
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[manubrio]: https://docs.rs/handlebars/latest/handlebars/
[`tauri.bundle.windows.wix.template`]: ../../api/config.md#wixconfig.template
[WiX]: https://wixtoolset.org/documentation/manual/v3/xsd/wix/fragment.html
[`tauri.bundle.windows.wix.language`]: ../../api/config.md#wixconfig.language
[di localizzazione WiX]: https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/make_installer_localizable.html
[localizing the error and actiontext tables]: https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables
