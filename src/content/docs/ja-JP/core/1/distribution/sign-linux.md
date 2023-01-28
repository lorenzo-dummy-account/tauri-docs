---
sidebar_label: Linuxコード署名
sidebar_position: 3
---

# コード署名 Linux パッケージ

このガイドでは、Linux パッケージのコード署名に関する情報を提供します。

## 要件

- gpg または gpg2

署名のための鍵を準備する必要があります。 新しいものを生成するには、次を使用します。

```shell
gpg2 --full-gen-key
```

詳細については、gpg または gpg2 のドキュメントを参照してください。 秘密鍵と公開鍵を安全な場所にバックアップするために、追加の注意を払う必要があります。

## AppImagesのサインイン中

以下の環境変数を設定することで、AppImage に署名を埋め込むことができます。

- **SIGN**: AppImageに署名するには `1` に設定します。
- **SIGN_KEY**: 署名に特定のGPGキーIDを使用する任意の変数。
- **APPIMAGETOOL_SIGN_PASSPRASE**: 署名キーパスワード。 設定されていない場合、gpg にダイアログが表示され、入力できるようになります。 自動化されたタスクを実行するときにこれを設定する必要があります。

次のコマンドを実行することで、AppImageに埋め込まれた署名を表示できます。

```shell
./src-tauri/target/release/bundle/appimage/$APPNAME_$VERSION_amd64.AppImage --appimage-signature
```

設定に基づいて、 $APPNAME と $VERSION の値を正しい値で変更する必要があることに注意してください。

:::注意 この署名は検証されていません

AppImageは署名を検証しないので、ファイルが改ざんされているかどうかを確認するのに依存することはできません。 署名を検証するには、ユーザに外部ツールを提供する必要があります。 詳細については、 [公式の AppImage ドキュメント][] を参照してください。

:::

[公式の AppImage ドキュメント]: https://docs.appimage.org/packaging-guide/optional/signatures.html
