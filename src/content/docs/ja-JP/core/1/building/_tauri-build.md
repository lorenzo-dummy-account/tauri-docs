import Command from '@theme/Command'

# レンダリングを修正するための一時的な見出し

<!-- The above heading is here because fragments aren't really supported in the context of Astro Content Collections -->

Tauriアプリケーションを単一の実行ファイルにビルドしてバンドルするには、次のコマンドを実行します。

<Command name="build" />

フロントエンドをビルドします (設定されている場合は [`beforeBuildCommand`][beforebuildcommand]を参照してください)、Rust バイナリをコンパイルします。 すべての外部バイナリとリソースを収集し、最終的にプラットフォーム固有のバンドルとインストーラをきちんと生産します。

[beforebuildcommand]: ../../api/config.md#buildconfig.beforebuildcommand
