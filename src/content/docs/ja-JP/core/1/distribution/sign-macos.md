---
sidebar_label: macOS コード署名
sidebar_position: 4
---

# コード署名macOSアプリケーション

このガイドでは、macOSアプリケーションのコード署名と公証についての情報を提供します。

:::note

OS X DMGのビルドを実行するためにGitHub Actionsを利用していない場合は、環境変数 <i>CI=true</i> が存在することを確認する必要があります。 詳細については、 [tauri-apps/tauri#592][] を参照してください。

:::

## 要件

- macOS 10.13.6 以降
- Xcode 10 以降
- [Apple Developer Program][] に登録された Apple Developer アカウント

詳細については、 [macOSソフトウェアを公証する][] の開発者の記事を読んでください。

## tl;dr

牡牛座のコード署名と公証のプロセスは、以下の環境変数によって構成されます。

- `APPLE_SIGNING_IDENTITY`: 署名証明書を含むキーチェーンエントリの名前。
- `APPLE_CERTIFICATE`: キーチェーンからエクスポートされた `.p12` 証明書の base64 文字列。 キーチェーン上に証明書を持っていない場合に便利です (例: CI マシン)。
- `APPLE_CERTIFICATE_PASSWORD`: `.p12` 証明書のパスワード。
- `APPLE_ID` と `APPLE_PASSWORD`: あなたのAppleアカウントのメールアドレスと [アプリ固有のパスワード][]。 アプリの公証にのみ必要です。
- `APPLE_API_ISSUER` と `APPLE_API_KEY`: Apple ID の代わりに App Store Connect API キーによる認証。 アプリを公証する場合にのみ必要です。
- `APPLE_PROVIDER_SHORT_NAME`: チームプロバイダーのショートネーム。 Apple ID が複数のチームに接続されている場合。 アプリを公証するために使用するチームのプロバイダの短い名前を指定する必要があります。 `xcrun altool --list-providers -u "AC_USERNAME" -p "AC_PASSWORD"` を使ってアカウントプロバイダをリストすることができます。 [ワークフロー](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow).

## 牡牛座アプリの署名

macOS アプリケーションに署名する最初のステップは、Apple Developer Program から署名証明書を取得することです。

### 署名証明書の作成

新しい署名証明書を作成するには、Mac コンピュータから証明書署名リクエスト (CSR) ファイルを生成する必要があります。 [証明書署名リクエストの作成][] は、CSR の作成を記述します。

On your Apple Developer account, navigate to the [Certificates, IDs & Profiles page][] and click on the `Create a certificate` button to open the interface to create a new certificate. Choose the appropriate certificate type (`Apple Distribution` to submit apps to the App Store, and `Developer ID Application` to ship apps outside the App Store). CSRをアップロードすると、証明書が作成されます。

:::note

Apple Developer `アカウントホルダー` だけが _Developer ID Application_ の証明書を作成できます。 しかし、別のユーザーメールアドレスでCSRを作成することで、別のApple IDと関連付けることができます。

:::

### 証明書をダウンロード中

[証明書、ID & プロフィールページ][]で、使用する証明書をクリックし、 `ダウンロード` ボタンをクリックします。 これは `.cer` ファイルを保存し、一度開いたキーチェーンに証明書をインストールします。 The name of the keychain entry represents the `signing identity`, which can also be found by executing `security find-identity -v -p codesigning`.

:::note

署名証明書は、Apple ID に関連付けられている場合にのみ有効です。 無効な証明書は <i>キーチェーンアクセス > My Certificates</i> タブまたは <i>セキュリティ find-id -v -p codesigning</i> 出力にリストされません。

:::

### 牡牛座アプリケーションの署名

署名構成は、環境変数を介して Tauri バンドラに提供されます。 証明書を使用するように設定し、オプションの認証設定をアプリケーションに公証する必要があります。

#### 証明書環境変数

- `APPLE_SIGNING_IDENTITY`: これは、上で強調した `署名ID` です。 ローカルとCIマシンの両方でアプリに署名するように定義する必要があります。

さらに、CI上のコード署名プロセスを簡素化するために。 `APPLE_CERTIFICATE` と `APPLE_CERTIFICATE_PASSWORD` 環境変数を定義すると、Tauriはキーチェーンに証明書をインストールできます。

1. `Keychain Access` アプリを開き、証明書のキーチェーンエントリを探します。
2. エントリを展開し、キーアイテムをダブルクリックし、 `エクスポート "$KEYNAME"` を選択します。
3. `.p12` ファイルを保存するパスを選択し、エクスポートされた証明書パスワードを定義します。
4. `.p12` ファイルをターミナルで以下のスクリプトを実行する base64 に変換します: `openssl base64 in /path/to/certificate.p12 -out certificate-base64.txt`.
5. `certificate-base64.txt` ファイルの内容を、 `APPLE_CERTIFICATE` 環境変数に設定します。
6. 証明書パスワードを `APPLE_CERTIFICATE_PASSWORD` 環境変数に設定します。

#### 認証環境変数

これらの変数はアプリケーションを公証するためにのみ必要です。

:::note

<i>Developer ID Application</i> 証明書を使用する場合は、公証が必要です。

:::

- `APPLE_ID` and `APPLE_PASSWORD`: to authenticate with your Apple ID, set the `APPLE_ID` to your Apple account email (example: `export APPLE_ID=tauri@icloud.com`) and the `APPLE_PASSWORD` to an [app-specific password][] for the Apple account.
- `APPLE_API_ISSUER` と `APPLE_API_KEY`: 代わりに、App Store Connect APIキーを使用して認証することができます。 Open the App Store Connect's [Users and Access page][], select the `Keys` tab, click on the `Add` button and select a name and the `Developer` access. The `APPLE_API_ISSUER` (`Issuer ID`) is presented above the keys table, and the `APPLE_API_KEY` is the value on the `Key ID` column on that table. 秘密鍵もダウンロードする必要があります これはページを再読み込みした後にのみ表示されます (ボタンは新しく作成されたキーのテーブル行に表示されます)。 The private key file must be saved on `./private_keys`, `~/private_keys`, `~/.private_keys` or `~/.appstoreconnect/private_keys`, as stated on the `xcrun altool --help` command.

### アプリケーションのビルド

`tauri build` コマンドを実行すると、これらの環境変数が設定され、アプリケーションに自動的に署名します。

### 例

次の例では、GitHub Actions を使用して、 [Tauri アクション][] を使用してアプリケーションに署名します。

最初に、上記の環境変数を GitHub 上で秘密情報として定義します。

:::note

GitHub の秘密について学ぶには、このガイド <a href="https://docs.github.com/en/actions/reference/encrypted-secrets"></a> をご覧ください。

:::

GitHub の秘密を確立したら、 `.github/workflows/main.yml` でGitHub の公開ワークフローを作成します。

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
          プレリリース: false
```

ワークフローは GitHub からシークレットを取り出し、牡牛座アクションを使用してアプリケーションを構築する前に環境変数として定義します。 出力は、署名され公証化されたmacOSアプリケーションを備えたGitHubリリースです。

[tauri-apps/tauri#592]: https://github.com/tauri-apps/tauri/issues/592
[Apple Developer Program]: https://developer.apple.com/programs/
[macOSソフトウェアを公証する]: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
[アプリ固有のパスワード]: https://support.apple.com/en-ca/HT204397
[app-specific password]: https://support.apple.com/en-ca/HT204397
[証明書署名リクエストの作成]: https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request
[Certificates, IDs & Profiles page]: https://developer.apple.com/account/resources/certificates/list
[証明書、ID & プロフィールページ]: https://developer.apple.com/account/resources/certificates/list
[Users and Access page]: https://appstoreconnect.apple.com/access/users
[Tauri アクション]: https://github.com/tauri-apps/tauri-action
