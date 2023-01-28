---
sidebar_position: 6
---

# アプリサイズを小さくする

Tauri社は、利用可能なシステムリソースを少なくすることで、アプリケーションの環境フットプリントの削減に取り組んでいます。 実行時評価を必要としないコンパイルされたシステムを提供し、エンジニアがパフォーマンスやセキュリティを犠牲にすることなく、さらに小型化できるようにガイドを提供します。 資源を節約することで地球を救うお手伝いをしています 21世紀における企業が注目すべきボトムラインです

アプリのサイズとパフォーマンスを向上させる方法を学ぶことに興味がある方は、こちらをご覧ください!

### 測定できないものを改善することはできません

アプリを最適化する前に、アプリの空き容量を把握する必要があります。 次のようなツールをご紹介します。

- **`cargo-bloat`** - アプリで最も容量が多いものを決定する Rust ユーティリティ。 最も重要な Rust 機能の優れたソートされた概要を提供します。

- **`cargo-expand`** - [Macros][] rust コードをより簡潔かつ読みやすくする でも彼らも隠しサイズの罠だ! [`cargo-expand`][cargo-expand] を使用して、それらのマクロがどのように生成されるかを確認します。

- **`rollup-plugin-visualizer`** - ロールアップバンドルから美しい(そして洞察力のある)グラフを生成するツール。 JavaScriptの依存関係が最終的なバンドルサイズに最も貢献するものを把握するのに非常に便利です。

- **`rollup-plugin-graph`** - 最後のフロントエンドバンドルに含まれている依存性に気づいたが、なぜか分からないのか？ [`rollup-plugin-graph`][rollup-plugin-graph] 依存関係グラフ全体のGraphviz互換のビジュアライゼーションを生成します。

これらはあなたが使用するかもしれないツールのほんの一部です。 フロントエンドバンドラーのプラグインリストを確認してください!

## Checklist

