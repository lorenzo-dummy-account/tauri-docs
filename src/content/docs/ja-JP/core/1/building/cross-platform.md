---
sidebar_position: 5
---

# クロスプラットフォームのコンパイル

Tauriはネイティブライブラリとツールチェーンに大きく依存しているため、現在のところ意味のあるクロスコンパイルは **不可能** です。 次の最良の選択肢は、 [GitHub Actions][]のようなものでホストされている CI/CD パイプラインを使用してコンパイルすることです。 Azureパイプライン、GitLab、その他のオプション。 各プラットフォームのコンパイルを同時に実行することで、コンパイルとリリースのプロセスをより簡単にすることができます。

簡単なセットアップのために、現在、サポートされているすべてのプラットフォーム上で実行される [Tauri Action][]を提供しています。 ソフトウェアをコンパイルし、必要なアーティファクトを生成し、それらを新しい GitHub リリースにアップロードします。

## Tauri GitHub Action

Tauri ActionはGitHub Actionsを活用して、macOSのTauriネイティブバイナリとしてアプリケーションを同時に構築します。 Linux、Windows、およびGitHubリリースの作成を自動化します。

この GitHub Action は、Tauri アプリのテストパイプラインとしても使用できます。 新しいリリースを作成したくない場合でも、コンパイルが送信されるたびにすべてのプラットフォームで正常に動作することを保証します。

:::infoコード署名

ワークフローで Windows と macOS の両方のコード署名を設定するには、各プラットフォームの特定のガイドに従ってください。

- [GitHub アクションを使用した Windows コード署名][]
- [GitHub アクションを使用した macOS コード署名][]

:::

### はじめに

Tauri Action を設定するには、まず GitHub リポジトリをセットアップする必要があります。 それは自動的に構築し、あなたのアーティファクトを使用するように構成する前に牡牛座を初期化するので、それは設定されていないレポでこのアクションを使用することができます。

GitHub プロジェクトの format@@0 タブに移動し、format@@1 を選択し、format@@2 を選択します。 ファイルを [Tauri Action 本番ビルドワークフローの例][] に置き換えます。 あるいは、このページの下部にある [例に基づいてワークフローを設定することもできます](#example-workflow)

### 設定

`configPath`、 `distPath` および `iconPath` オプションを使用して、牡牛座を設定できます。 詳細はアクションReadmeを参照してください。


<!-- FIXME: tauriScript is currently broken.
  Custom Tauri CLI scripts can be run with the `tauriScript` option. So instead of running `yarn tauri build` or `npx tauri build`, `${tauriScript}` will be executed. This can be useful when you need custom build functionality such as when creating Tauri apps e.g. a `desktop:build` script.
-->

アプリケーションがリポジトリのルートにない場合は、 `projectPath` 入力を使用します。

ワークフロー名を変更し、トリガーを変更できます。 `npm run lint` や `npm run test` などのステップを追加します。 重要な点は、ワークフローの最後に以下の行を保持することです。 これがビルドスクリプトを実行し、アーティファクトを解放するので、

```yaml
- uses: tauri-apps/tauri-action@v0
```

### トリガーする方法

上記のリンク先のREADMEのリリースワークフローは、"release"ブランチでプッシュすることによって引き起こされます。 このアクションは、 `tauri.config.json` で指定したアプリケーションバージョンを使用して、GitHub リリースのタグとタイトルを自動的に作成します。

「app-v0.7.0」などのバージョンタグのプッシュでワークフローをトリガーすることもできます。 このために、リリース ワークフローの開始を変更できます。

```yaml
name: publish
:
  push:
    tags:
      - 'app-v*'
  workflow_dispatch:
```

### ワークフローの例

以下は、git で新しいバージョンが作成されるたびに実行されるワークフローの例です。

このワークフローは、Windows、Ubuntu、およびmacOSの最新バージョンで環境を設定します。 `jobs.release.strategy.matrix` の下で、 `macos-latest`, `ubuntu-20.04`, および `windows-latest` を含むプラットフォーム配列に注意してください。

このワークフローがとるステップは以下のとおりです。

1. `actions/checkout@v3 を使用してリポジトリをチェックアウト`
2. `actions/setup-node@v3` を使用して、ノードLTSとグローバルnpm/yarn/pnpm パッケージデータのキャッシュを設定します。
3. `dtolnay/rust-toolchain@stable` と `swatinem/rust-cache@v2` を使用して、 `target/` フォルダの Rust とキャッシュを設定します。
4. すべての依存関係をインストールし、ビルドスクリプト(ウェブアプリ用)を実行します。
5. 最後に、 `tauri-apps/tauri-action@v0` を使用して `tauriビルド`を実行し、アーティファクトを生成し、GitHubリリースを作成します。

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  release:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-20.04, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Install dependencies (ubuntu only)
        if: matrix.platform == 'ubuntu-20.04'
        # You can remove libayatana-appindicator3-dev if you don't use the system tray feature.
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev

      - name: Rust setup
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: './src-tauri -> target'

      - name: Sync node version and setup cache
        uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'
          cache: 'yarn' # Set this to npm, yarn or pnpm.

      - name: アプリの依存関係をインストールしてウェブをビルド
        # Remove `&& yarn build` if you build your frontend in `beforeBuildCommand`
        run: yarn && yarn build # Change this to npm yarn or pnpm

      - name: アプリをビルドする
        の使用法: tauri-apps/tauri-action@v0

        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }} # ワークフローが新しいタグをトリガーした場合にのみ動作します。
          releaseName: 'App Name v__VERSION__' # tauri-action は \_\_VERSION\__ をアプリのバージョンに置き換えます。
          releaseBody: 'アセットを参照して、このバージョンをダウンロードしてインストールします。
          releaseDraft: true
          プレリリース: false
