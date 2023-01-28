---
sidebar_position: 2
---

import Command from '@theme/Command'

# Windows用インストーラー

Windows用の牡牛座アプリケーションは、Microsoft Installers (`.msi` ファイル) として配布されています。 Tauri CLI は、アプリケーションのバイナリと追加のリソースをバンドルします。 `.msi` のインストーラは、クロスコンパイルがまだ動作しないため、 **Windows** でのみ作成できます。 このガイドでは、インストーラの利用可能なカスタマイズオプションについて説明します。

Tauriアプリケーションを単一の実行ファイルにビルドしてバンドルするには、次のコマンドを実行します。

<Command name="build" shell="powershell"/>

Frontendを構築し、Rustバイナリをコンパイルし、すべての外部バイナリとリソースを収集し、最終的にプラットフォーム固有のバンドルとインストーラを作成します。

## 32ビットまたはARM用のビルド

Tauri CLI は、デフォルトでマシンのアーキテクチャを使用して実行可能ファイルをコンパイルします。 あなたが64ビットマシンで開発していると仮定すると、CLIは64ビットアプリケーションを生成します。

If you need to support **32-bit** machines, you can compile your application with a **different** [Rust target][platform support] using the `--target` flag:

```powershell
tauri build --target i686-pc-windows-msvc
```

デフォルトでは、Rust はマシンのターゲット用のツールチェーンのみをインストールします ですから、最初に32ビットのWindowsツールチェーンをインストールする必要があります: `rustup target add i686-pc-windows-msvc`.

**ARM64** 用にビルドする必要がある場合は、まず追加のビルドツールをインストールする必要があります。 これを行うには、 `Visual Studio Installer`を開き、「変更」をクリックし、「個々のコンポーネント」タブで「C++ ARM64 ビルドツール」をインストールします。 At the time of writing, the exact name in VS2022 is `MSVC v143 - VS 2022 C++ ARM64 build tools (Latest)`.  
Now you can add the rust target with `rustup target add aarch64-pc-windows-msvc` and then use the above-mentioned method to compile your app:

```powershell
tauri build --target aarc64-pc-windows-msvc
```

## Windows 7をサポート