1. [JavascriptをMinifyする](#minify-javascript)
2. [依存関係の最適化](#optimize-dependencies)
3. [画像の最適化](#optimize-images)
4. [不要なカスタムフォントを削除](#remove-unnecessary-custom-fonts)
5. [Allowlist Config](#allowlist-config)
6. [Rust BuildTime Optimizations](#rust-build-time-optimizations)
7. [剥離中](#stripping)
8. [UPX](#upx)

### JavaScriptを圧縮する

JavaScriptは典型的な牡牛座アプリの大部分を構成しているので、JavaScriptをできるだけ軽量にすることが重要です。

たくさんの JavaScript バンドラから選択できます。一般的な選択肢は、 [Vite][]、 [webpack][]、および [rollup][] です。 これらはすべて、正しく設定されている場合は minified JavaScript を生成できますので、特定のオプションについてはバンドラのドキュメントを参照してください。 一般的に言えば、次のことを確認する必要があります:

#### 揺れを有効にする

このオプションは、バンドルから未使用の JavaScript を削除します。 すべての一般的なバンドラはデフォルトでこれを有効にします。

#### ミニファイを有効にする

Minificationは不要な空白を削除し、変数名を短縮し、その他の最適化を適用します。 Most bundlers enable this by default; a notable exception is [rollup][], where you need plugins like [rollup-plugin-terser][] or [rollup-plugin-uglify][].

注意: [terser][] や [esbuild][] のような、スタンドアロンのツールとして使用できます。

#### ソースマップを無効にする

ソースマップは、 [TypeScript][] のようなJavaScriptにコンパイルされる言語を扱う際に、快適な開発者体験を提供します。 ソースマップはかなり大きい傾向がありますので、プロダクション用にビルドする際に無効にしなければなりません。 彼らはあなたのエンドユーザーに利点がないので、それは効果的に死んで重量です。

### 依存関係の最適化

多くの人気のあるライブラリには、代わりに選択できるより小さく、より速い選択肢があります。

ほとんどのライブラリは多くのライブラリに依存しています。 目立たないように見えるライブラリは、アプリに **数メガバイト** 相当のコードを追加する可能性があります。

[Bundlephobia][] を使用して JavaScript の依存関係のコストを求めることができます。 Rust 依存関係のコストを調べるのは一般的に難しい。なぜなら、コンパイラは多くの最適化を行うからだ。

あなたが過度に大きいと思われるライブラリを見つけた場合、Googleの周りは、他の誰かがすでに同じ考えを持っていたと代替案を作成している可能性があります。 良い例は [Moment.js][] で、 [多くの代替案][you-dont-need-momentjs] です。

しかし、注意してください: **依存関係はありません**。つまり、サードパーティのパッケージよりも常に言語の組み込みを好む必要があります。

### 画像の最適化

[Http Archive][]によると、画像は [ウェブサイトの重量][http archive report, image bytes] の最大の貢献者です。 そのため、アプリに画像やアイコンが含まれている場合は、それらを最適化してください!

You can choose between a variety of manual options ([GIMP][], [Photoshop][], [Squoosh][]) or plugins for your favorite frontend build tools ([vite-imagetools][], [vite-plugin-imagemin][], [image-minimizer-webpack-plugin][]).

ほとんどのプラグインで使用されている `imagemin` ライブラリは [公式にメンテナンスされていない][imagemin is unmaintained] であることに注意してください。

#### 最新の画像フォーマットを使用

`webp` や `avif` などの形式は、優れた視覚的精度を維持しながら、jpegと比較して、 **最大 95%** のサイズ削減を提供します。 [Squosh][] などのツールを使用して、 画像で異なる形式を試すことができます。

#### それに応じたサイズの画像

6K生画像をアプリで出荷することを誰も認めてくれませんので、それに応じて画像のサイズを確認してください。 画面上で大きく表示される画像は、画面スペースが少ない画像よりも大きくする必要があります。

#### レスポンシブ画像を使用しない

Web 環境では、 [レスポンシブ画像][] を使用して、ユーザーごとに正しい画像サイズを動的に読み込むことになっています。 レスポンシブイメージを使用すると、ウェブ上で画像を動的に配信することはできませんので、不必要にアプリケーションを冗長コピーで膨らませるだけです。

#### メタデータを削除

カメラやストック写真側から直接撮影した画像には、カメラやレンズモデルや写真家に関するメタデータが含まれることが多い。 これらの無駄なバイトだけでなく、メタデータ プロパティも時刻などの機密情報を保持できます。 日と写真の場所だ

### 不要なカスタムフォントを削除

カスタムフォントをアプリで出荷しないことを検討し、代わりにシステムフォントに依存しています。 カスタムフォントを出荷する必要がある場合は、 `woff2` など、最新の最適化されたフォーマットであることを確認してください。

フォントはかなり大きくなる可能性があるため、オペレーティングシステムに既に含まれているフォントを使用すると、アプリケーションのフットプリントが削減されます。 また、FOUT(スタイルなしテキストのフラッシュ)を回避し、他のすべてのアプリと同じフォントを使用しているため、アプリがネイティブに感じられるようになります。

カスタムフォントを含める必要がある場合。 `woff2` のような現代的なフォーマットに含めることを確認してください。従来のフォーマットよりもはるかに小さくなる傾向があります。

CSSでいわゆる **"システムフォントスタック"** を使用します。 バリエーションは 数ありますが、ここでは基本的なものを3つ紹介します。

**Sans-Serif**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
  sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

**Serif**

```css
font-family: Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid
    Serif, Times, Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe
    UI Symbol;
```

**Monospace**

```css
font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Console, Liberation
    Mono, mono, monospace;
```

### Allowlist Config

`allowlist` の設定で必要な Tauri API 機能のみを有効にすることで、アプリのサイズを縮小できます。

`allowlist` の設定により、どのAPI機能を有効にするかを決定します。無効化された機能は **アプリにコンパイルされません**。 これは、いくつかの余分な重量を流す簡単な方法です。

典型的な `tauri.conf.json` の例:

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "writeFile": true
      },
      "shell": {
        "execute": true
      },
      "dialog": {
        "save": true
      }
    }
  }
}
```

### Rust Build-Time 最適化

Rust のサイズ最適化機能を活用するためにカーゴプロジェクトを構成します。 [錆びが大きいのはなぜですか?][] は、なぜこれが重要なのか、詳細な歩行を説明する優れた説明を提供します。 同時に、 [Rust Binary Size の最小化][] はより最新であり、いくつかの追加の推奨事項があります。

Rust は大規模なバイナリを生成することで有名ですが、最終的な実行ファイルのサイズを最適化するようコンパイラーに指示することができます。

Cargo はコンパイラがバイナリを生成する方法を決定するいくつかのオプションを公開します。 おうりアプリの「推奨」オプションは次のとおりです。

```toml
[profile.release]
pane = "abort" # Strip高価なパニッククリーンアップロジック
codegen-units = 1 # コンパイラがより良い
lto = true # 最適化へのリンクを有効にする
opt-level = "s" # バイナリサイズの最適化
```

:::note
バイナリサイズを小さくするために `opt-level = "z"` があります。 `"s"` と `"z"` は時々他より小さくなることがありますので、アプリケーションでテストしてみてください！

Tauriのサンプルアプリケーションでは、 `"s"` のバイナリサイズが小さくなっていますが、実際のアプリケーションは常に異なる場合があります。
:::

各オプションの詳細と詳細については、 [Cargo books Profiles][cargo profiles] を参照してください。

#### 牡牛座の資産圧縮を無効にする

デフォルトでは、牡牛座は最終バイナリで資産を圧縮するためにBrotliを使用します。 Brotliは素晴らしい結果を達成するために大きな(~170KiB)ルックアップテーブルを埋め込んでいます。 しかし、埋め込んだリソースがこれより小さく圧縮されていない場合、結果のバイナリはどの節約よりも大きくなる可能性があります。

`default-features` を `false` に設定し、 `圧縮` 機能以外のすべてを指定することで、圧縮を無効にできます。

```toml
[dependencies]
tauri = { version = "...", features = ["objc-exception", "wry"], default-features = false }
```

#### 不安定なRust圧縮機能

:::注意
以下の提案はすべて不安定な機能であり、毎晩ツールチェーンを必要とします。 この関与の詳細については、 [不安定な機能][cargo unstable features] のドキュメントを参照してください。
:::

以下のメソッドは、不安定なコンパイラ機能を使用し、夜間の rust ツールチェーンが必要です。 nightly toolchain + `rust-src` ナイトリーコンポーネントが追加されていない場合は、以下を試してみてください:

```shell
rustup toolchain install nightly
rustup component add rust-src --toolchain nightly
```

Rust Standard Libraryは事前にコンパイルされています。 これは、Rust をインストールする方が高速であることを意味しますが、コンパイラーは Standard Library を最適化できないことを意味します。 残りのバイナリ + 依存関係の最適化オプションを std に不安定なフラグで適用できます。 このフラグはターゲットを指定する必要があります。ターゲットのトリプルを確認してください。

```shell
cargo +nightly build --release -Z build-std -target x86_64-unknown-linux-gnu
```

If you are using `panic = "abort"` in your release profile optimizations, you need to make sure the `panic_abort` crate is compiled with std. さらに、std 機能を追加すると、バイナリサイズをさらに小さくすることができます。 以下は両方に適用されます：

```shell
cargo +nightly build --release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort --target x86_64-unknown-linux-gnu
```

[`-Z build-std`][cargo build-std] と [`-Z build-std-features`][cargo build-std-features] の詳細については、不安定なドキュメントを参照してください。

### 剥離中

ストリップユーティリティを使用して、コンパイル済みアプリからデバッグシンボルを削除します。

コンパイルされたアプリケーションには、関数名と変数名を含むいわゆる「デバッグシンボル」が含まれています。 あなたのエンドユーザーはおそらくDebug Symbolsを気にしないでしょう。ですから、これはバイト数を節約するにはかなり確実な方法です！

最も簡単な方法は、有名な `ストリップ` ユーティリティを使用して、このデバッグ情報を削除することです。

```shell
ストリップ対象/リリース/my_application
```

バイナリからどの情報が取り除かれるかを指定するために使用できる詳細情報やフラグについては、ローカル `ストリップ` のマニュアルを参照してください。

:::info

Rust 1.59 は `ストリップ` の内蔵バージョンになりました! カーゴ.toml `に以下のように追加することで`を有効にすることができます:

```toml
[profile.release]
ストリップ = true # バイナリからシンボルを自動的に除去します。
```

:::

### UPX

UPX, **eXecutables**のための究極のパッカー, バイナリパッカーの中の恐竜です. この23年間にわたる整備済みのキットはGPL-v2で、かなりリベラルな使用宣言が付いています。 ライセンスについての当社の理解は、UPXのソースコードを変更しない限り、ライセンスを変更することなく(商用またはそれ以外の)あらゆる目的に使用できることです。

ターゲットオーディエンスはインターネットが非常に遅いか、アプリが小さなUSBスティックに収まる必要があるかもしれません。 上記のすべてのステップはあなたが必要とする貯蓄をもたらしませんでした 恐れないでください、私たちはスリーブを1つ最後のトリックを持っています:

[UPX][] はバイナリを圧縮し、実行時に自分自身を解凍する自己解凍実行ファイルを作成します。

:::caution
You should know that this technique might flag your binary as a virus on Windows and macOS - so use at your own discretion, and as always, validate with [Frida][] and do real distribution testing!
:::

#### macOSでの使い方

<!-- Add additional platforms -->

```
brew install upx
yarn tauri build
upx --ultra-brute src-tauri/target/release/bundle/macos/app.app/Contents/macOS/app

                        Ultimate Packer for eXecutables
                            Copyright (C) 1996 - 2018
UPX 3.95        Markus Oberhumer, Laszlo Molnar & John Reiser   Aug 26th 2018

        File size         Ratio      Format      Name
    --------------------   ------   -----------   -----------
    963140 ->    274448   28.50%   macho/amd64   app
```

[Macros]: https://doc.rust-lang.org/book/ch19-06-macros.html
[cargo-expand]: https://github.com/dtolnay/cargo-expand
[rollup-plugin-graph]: https://github.com/ondras/rollup-plugin-graph
[Vite]: https://vitejs.dev
[webpack]: https://webpack.js.org
[rollup]: https://rollupjs.org/guide/en/
[rollup-plugin-terser]: https://github.com/TrySound/rollup-plugin-terser
[rollup-plugin-uglify]: https://github.com/TrySound/rollup-plugin-uglify
[terser]: https://terser.org
[esbuild]: https://esbuild.github.io
[TypeScript]: https://www.typescriptlang.org
[Moment.js]: https://momentjs.com
[you-dont-need-momentjs]: https://github.com/you-dont-need/You-Dont-Need-Momentjs
[Http Archive]: https://httparchive.org
[http archive report, image bytes]: https://httparchive.org/reports/page-weight#bytesImg
[imagemin is unmaintained]: https://github.com/imagemin/imagemin/issues/385
[GIMP]: https://www.gimp.org
[Photoshop]: https://www.adobe.com/de/products/photoshop.html
[vite-imagetools]: https://github.com/JonasKruckenberg/imagetools
[vite-plugin-imagemin]: https://github.com/vbenjs/vite-plugin-imagemin
[image-minimizer-webpack-plugin]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin
[Squoosh]: https://squoosh.app
[Squosh]: https://squoosh.app
[レスポンシブ画像]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
[錆びが大きいのはなぜですか?]: https://lifthrasiir.github.io/rustlog/why-is-a-rust-executable-large.html
[Rust Binary Size の最小化]: https://github.com/johnthagen/min-sized-rust
[cargo unstable features]: https://doc.rust-lang.org/cargo/reference/unstable.html#unstable-features
[cargo profiles]: https://doc.rust-lang.org/cargo/reference/profiles.html
[cargo build-std]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std
[cargo build-std-features]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std-features
[Bundlephobia]: https://bundlephobia.com
[Frida]: https://frida.re/docs/home/
[UPX]: https://github.com/upx/upx
