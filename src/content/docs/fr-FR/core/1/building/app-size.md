---
sidebar_position: 6
---

# Réduire la taille de l'application

Avec Tauri, nous nous efforçons de réduire l'empreinte environnementale des applications en utilisant moins de ressources du système lorsque cela est disponible, en fournissant des systèmes compilés qui n'ont pas besoin d'évaluer le temps d'exécution, et en offrant des guides pour que les ingénieurs puissent aller encore plus petit sans sacrifier leurs performances ou leur sécurité. En économisant des ressources, nous faisons notre part pour vous aider à sauver la planète, qui est la seule source de revenus pour laquelle les entreprises du XXIe siècle devraient se soucier.

Donc, si vous êtes intéressé à apprendre comment améliorer la taille et la performance de votre application, lisez !

### Vous ne pouvez pas améliorer ce que vous ne pouvez pas mesurer

Avant de pouvoir optimiser votre application, vous devez déterminer ce qui occupe de l'espace dans votre application ! Voici quelques outils qui peuvent vous aider :

- **`cargo-bloat`** - Un utilitaire Rust pour déterminer ce qui prend le plus d'espace dans votre application. Il vous donne un excellent aperçu trié des fonctions Rust les plus importantes.

- **`cargo-expansion`** - [Macros][] rendent votre code de rouille plus concis et plus facile à lire, mais ils sont aussi des pièges cachés! Utilisez [`cargo-expanser`][cargo-expand] pour voir ce que ces macros génèrent sous le capot.

- **`rollup-plugin-visualizer`** - Un outil qui génère de beaux graphiques (et intéressants) à partir de votre lot de rollup. Très pratique pour déterminer quelles dépendances JavaScript contribuent le plus à la taille de votre paquet final.

- **`rollup-plugin-graph`** - Vous avez remarqué une dépendance incluse dans votre paquet final de frontend, mais vous n'êtes pas sûr de pourquoi? [`rollup-plugin-graph`][rollup-plugin-graph] génère des visualisations compatibles Graphviz de votre graphique de dépendance.

Ce ne sont que quelques outils que vous pourriez utiliser. Assurez-vous de vérifier la liste de vos bundles en frontend pour en savoir plus!

## Checklist

