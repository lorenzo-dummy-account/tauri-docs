---
sidebar_position: 3
---

import TauriBuild from './\_tauri-build.md'

# macOS Bundle

Tauri applications for macOS are distributed either with an [Application Bundle][] (`.app` file) or an Apple Disk Image (`.dmg` file). Tauri CLI は、アプリケーションコードを自動的にこれらの形式でバンドルし、アプリケーションを設計して公証するオプションを提供します。 `.app` と `.dmg` バンドルは **macOS** 上でのみ作成できます。クロスコンパイルはまだ動作しません。

:::note

GUI apps on macOS and Linux do not inherit the `$PATH` from your shell dotfiles (`.bashrc`, `.bash_profile`, `.zshrc`, etc). この問題を解決するには、牡牛座の [fix-path-env-rs][] をチェックしてください。

:::

<TauriBuild />

## 最小システムバージョンの設定

おうりアプリがmacOSで動作するために必要なオペレーティングシステムの最小バージョンは `10.13`です。 If you need support for newer macOS APIs like `window.print` that is only supported from macOS version `11.0` onwards, you can change the [`tauri.bundle.macOS.minimumSystemVersion`][]. `Info.plist` [LSMinimumSystemVersion][] プロパティと `MACOSX_DEPLOYMENT_TARGET` 環境変数を設定します。

## バイナリターゲット

Apple Silicon、IntelベースのMacコンピュータ、またはユニバーサルmacOSバイナリを対象としてアプリケーションをコンパイルできます。 デフォルトでは、CLI はマシンのアーキテクチャを対象としたバイナリをビルドします。 If you want to build for a different target you must first install the missing rust target for that target by running `rustup target add aarch64-apple-darwin` or `rustup target add x86_64-apple-darwin`, then you can build your app using the `--target` flag:

- `tauri ビルド --target aarch64-apple-darwin`: Apple シリコンマシンをターゲットにします。
- `tauri build --target x86_64-apple-darwin`: Intelベースのマシンをターゲットとする。
- `tauri build --target universal-apple-darwin`: [汎用的な macOS バイナリ][] が生成され、アップルのシリコンとインテルベースの Mac の両方で動作します。

アップルシリコンマシンはIntelベースのMac用にコンパイルされたアプリケーションを [Rosetta][]と呼ばれる翻訳層を通して実行することができますが、 これはプロセッサ命令の翻訳によるパフォーマンスの低下につながります アプリをダウンロードする際に、ユーザーが正しいターゲットを選択できるようにするのが一般的です。 しかし、 [ユニバーサルバイナリ][universal macos binary]を配布することもできます。 ユニバーサル・バイナリには `aarch64` と `x86_64` の両方の実行ファイルが含まれており、両方のアーキテクチャで最高のエクスペリエンスを提供します。 ただし、これはバンドルのサイズが大幅に増加することに注意してください。

## アプリケーションバンドルのカスタマイズ

Tauri設定ファイルには、アプリケーションバンドルをカスタマイズするための次のオプションが用意されています。

- **バンドル名:** アプリの読める名前。 [`package.productName`][] プロパティによって設定されます。
- **バンドルバージョン:** アプリのバージョン。 [`package.version`][] プロパティによって設定されます。
- **アプリケーションカテゴリ:** アプリを説明するカテゴリ。 [`tauri.bundle.category`][] プロパティによって設定されます。 macOS カテゴリの一覧は [こちら][macos app categories] からご覧いただけます。
- **Copyright:** アプリに関連付けられている著作権文字列。 [`tauri.bundle.copyright`][] プロパティによって設定されます。
- **バンドルアイコン:** アプリのアイコン。 `` tauri.bundle.icon [``][] 配列にリストされている最初の </code> .icns </a> ファイルを使用します。
- **最小システムバージョン:** [`tauri.bundle.macOS.minimumSystemVersion`][] プロパティによって設定されます。
- **DMGライセンスファイル:** `.dmg` ファイルに追加されたライセンス。 [`tauri.bundle.macOS.license`][] プロパティで設定します。
- **[Entitlements.plist ファイル][]:** アプリがアクセスできる API を設定します。 [`tauri.bundle.macOS.enitlesments`][] プロパティによって設定されます。
- **Exception domain:** アプリケーションが `localhost` やリモート `http` ドメインなどにアクセスできる安全でないドメイン。 これは `NSAppTransportSecurity > NSExceptionDomains` 設定 `NSExceptionAllowsInsecureHTTPLoads` と `NSIncludesSubdomains` を true にする便利な設定です。 詳細は [`tauri.bundle.macOS.exceptionDomain`][] を参照してください。

:::info

これらのオプションは、アプリケーションバンドル [Info.plist ファイル][] を生成します。 生成されたファイルは、 `Info.plist` のファイルをTauriフォルダ(デフォルトでは`src-tauri` )に保存して拡張することができます。 CLI は本番環境で `.plist` の両方のファイルをマージし、コア層は開発中にバイナリに埋め込みます。

:::

[Application Bundle]: https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html
[`tauri.bundle.macOS.minimumSystemVersion`]: ../../api/config.md#macconfig.minimumsystemversion
[LSMinimumSystemVersion]: https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion
[汎用的な macOS バイナリ]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[universal macos binary]: https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary
[Rosetta]: https://support.apple.com/en-gb/HT211861
[macos app categories]: https://developer.apple.com/app-store/categories/
[`package.productName`]: ../../api/config.md#packageconfig.productname
[`package.version`]: ../../api/config.md#packageconfig.version
[`tauri.bundle.category`]: ../../api/config.md#bundleconfig.category
[`tauri.bundle.copyright`]: ../../api/config.md#bundleconfig.copyright
[``]: ../../api/config.md#bundleconfig.icon
[`tauri.bundle.macOS.license`]: ../../api/config.md#bundleconfig.icon
[Entitlements.plist ファイル]: https://developer.apple.com/documentation/bundleresources/entitlements
[`tauri.bundle.macOS.enitlesments`]: ../../api/config.md#macconfig.entitlements
[`tauri.bundle.macOS.exceptionDomain`]: ../../api/config.md#macconfig.exceptiondomain
[Info.plist ファイル]: https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html
[fix-path-env-rs]: https://github.com/tauri-apps/fix-path-env-rs
