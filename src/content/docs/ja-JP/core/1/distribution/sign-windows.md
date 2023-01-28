---
sidebar_label: Windowsコード署名
sidebar_position: 2
---

# Windows - コード署名ガイド & GitHub Actions

## はじめに

コード署名を使用すると、アプリケーションの公式実行ファイルをダウンロードし、アプリとしてポーズを取るサードパーティのマルウェアではないことをユーザーに知らせることができます。 必須ではありませんが、アプリに対するユーザーの信頼性が向上します。

## 前提条件

- Windows - おそらく他のプラットフォームを使用することはできますが、このチュートリアルではPowershellネイティブ機能を使用します。
- 動作中の牡牛座アプリケーション
- コード署名証明書 - [Microsoftのドキュメント][] に記載されているサービスでこれらのいずれかを取得できます。 そのリストに含まれている以外のEV以外の証明書については、当局が追加されている可能性があります。それらを自分で比較し、自己責任で選択してください。
  - **コード** 証明書を取得してください。SSL 証明書が動作しません！

このガイドでは、標準コード署名証明書があることを前提としています> EV証明書をお持ちの場合。 一般的にハードウェアトークンが関与します代わりに発行者の書類に従ってください

:::note

EV証明書を使用してアプリに署名すると、Microsoft SmartScreenで即座に評判が得られ、ユーザーに警告は表示されません。

一般的に安価で個人が利用できるOV証明書を選ぶ場合 Microsoft SmartScreenは、ユーザーがアプリをダウンロードしたときに警告を表示します。 証明書が十分な評判を築くまでには時間がかかる場合があります。 [アプリを送信する][] をマイクロソフトに手動で確認することができます。 保証されませんが、アプリに悪意のあるコードが含まれていない場合。 Microsoftは追加の評判を付与し、特定のアップロードされたファイルの警告を削除する可能性があります。

:::

## はじめに

Windowsをコード署名用に準備させるためには、いくつかのことをしなければなりません。 これには、当社の証明書を特定のフォーマットに変換し、この証明書をインストールし、証明書から必要な情報をデコードすることが含まれます。

### A. `.cer` を `.pfx` に変換する

1. 以下が必要です:

   - 証明書ファイル(mine は `cert.cer`)
   - 秘密キーファイル（mineは `private-key.key`）

2. コマンドプロンプトを開き、 `cd Documents/Certs` を使用して現在のディレクトリに変更します

3. `.cer` を `.pfx` に `openssl pkcs12 -export in cert.cer -inkey private-key.key -out certificate.pfx`

4. エクスポートパスワードの入力を求められる必要があります **忘れないでください!**

### B. キーストアに `.pfx` ファイルをインポートします。

次に、 `.pfx` ファイルをインポートする必要があります。

1. `$WINDOWS_PFX_PASSWORD = 'MYPASSWORD'` を使用して、エクスポートパスワードを変数に割り当てます

2. `Import-PfxCertificate -FilePath Certificate -Certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_PFX_PASSWORD -Force -AsPlainText)`

### C. 変数の準備

1. 証明書の SHA-1 サムネイルが必要です。これは `openssl pkcs12 -info in-certificate.pfx` で取得し、以下を参照してください。

```
バッグ属性
    localKeyID: A1 B1 A2 A2 A3 A4 A4 A4 A5 A5 A6 A6 A7 A7 A8 A9 B9 A0 B0
```

2. `localKeyID` をキャプチャしますが、スペースはありません。この例では、 `A1B1A2B2A2B2A3B3A4B4A5B5A6B6A7B7A8A9B9A0B0B0` になります。 これは `certificateThumbprint` です。

3. 証明書に使用されるSHAダイジェストアルゴリズムが必要です（ヒント：これは可能性が `sha256`

4. タイムスタンプURLも必要です。これは証明書署名の時刻を確認するために使用されるタイムサーバーです。 私は `http://timestamp.comodoca.com`を使用していますが、あなたが証明書を取得した人も同様に1つ持っています。

## `tauri.conf.json` ファイルを準備する