```

### GitHub 環境トークン

GitHubトークンは、追加の設定なしでワークフローを実行するごとにGitHubによって自動的に発行されるため、秘密の漏洩のリスクはありません。 ただし、このトークンはデフォルトで読み取り権限のみを持っており、ワークフローを実行しているときに「統合でアクセスできないリソース」エラーが発生する可能性があります。 この場合、このトークンに書き込み権限を追加する必要があるかもしれません。 これを行うには、GitHub プロジェクトの設定に移動し、format@@0を選択し、format@@1にスクロールダウンし、format@@2にチェックを入れます。

以下のワークフローに渡されているGitHubトークンをご覧ください。

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 使用上の注意

GitHub Actions [のドキュメント][github actions] を確認して、このワークフローの仕組みをよりよく理解してください。 GitHub Actionsの [Usage limits、billing、administration][usage limits billing and administration] ドキュメントをお読みください。 いくつかのプロジェクトテンプレートは、 [tauri-svelte-template][] のように、すでにこの GitHub アクションワークフローを実装している可能性があります。 牡牛座が設定されていないリポジトリでこのアクションを使用できます。 牡牛座は自動的に構築し、あなたのウェブアーティファクトを使用するように構成する前に初期化します。

[Tauri Action]: https://github.com/tauri-apps/tauri-action
[Tauri Action 本番ビルドワークフローの例]: https://github.com/tauri-apps/tauri-action#creating-a-release-and-uploading-the-tauri-bundles
[GitHub Actions]: https://docs.github.com/en/actions
[github actions]: https://docs.github.com/en/actions
[usage limits billing and administration]: https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration
[tauri-svelte-template]: https://github.com/probablykasper/tauri-svelte-template
[GitHub アクションを使用した Windows コード署名]: ../distribution/sign-windows.md#bonus-sign-your-application-with-github-actions
[GitHub アクションを使用した macOS コード署名]: ../distribution/sign-macos.md#example