1. [Minifier Javascript](#minify-javascript)
2. [Optimiser les dépendances](#optimize-dependencies)
3. [Optimiser les images](#optimize-images)
4. [Supprimer les polices personnalisées inutiles](#remove-unnecessary-custom-fonts)
5. [Configuration de la liste d'autorisations](#allowlist-config)
6. [Optimisations de Rust Build-Time](#rust-build-time-optimizations)
7. [Enlèvement](#stripping)
8. [UPX](#upx)

### Minifier JavaScript

JavaScript représente une grande partie d'une application typique Tauri, donc il est important de rendre le JavaScript aussi léger que possible.

Vous pouvez choisir parmi une pléthore de bundles JavaScript ; les choix populaires sont [Vite][], [webpack][]et [rollup][]. Tous peuvent produire du JavaScript minifié si configuré correctement, donc consultez la documentation de votre bundler pour des options spécifiques. En général, vous devriez vous assurer de :

#### Activer le tremblement d'arbre

Cette option supprime JavaScript inutilisé de votre bundle. Tous les bundles populaires l'activent par défaut.

#### Activer la minification

La minification supprime les espaces inutiles, raccourcit les noms de variables et applique d'autres optimisations. La plupart des bundlers l'activent par défaut ; une exception notable est [rollup][], où vous avez besoin de plugins comme [rollup-plugin-terser][] ou [rollup-plugin-uglify][].

Remarque : Vous pouvez utiliser des minificateurs comme [terser][] et [esbuild][] comme outils autonomes.

#### Désactiver les cartes sources

Les cartes sources fournissent une expérience de développement agréable lorsque vous travaillez avec des langages qui compilent en JavaScript, tels que [TypeScript][]. Comme les cartes sources ont tendance à être assez grandes, vous devez les désactiver lors de la construction en production. Ils n'ont aucun avantage pour votre utilisateur, donc c'est effectivement un poids mort.

### Optimiser les dépendances

De nombreuses bibliothèques populaires ont des alternatives plus petites et plus rapides que vous pouvez choisir à la place.

La plupart des bibliothèques que vous utilisez dépendent de nombreuses bibliothèques elles-mêmes, afin qu'une bibliothèque qui semble peu visible à première vue puisse ajouter **plusieurs méga-octets** de code à votre application.

Vous pouvez utiliser [Bundlephobia][] pour trouver le coût des dépendances JavaScript. Inspecter le coût des dépendances Rust est généralement plus difficile car le compilateur effectue de nombreuses optimisations.

Si vous trouvez une bibliothèque qui semble excessivement grande, Google autour, il y a des chances que quelqu'un d'autre ait déjà la même pensée et créé une alternative. Un bon exemple est [Moment.js][] et c'est [de nombreuses alternatives][you-dont-need-momentjs].

Mais gardez à l'esprit : **La meilleure dépendance est l'absence de dépendance**, ce qui signifie que vous devriez toujours préférer les compilations de langue aux paquets tiers.

### Optimiser les images

Selon l'archive [Http][], les images sont le [plus grand contributeur au poids du site][http archive report, image bytes]. Donc, si votre application inclut des images ou des icônes, assurez-vous de les optimiser !

Vous pouvez choisir entre plusieurs options manuelles ([GIMP][], [Photoshop][], [Squoosh][]) ou plugins pour vos outils de construction frontend favoris ([vite-imagetools][], [vite-plugin-imagemin][], [image-minimizer-webpack-plugin][]).

Notez que la bibliothèque `imagemin` la plupart des plugins utilisent est [officiellement non maintenue][imagemin is unmaintained].

#### Utiliser les formats d'image modernes

Des formats tels que `webp` ou `avif` offrent des réductions de taille de **jusqu'à 95 %** par rapport à jpeg tout en maintenant une excellente précision visuelle. Vous pouvez utiliser des outils tels que [Squoosh][] pour essayer différents formats sur vos images.

#### Taille des images en conséquence

Personne ne vous apprécie d'expédier l'image brute 6K avec votre application, alors assurez-vous de dimensionner votre image en conséquence. Les images qui apparaissent grandes à l'écran doivent être plus grandes que les images qui prennent moins d'espace sur l'écran.

#### Ne pas utiliser les images réactives

Dans un environnement Web, vous êtes censé utiliser [Images Responsives][] pour charger dynamiquement la taille d'image correcte pour chaque utilisateur. Comme vous ne distribuez pas les images de façon dynamique sur le web, l'utilisation d'images adaptatives ne fait que gonfler inutilement votre application avec des copies redondantes.

#### Supprimer les métadonnées

Les images qui ont été prises directement à partir d'un appareil photo ou du côté de la photo de stock incluent souvent des métadonnées sur l'appareil et le modèle de l'objectif ou le photographe. Non seulement ces octets sont perdus, mais les propriétés des métadonnées peuvent également contenir des informations potentiellement sensibles telles que l'heure, jour et emplacement de la photo.

### Supprimer les polices personnalisées inutiles

Envisagez de ne pas expédier des polices personnalisées avec votre application et de vous appuyer sur les polices système à la place. Si vous devez expédier des polices personnalisées, assurez-vous qu'elles sont dans des formats modernes et optimisés, tels que `woff2`.

Les polices peuvent être assez grandes, donc utiliser les polices déjà incluses dans le système d'exploitation réduit l'empreinte de votre application. Il évite également FOUT (Flash of Unstyled Text) et rend votre application plus "native" puisqu'elle utilise la même police que toutes les autres applications.

Si vous devez inclure des polices personnalisées, assurez-vous de les inclure dans des formats modernes tels que `woff2` car ceux-ci ont tendance à être beaucoup plus petits que les formats hérités.

Utilisez ce que l'on appelle les **"Pile de police système"** dans votre CSS. Il y a un certain nombre de de variantes, mais voici 3 basiques pour vous aider à démarrer :

**Sans Sans-Serif**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
  sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

**Serif**

```css
famille de police : Vieux style Iowan, Apple Garamond, Baskerville, Times New Roman, Droid
    Serif, Times, Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe
    Symbole d'UI ;
```

**Monoespace**

```css
font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation
    Mono, monospace;
```

### Configuration de la liste d'autorisations

Vous pouvez réduire la taille de votre application en n'activant que les fonctionnalités de l'API Tauri dont vous avez besoin dans la configuration de `allowlist`.

La configuration de la `liste d'autorisations` détermine les fonctionnalités de l'API à activer ; les fonctionnalités désactivées ne seront pas **compilées dans votre application**. C'est un moyen facile d'éliminer un peu plus de poids.

Un exemple d'un `tauri.conf.json typique`:

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
        "save": vrai
      }
    }
  }
}
```

### Optimisations de Rust Build-Time

Configurez votre projet cargo pour tirer parti des fonctionnalités d'optimisation de la taille de Rusts. [Pourquoi une rouille exécutable est-elle grande ?][] fournit une excellente explication de pourquoi cela importe et une passage en profondeur. En même temps, [Minimizing Rust Binary Binary Size][] est plus à jour et a quelques recommandations supplémentaires.

Rust est connu pour produire de gros binaires, mais vous pouvez demander au compilateur d'optimiser la taille de l'exécutable final.

Cargo expose plusieurs options qui déterminent comment le compilateur génère votre binaire. Les options "recommandées" pour les applications Tauri sont les suivantes :

```toml
[profile.release]
panic = "abort" # Éliminer la logique de nettoyage de panique coûteuse
codegen-units = 1 # Compiler les caisses l'une après l'autre pour que le compilateur puisse optimiser mieux
lto = true # Active le lien vers les optimisations
opt-level = "s" # Optimiser la taille du binaire
```

:::note
Il y a aussi `opt-level = "z"` disponible pour réduire la taille binaire résultante. `"s"` et `"z"` peuvent parfois être plus petits que l'autre, alors testez-le avec votre application !

Nous avons vu de plus petites tailles binaires de `"s"` pour les applications d'exemple Tauri, mais les applications réelles peuvent toujours être différentes.
:::

Pour une explication détaillée de chaque option et un tas plus, reportez-vous à la section [Profils de livres Cargo][cargo profiles].

#### Désactiver la compression des actifs de Tauri

Par défaut, Tauri utilise Brotli pour compresser les actifs dans le binaire final. Brotli intègre une grande table de recherche (~170KiB) pour obtenir de bons résultats, mais si les ressources que vous intégrez sont plus petites que cela ou si vous comprimez mal, le binaire qui en résulte peut être plus grand que n'importe quelle économie.

La compression peut être désactivée en définissant `par défaut` à `false` et en spécifiant tout sauf la caractéristique de `compression`:

```toml
[dependencies]
tauri = { version = "...", fonctionnalités = ["objc-exception", "wry"], default-features = false }
```

#### Compression de rouille instable

:::caution
Les suggestions suivantes sont toutes des fonctionnalités instables et nécessitent une chaîne de compilation nocturne. Consultez la documentation [Fonctionnalités instables][cargo unstable features] pour plus d'informations sur ce que cela implique.
:::

Les méthodes suivantes impliquent l'utilisation de fonctionnalités instables du compilateur et nécessitent la chaîne de compilation de rouille nightly . Si vous n'avez pas la chaîne de compilation nocturne + `roust-src` ajoutée, essayez ce qui suit :

```shell
rustup toolchain install nightly
rustup composant add rust-src --toolchain nightly
```

La bibliothèque Rust Standard est précompilée. Cela signifie que Rust est plus rapide à installer, mais aussi que le compilateur ne peut pas optimiser la bibliothèque standard. Vous pouvez appliquer les options d'optimisation pour le reste de vos dépendances binaires + au std avec un drapeau instable. Ce drapeau nécessite de spécifier votre cible, alors sachez que la cible triple que vous visez.

```shell
cargo +nightly build --release -Z build-std --target x86_64-unknown-linux-gnu
```

Si vous utilisez `panic = "abandon"` dans les optimisations de votre profil de publication, vous devez vous assurer que la caisse `panic_abort` est compilée avec std. De plus, une fonction std supplémentaire peut réduire davantage la taille du binaire. Ce qui suit s'applique aux deux :

```shell
cargo +nightly build --release -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort --target x86_64-unknown-linux-gnu
```

Voir la documentation instable pour plus de détails à propos de [`-Z build-std`][cargo build-std] et [`-Z build-std-features`][cargo build-std-features].

### Enlèvement

Utilisez des utilitaires de bande pour supprimer les symboles de débogage de votre application compilée.

Votre application compilée inclut ce que l'on appelle les "symboles de débogage" qui incluent les noms de fonctions et de variables. Vos utilisateurs finaux ne se soucieront probablement pas des symboles de débogage, donc c'est un moyen assez sûr pour enregistrer des octets!

La façon la plus simple est d'utiliser le célèbre utilitaire `strip` pour supprimer ces informations de débogage.

```shell
strip target/release/my_application
```

Consultez votre page de manuel locale `de la bande` pour plus d'informations et de drapeaux qui peuvent être utilisés pour spécifier quelles informations sont retirées du binaire.

:::info

Rust 1.59 a maintenant une version interne de `strip`! Il peut être activé en ajoutant les éléments suivants à votre `Cargo.toml`:

```toml
[profile.release]
strip = true # Supprimer automatiquement les symboles du binaire.
```

:::

### UPX

UPX, **Ultimate Packer pour eXecutables**, est un dinosaure parmi les binaires. Ce kit vieux de 23 ans, bien entretenu, est sous licence GPL-v2 avec une déclaration d'utilisation assez libérale. Notre compréhension de la licence est que vous pouvez l'utiliser à n'importe quelle fin (commerciale ou autre) sans avoir à modifier votre licence à moins que vous ne modifiiez le code source d'UPX.

Peut-être que votre public cible a un internet très lent, ou que votre application doit tenir sur une petite clé USB, et toutes les étapes ci-dessus n'ont pas permis de réaliser les économies dont vous avez besoin. Ne craignez pas, car nous avons un dernier tour dans nos manches :

[UPX][] compresse votre binaire et crée un exécutable auto-extractible qui se décompressera à l'exécution.

:::prudence
Vous devriez savoir que cette technique pourrait marquer votre binaire comme un virus sur Windows et macOS - donc utiliser à votre propre discrétion, et comme toujours, validez avec [Frida][] et faites des tests de distribution réels!
:::

#### Utilisation sur macOS

<!-- Add additional platforms -->

```
brew install upx
yarn tauri build
upx --ultra-brute src-tauri/target/release/bundle/macos/app. pp/Contents/macOS/app

                        Ultimate Packer for eXecutables
                            Copyright (C) 1996 - 2018
UPX 3. 5 Markus Oberhumer, Laszlo Molnar & John Reiser Aug 26th 2018

        Fichier format Ratio Format Name
    -------------------- ------ -----------
    963140 ->    274448 28. Application macho/amd64 0%
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
[Http]: https://httparchive.org
[http archive report, image bytes]: https://httparchive.org/reports/page-weight#bytesImg
[imagemin is unmaintained]: https://github.com/imagemin/imagemin/issues/385
[GIMP]: https://www.gimp.org
[Photoshop]: https://www.adobe.com/de/products/photoshop.html
[vite-imagetools]: https://github.com/JonasKruckenberg/imagetools
[vite-plugin-imagemin]: https://github.com/vbenjs/vite-plugin-imagemin
[image-minimizer-webpack-plugin]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin
[Squoosh]: https://squoosh.app
[Images Responsives]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
[Pourquoi une rouille exécutable est-elle grande ?]: https://lifthrasiir.github.io/rustlog/why-is-a-rust-executable-large.html
[Minimizing Rust Binary Binary Size]: https://github.com/johnthagen/min-sized-rust
[cargo unstable features]: https://doc.rust-lang.org/cargo/reference/unstable.html#unstable-features
[cargo profiles]: https://doc.rust-lang.org/cargo/reference/profiles.html
[cargo build-std]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std
[cargo build-std-features]: https://doc.rust-lang.org/cargo/reference/unstable.html#build-std-features
[Bundlephobia]: https://bundlephobia.com
[Frida]: https://frida.re/docs/home/
[UPX]: https://github.com/upx/upx