デフォルトでは、 Microsoft インストーラは Windows 7 では動作しません。なぜなら、インストールされていない場合は Webview2 ブートストラッパーをダウンロードする必要があるからです(TLS 1 で失敗する可能性があります)。 はオペレーティングシステムで有効になっていません)。 Tauri には Webview2 bootstrapper を埋め込むオプションが含まれています (下記の [Webview2 Bootstrapper](#embedded-bootstrapper) セクションを参照してください)。

さらに、Windows 7 で通知 API を使用するには、 `windows7-compat` Cargo 機能を有効にする必要があります。

```toml title="Cargo.toml"
[dependencies]
tauri = { version = "1", features = ["windows7-compat" ] }
```

## Webview2 インストールオプション

WindowsインストーラはデフォルトでWebview2ブートストラッパーをダウンロードし、ランタイムがインストールされていない場合に実行します。 あるいは、bootstrapperを埋め込むか、オフラインインストーラを埋め込むか、Webview2の固定ランタイムバージョンを使用することもできます。 これらのメソッド間の比較については、次の表を参照してください。

| インストール方法                                           | インターネット接続が必要ですか？ | 追加インストーラサイズ | メモ                                                              |
|:-------------------------------------------------- |:---------------- |:----------- |:--------------------------------------------------------------- |
| [`downloadBootstrapper`](#downloaded-bootstrapper) | はい               | 0MB         | `デフォルト` <br /> インストーラサイズが小さいが、Windows 7デプロイメントでは推奨されない。   |
| [`embedBootstrapper`](#embedded-bootstrapper)      | はい               | ~1.8MB      | Windows 7でのサポートを改善しました。                                         |
| [`オフラインインストーラー`](#offline-installer)               | いいえ              | ~127MB      | Webview2インストーラを埋め込みます。 オフライン環境への推奨                              |
| [`fixedVersion`](#fixed-version)                   | いいえ              | ~180MB      | 固定されたWebview2バージョンを埋め込みます                                       |
| [`スキップ`](#skipping-installation)                   | いいえ              | 0MB         | ⚠️ 推奨されません <br /> Windowsインストーラの一部としてWebview2をインストールしません。 |

:::info

Windows 10(2018年4月リリース以降)およびWindows 11では、Webview2ランタイムがオペレーティングシステムの一部として配布されます。

:::

### ダウンロードされたBootstrapper

これは、Windows インストーラをビルドする際のデフォルト設定です。 ブートストラッパーをダウンロードして実行します。 インターネット接続が必要ですが、インストーラのサイズが小さくなります。 これは、Windows 7に配布する場合は推奨されません。

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
  } }
}
```

### Embedded Bootstrapper

Webview2 Bootstrapperを埋め込むには、 [webviewInstallMode][] を `embedBootstrapper` に設定します。 これにより、インストーラのサイズが約1.8MB増加しますが、Windows 7システムとの互換性が向上します。

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

### オフラインインストーラー

Webview2 Bootstrapperを埋め込むには、 [webviewInstallMode][] を `offlineInstaller` に設定します。 これにより、インストーラのサイズは127MB程度増加しますが、インターネット接続が利用できない場合でもアプリケーションをインストールできます。

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

### 修正バージョン

Webviewの脆弱性パッチはWindowsによって管理されているため、システムが提供するランタイムを使用することはセキュリティに最適です。 各アプリケーションの Webview2 ディストリビューションを制御したい場合(リリースパッチを自分で管理するか、インターネット接続が利用できない環境でアプリケーションを配布するか)は、実行時ファイルをバンドルすることができます。

:::注意
Webview2 Runtimeバージョンを配布すると、Windowsインストーラが180MB程度増加します。
:::

1. [Microsoftのウェブサイト][download-webview2-runtime] からWebview2 固定バージョンランタイムをダウンロードします。 この例では、ダウンロードしたファイル名は `Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab`
2. コアフォルダにファイルを展開します。

```powershell
Expand .\Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64.cab -F:* ./src-tauri
```

3. `tauri.conf.json` で Webview2 ランタイムパスを設定する :

```json title="tauri.config.json"
{
  "tauri": {
    "bundle": {
      "windows": {
        "webviewInstallMode": {
          "type": "fixedRuntime",
          "path": "./Microsoft.WebView2.FixedVersionRuntime.98.0.1108.50.x64/"
        }
      }
    }
  }
}
```

4. `tauriビルド` を実行して、Webview2の固定ランタイムでWindowsインストーラを生成します。

### インストールをスキップ中

[webviewInstallMode][] を `スキップ` に設定することで、インストーラからWebview2 ランタイムのダウンロードチェックを削除できます。 ユーザーがランタイムをインストールしていない場合、アプリケーションは動作しません。

:::warning
ユーザーがランタイムをインストールしておらず、インストールしようとしない場合、アプリケーションは動作しません。
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

## インストーラのカスタマイズ

Windowsインストーラパッケージは、 [WiX Toolset v3][] を使用してビルドされています。 Currently, you can change it by using a custom WiX source code (an XML file with a `.wxs` file extension) or through WiX fragments.

### インストーラコードをカスタム WiX ファイルに置き換えます

牡牛座によって定義されたWindowsインストーラXMLは、シンプルなWebビューベースのアプリケーションの一般的な使用例のために動作するように構成されています (ここで見つけることができます [][default wix template])。 It uses [handlebars][] so the Tauri CLI can brand your installer according to your `tauri.conf.json` definition. 完全に異なるインストーラが必要な場合は、カスタムテンプレートファイルを [`tauri.bundle.windows.wix.template`][] で設定できます。

### WiXフラグメントでインストーラを拡張

[WiX フラグメント][] は、WiX が提供するほぼすべてを設定できるコンテナです。 この例では、2つのレジストリエントリを書き込むフラグメントを定義します:

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

`.wxs` 拡張子を持つフラグメントファイルをプロジェクトのどこかに保存し、 `tauri.conf.json` に参照してください:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "fragmentPaths": ["./path/to/registry.wxs"],
          "componentRefs": ["MyFragmentRegistryEntries"]
        }
      }
    }
  }
}
```

Note that `ComponentGroup`, `Component`, `FeatureGroup`, `Feature` and `Merge` element ids must be referenced on the `wix` object of `tauri.conf.json` on the `componentGroupRefs`, `componentRefs`, `featureGroupRefs`, `featureRefs` and `mergeRefs` respectively to be included in the installer.

## 国際化

Windowsインストーラは、デフォルトで `en-US` 言語を使用してビルドされています。 [`tauri.bundle.windows.wix.language`][] プロパティを使用して、国際化(i18n)を設定できます。 言語文化の欄には、 [マイクロソフトのウェブサイト][localizing the error and actiontext tables]で使用する言語名が記載されています。

### 単一言語のインストーラのコンパイル

特定の言語を対象とした単一のインストーラを作成するには、 `language` の値を文字列に設定します。

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

### リスト内の各言語のインストーラのコンパイル

言語のリストを対象としたインストーラをコンパイルするには、配列を使用します。 言語キーをサフィックスとして、各言語の特定のインストーラが作成されます。

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

### 各言語用のインストーラの設定

言語ごとに設定オブジェクトを定義してローカライズ文字列を構成することができます:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "wix": {
          "language": {
            "en-US": null,
            "pt-BR": {
              "localePath": "./wix/locales/pt-BR.wxl"
            }
          }
        }
      }
    }
  }
}
```

`localePath` プロパティは言語ファイルへのパスを定義し、言語文化を構成する XML を定義します。

```xml
<WixLocalization
  Culture="en-US"
  xmlns="http://schemas.microsoft.com/wix/2006/localization"