1. Now that we have our `certificateThumbprint`, `digestAlgorithm`, & `timestampUrl` we will open up the `tauri.conf.json`.

2. `tauri.conf.json` で `tauri` -> `bundle` -> `windows` セクションを探します。 ご覧の通り３つの変数が捕捉されています 以下のように記入してください。

```json tauri.conf.json
"windows": {
        "certificateThumbprint": "A1B1A2B2A3B3A4B4A5B5A6A6A7B7A8B8A9A9B8A9A0B0B0",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com"
}
```

3. 保存して実行 `yarn | yarn build`

4. コンソール出力では、次の出力が表示されます。

```
info: signing app
info: running signtool "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x64\\signtool.exe"
info: "Done Adding Additional Store\r\nSuccessfully signed: APPLICATION FILE PATH HERE
```

`.exe` に正常に署名したことを示します。

そしてそれはそれ! .exeファイルに正常に署名しました。

## BONUS: GitHub Actionsでアプリケーションに署名します。

また、GitHub のアクションでアプリケーションに署名するワークフローを作成することもできます。

### GitHub Secrets

GitHub Actionの適切な設定のために、いくつかのGitHubシークレットを追加する必要があります。 これらはあなたが望むだろうが、名前を付けることができます。

- GitHubの秘密を追加する方法については、 [暗号化された秘密][] ガイドをご覧ください。

使用した秘密は以下の通りです

|         GitHub Secrets         |                                                   変数の値                                                   |
|:------------------------------:|:--------------------------------------------------------------------------------------------------------:|
|      WINDOWS_CERTIFICATE       | .pfx 証明書の Base64 エンコードされたバージョンは、このコマンド `certutil -encode certificate.pfx base64cert.txt` を使用して行うことができます。 |
| WINDOWS_CERTIFICATE_PASSWORD |                     Certificate export password used on creation of certificate .pfx                     |

### ワークフローの変更

1. 証明書を Windows 環境にインポートするには、ワークフローにステップを追加する必要があります。 このワークフローは以下を達成します

   1. GitHub のシークレットを環境変数に割り当てる
   2. 新しい `証明書` ディレクトリを作成
   3. `WINDOWS_CERTIFICATE` を tempCert.txt にインポート
   4. `certutil` を使用して、tempCert.txt を base64 から `.pfx` ファイルにデコードします。
   5. tempCert.txt を削除
   6. `をインポートします。 fx <code>` ファイルを Windows の Cert store に変換 & インポートコマンドで使用する安全な文字列に `WINDOWS_CERTIFICATE_PASSWORD` を変換します。

2. [`tauri-action` 公開テンプレート][] を使用します。

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
        platform: [macos-latest, ubuntu-latest, windows-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v1
        with:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install webkit2gtk (ubuntu only)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-4.0
      - name: install app dependencies and build it
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: app-v__VERSION__ # the action automatically replaces \_\_VERSION\_\_ with the app version
          releaseName: 'App v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          プレリリース: false
```

3. 右上の `-name: アプリの依存関係をインストールしてビルド` 次のステップを追加します。

```yml
- name: import windows certificate
  if: matrix.platform == 'windows-latest'
  env:
    WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
    WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  run: |
    New-Item -ItemType directory -Path certificate
    Set-Content -Path certificate/tempCert.txt -Value $env:WINDOWS_CERTIFICATE
    certutil -decode certificate/tempCert.txt certificate/certificate.pfx
    Remove-Item -path certificate -include tempCert.txt
    Import-PfxCertificate -FilePath certificate/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_CERTIFICATE_PASSWORD -Force -AsPlainText)
```

4. 保存してリポジトリにプッシュします。

5. ワークフローで windows 証明書をインポートして GitHub ランナーにインポートできるようになり、自動的なコード署名が可能になりました。

[Microsoftのドキュメント]: https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-cert-manage
[アプリを送信する]: https://www.microsoft.com/en-us/wdsi/filesubmission/
[暗号化された秘密]: https://docs.github.com/en/actions/reference/encrypted-secrets
[`tauri-action` 公開テンプレート]: https://github.com/tauri-apps/tauri-action
