---
sidebar_position: 5
---

# アップデータ

## 設定

牡牛座プロジェクトの準備ができたら、アップデータを設定する必要があります。

これを tauri.conf.json に追加

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

必須キーは "active", "endpoints" および "pubkey" です。他のキーはオプションです。

"active"はブール値でなければなりません。 デフォルトでは、falseに設定されています。

"endpoints" は配列でなければなりません。 文字列 `{{target}}` と `{{current_version}}` は自動的にURLに置き換えられ、更新が利用可能な場合、 [サーバーサイド](#update-server-json-format) を判断できます。 複数のエンドポイントが指定された場合、サーバーが事前に定義されたタイムアウト内に応答しない場合、updaterはフォールバックされます。

存在する場合は "dialog" は boolean でなければなりません。 デフォルトでは、true に設定されています。 有効にすると、 [イベント](#events) がすべてを更新する際にオフになります。 カスタムイベントが必要な場合は、組み込みダイアログをオフにしなければなりません。

"pubkey" は Tauri CLI で生成された有効な公開鍵でなければなりません。 [更新の署名](#signing-updates) を参照してください。

### リクエストの更新

牡牛座は、クライアントアプリケーションが更新チェックのために提供する要求に無関心です。

`Accept: application/json` がリクエストヘッダに追加されました。

レスポンスと本文の更新形式に課せられた要件については、レスポンスは [サーバーサポート](#server-support) を参照してください。

サーバーがこの特定のバージョンの更新が必要かどうかを判断できるように、更新リクエストは _少なくとも_ バージョン識別子を含める必要があります。

オペレーティングシステムのバージョンなど、他の識別基準も含まれる場合があります。 必要に応じてサーバーが更新を細かく配信できるようにします。

どのようにバージョン識別子を含めるか、またはその他の条件は、更新を要求するサーバーに固有です。 一般的なアプローチはクエリパラメータを使用することです。 [Configuration](#configuration) は例を示しています。

### ビルトインダイアログ

デフォルトでは、アップデータはTauriから組み込みのダイアログAPIを使用します。

![新しいアップデート](https://i.imgur.com/UMilB5A.png)

ダイアログリリースノートは、 `サーバ` によって提供される更新 [ノート](#server-support) によって表されます。 ユーザーが承認すると、アップデートがダウンロードされ、インストールされます。 その後、ユーザーはアプリケーションを再起動するように求められます。

### Javascript API

:::caution
You need to _disable built-in dialog_ in your [tauri configuration](#configuration); Otherwise, the javascript API will NOT work.
:::

```js
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
try {
  const { shouldUpdate, manifest } = await checkUpdate()
  if (shouldUpdate) {
    // display dialog
    await installUpdate()
    // install complete, restart the app
    await relaunch()
  }
} catch (error) {
  console.log(error)
}
```

### イベント

:::注意

_tauri設定_ で組み込みダイアログ [を](#configuration)無効にする必要があります。無効にしないと、イベントは発生しません。

:::

アップデートがいつインストールされるかを知るには、以下のイベントを購読できます。

#### アップデータを初期化し、新しいバージョンが利用可能かどうかを確認します

##### 新しいバージョンが利用可能な場合は、イベント `tauri://update-available` が発行されます。

Event: `tauri://update`

#### Rust

```rust
window.emit("tauri://update".to_string(), None);
```

#### Javascript

```js
import { emit } from '@tauri-apps/api/event'
emit('tauri://update')
```

#### 新しいアップデート利用可能なイベントを再生

イベント: `tauri://update-available`

発生データ:

```
バージョン サーバが発表したバージョン
日付 サーバが発表した日付
body Notes
```

#### Rust

```rust
window.listen("tauri://update-available".to_string(), move |msg| {
  println!("New version available: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-available', function (res) {
  console.log('New version available: ', res)
})
```

#### イベントのインストールとダウンロード

ダウンロードを初期化し、 [インストールの進行状況](#listen-install-progress)をリッスンするには、このイベントを発行する必要があります。

Event: `tauri://update-install`

#### Rust

```rust
window.emit("tauri://update-install".to_string(), None);
```

#### Javascript

```js
import { emit } from '@tauri-apps/api/event'
emit('tauri://update-install')
```

#### インストールの進行状況を聞く

Event: `tauri://update-status`

発生データ:

```
status    [ERROR/PENDING/DONE]
error     String/null
```

ダウンロードを開始し、インストールが完了すると、ペンディングが発行されます。 その後、アプリケーションを再起動するように求めることができます。

アップデータでエラーが発生した場合、エラーが発生します。 ダイアログが有効になっている場合でも、このイベントを聴くことをお勧めします。

#### Rust

```rust
window.listen("tauri://update-status".to_string(), move |msg| {
  println!("New status: {:?}", msg);
})
```

#### Javascript

```js
import { listen } from '@tauri-apps/api/event'
listen('tauri://update-status', function (res) {
  console.log('New status: ', res)
})
```

## サーバーサポート

サーバーはクライアントの問題 [更新リクエスト](#update-requests) に基づいて更新が必要かどうかを判断する必要があります。

アップデートが必要な場合。 サーバはステータスコード [200 OK][] で応答し、 [更新 JSON](#update-server-json-format) を本文に含める必要があります。

アップデートが必要ない場合、サーバはステータスコード [204 No Content][]で応答する必要があります。

### サーバー JSON フォーマットの更新

アップデートが利用可能な場合、提供された更新リクエストに応じて以下のスキーマを期待します:

```json
{
  "url": "https://mycompany.example.com/myapp/releases/myrelease.tar.gz",
  "version": "0.0.1",
  "notes": "Theses are some release notes",
  "pub_date": "2020-09-18T12:29:53+01:00",
  "signature": ""
}
```

必須キーは "url", "version" と "signature" です; 他はオプションです。

"pub_date" が存在する場合は [RFC 3339][date and time on the internet: timestamps] に従ってフォーマットされなければなりません。

「署名」は、牡牛座のCLIによって生成された `.sig` ファイルの内容です。 必要なキーの設定方法については、 [Signing Updates](#signing-updates) を参照してください。

### ファイルJSON形式の更新

別の更新方法では、プレーンな JSON ファイルを使用し、S3、gist、または別の静的ファイルストアに更新メタデータを保存します。 牡牛座はバージョンフィールドに対してチェックします。 実行中のプロセスのバージョンが報告された JSON のいずれかより小さく、プラットフォームが利用可能である場合。 アップデートを引き起こすんだ このファイルの形式は以下の通りです:

```json
{
  "version": "v1.0.0",
  "notes": "Test version",
  "pub_date": "2020-06-22T19:25:57Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "",
      "url": "https://github.com/lemarier/tauri-test/releases/download/v1.0.0/app.app.tar.gz"
    },
    "darwin-aarch64": {
      "signature": "",
      "url": "https://github.com/lemarier/tauri-test/releases/download/v1.0.0/silicon/app.app.tar.gz"
    },
    "linux-x86_64": {
      "signature": "",
      "url": "https://github.com/lemarier/tauri-test/releases/download/v1.0.0/app.AppImage.tar.gz"
    },
    "windows-x86_64": {
      "signature": "",
      "url": "https://github.com/lemarier/tauri-test/releases/download/v1.0.0/app.x64.msi.zip"
    }
  }
}
```

Note that each platform key is in the `OS-ARCH` format, where `OS` is one of `linux`, `darwin` or `windows`, and `ARCH` is one of `x86_64`, `aarch64`, `i686` or `armv7`.

## バンドル (アーティファクト)

`tauri.confでアップデータが有効になっている場合、Tauriバンドラは自動的に更新アーティファクトを生成します。 son <code>` バンドラーがプライベートキーと公開キーを見つけることができれば、更新アーティファクトは自動的に署名されます。

署名は生成された `.sig` ファイルの内容です。 署名は安全にGitHubにアップロードするか、秘密鍵が安全であれば公開されます。

CI [と][artifacts updater workflow] sample tauri.conf.json [にバンドルされている][] をご覧いただけます。

### macOS

macOS では、アプリケーション全体から .tar.gz を作成します。 (.app)

```
target/release/bundle
├── macos
    ├── app.app
    └── app.app.tar.gz (update bundle)
    └── app.app.tar.gz.sig
```

### Windows

Windows では、MSIから.zipを作成します。ダウンロードと検証を行うと、MSIインストールが実行されます。

```
target/release/bundle
├── msi
    ├── app.x64.msi
    └── app.x64.msi.zip (更新バンドル)
    └── app.x64.msi.zip.sig
```

### Linux

Linuxでは、AppImageから.tar.gzを作成します。

```
target/release/bundle
└── appimage
    └── app.AppImage
    └── app.AppImage.tar.gz (update bundle)
    └── app.AppImage.tar.gz.sig
```

## アップデートの署名

アップデートが安全にインストールされるように、内蔵の署名を提供しています。

アップデートに署名するには、2つのことが必要です。

_公開キー_ (pubkey) は、インストールする前に更新アーカイブを検証するために `tauri.conf.json` 内に追加する必要があります。

_Private key_ (privkey) は更新に署名するために使用され、決して誰とも共有しないでください。 また、このキーを紛失した場合、現在のユーザーベースに新しいアップデートを公開することはできません。 安全な場所に保存することが重要で、いつでもアクセスできます。

キーを生成するには、Tauri CLIを使用する必要があります:

```shell
tauri signer generate -w ~/.tauri/myapp.key
```

利用可能な複数のオプションがあります

```
Generate keypair to sign files

USAGE:
    tauri signer generate [OPTIONS]

OPTIONS:
    -f, --force                      Overwrite private key even if it exists on the specified path
    -h, --help                       Print help information
    -p, --password <PASSWORD>        Set private key password when signing
    -V, --version                    Print version information
    -w, --write-keys <WRITE_KEYS>    Write private key to a file
```

---

Environment variables used to sign with the Tauri `bundler`:<br/> If they are set, the bundler automatically generates and signs the updater artifacts.<br/> `TAURI_PRIVATE_KEY` Path or String of your private key<br/> `TAURI_KEY_PASSWORD` Your private key password (optional)

[200 OK]: http://tools.ietf.org/html/rfc2616#section-10.2.1
[204 No Content]: http://tools.ietf.org/html/rfc2616#section-10.2.5
[date and time on the internet: timestamps]: https://datatracker.ietf.org/doc/html/rfc3339#section-5.8
[artifacts updater workflow]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/.github/workflows/artifacts-updater.yml#L44
[にバンドルされている]: https://github.com/tauri-apps/tauri/blob/5b6c7bb6ee3661f5a42917ce04a89d94f905c949/examples/updater/src-tauri/tauri.conf.json#L52