>
  <String Id="LaunchApp"> MyApplicationName を起動 </String>
  <String Id="DowngradeErrorMessage">
    新しいバージョンの MyApplicationName がインストールされています。
  </String>
  <String Id="PathEnvVarFeature">
    MyApplicationName実行ファイルのインストール場所を
    PATHシステム環境変数に追加します。 これにより、
    MyApplicationName 実行ファイルを任意の場所から呼び出すことができます。
  </String>
  <String Id="InstallAppFeature">
    MyApplicationName をインストールします。
  </String>
</WixLocalization>
```

:::note
`WixLocalization` 要素の `Culture` フィールドは、設定された言語に一致する必要があります。
:::

現在、Tauriは以下のロケール文字列を参照しています: `LaunchApp`, `DowngradeErrorMessage`, `PathEnvVarFeature` と `InstallAppFeature`. 独自の文字列を定義し、カスタムテンプレートまたはフラグメントに `"!(loc.TheStringId)"` を使用して参照することができます。 詳細については、 [WiX ローカライズドキュメント][] を参照してください。

[platform support]: https://doc.rust-lang.org/nightly/rustc/platform-support.html
[webviewInstallMode]: ../../api/config.md#webviewinstallmode
[download-webview2-runtime]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section
[WiX Toolset v3]: https://wixtoolset.org/documentation/manual/v3/
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[default wix template]: https://github.com/tauri-apps/tauri/blob/dev/tooling/bundler/src/bundle/windows/templates/main.wxs
[handlebars]: https://docs.rs/handlebars/latest/handlebars/
[`tauri.bundle.windows.wix.template`]: ../../api/config.md#wixconfig.template
[WiX フラグメント]: https://wixtoolset.org/documentation/manual/v3/xsd/wix/fragment.html
[`tauri.bundle.windows.wix.language`]: ../../api/config.md#wixconfig.language
[WiX ローカライズドキュメント]: https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/make_installer_localizable.html
[localizing the error and actiontext tables]: https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables
