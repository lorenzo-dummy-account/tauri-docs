---
sidebar_position: 4
---

import TauriBuild from './\_tauri-build.md'

# Linux バンドル

## 制限事項

glibc のようなコア ライブラリは、古いシステムとの互換性をしばしば破ります。 このため、サポートしようとしている最も古いベースシステムを使用して、あなたの牡牛座アプリケーションを構築する必要があります。 A relatively old system such as Ubuntu 18.04 is more suited than Ubuntu 22.04, as the binary compiled on Ubuntu 22.04 will have a higher requirement of the glibc version, so when running on an older system, you will face a runtime error like `/usr/lib/libc.so.6: version 'GLIBC_2.33' not found`. Linux用のTauriアプリケーションを構築するために、DockerコンテナまたはGitHubアクションを使用することをお勧めします。

詳細については、 [tauri-apps/tauri#1355][] および [rust-lang/rust#57497][]に加えて、 [AppImage guide][] の問題を参照してください。

## Debian

Tauri allows your app to be packaged as a `.deb` (Debian package) file. Linux上でビルドする場合、Tauri CLIはアプリケーションのバイナリと追加のリソースをこの形式でバンドルします。 `.deb` パッケージは **Linux** でのみ作成できます。クロスコンパイルはまだ動作しないためです。

Tauriバンドラーによって生成された標準のDebianパッケージには、DebianベースのLinuxディストリビューションにアプリケーションを出荷するために必要なものがすべて揃っています。 アプリケーションのアイコンを定義し、Desktop ファイルを生成し、依存関係を指定する `libwebkit2gtk-4 -37 <code>` と `libgtk-3-0`, `libappindicator3-1` アプリがシステムトレイを使用している場合.

:::note
GUI apps on macOS and Linux do not inherit the `$PATH` from your shell dotfiles (`.bashrc`, `.bash_profile`, `.zshrc`, etc). この問題を解決するには、牡牛座の [fix-path-env-rs](https://github.com/tauri-apps/fix-path-env-rs) をチェックしてください。
:::

<TauriBuild />

### カスタムファイル

Tauriは、より多くの制御が必要な場合に備えて、Debian パッケージのいくつかの設定を公開しています。

アプリが追加のシステム依存関係に依存している場合は、 `tauri.conf.json > tauri > bundle > deb > に指定できます。`.

To include custom files in the Debian package, you can provide a list of files or folders in `tauri.conf.json > tauri > bundle > deb > files`. The configuration object maps the path in the Debian package to the path to the file on your filesystem, relative to the `tauri.conf.json` file. 設定例を以下に示します。

```json
{
  "tauri": {
    "bundle": {
      "deb": {
        "files": {
          "/usr/share/README.md": "../README.md", // copies the README.md file to /usr/share/README.md
          "usr/share/assets": "../assets/" // copies the entire assets directory to /usr/share/assets
        }
      }
    }
  }
}
```

クロスプラットフォーム方法でファイルをバンドルする必要がある場合は、Tauriの [リソース][] と [サイドカー][] メカニズムを確認してください。

## AppImage

AppImageは、システムがインストールしたパッケージに依存せず、アプリケーションが必要とするすべての依存関係とファイルをバンドルする配布形式です。 このため、 多くのLinuxディストリビューションでサポートされており、インストールなしで実行できるため、出力ファイルは大きくなりますが、配布が簡単です。 The user just needs to make the file executable (`chmod a+x MyProject.AppImage`) and can then run it (`./MyProject.AppImage`).

AppImagesは、ディストリビューションのパッケージマネージャを対象としてパッケージを作ることができない場合、配布プロセスを簡素化するのに便利です。 それでも、ファイルサイズが2-6MBから70+MBに拡大するにつれて、慎重に使用する必要があります。

:::注意

アプリがオーディオ/ビデオを再生する場合は、 `tauri.conf.json > tauri > bundle > appimage > bundleMediaFramework` を有効にする必要があります。 これにより、メディア再生に必要な追加 `gstreamer` ファイルが含まれるように、AppImage バンドルのサイズが増えます。 このフラグは現在、Ubuntuビルドシステムでのみサポートされています。

:::

[リソース]: resources.md
[サイドカー]: sidecar.md
[tauri-apps/tauri#1355]: https://github.com/tauri-apps/tauri/issues/1355
[rust-lang/rust#57497]: https://github.com/rust-lang/rust/issues/57497
[AppImage guide]: https://docs.appimage.org/reference/best-practices.html#binaries-compiled-on-old-enough-base-system
