---
sidebar_position: 1
title: Introduction
---

:::prudence Actuellement en pré-alpha
Le support du pilote web pour Tauri est toujours en pré-alpha. L'outil qui lui est dédié, comme [tauri-driver][], est toujours en développement actif et peut changer si nécessaire au fil du temps. De plus, seuls Windows et Linux sont actuellement pris en charge.
:::

[WebDriver][] est une interface standardisée pour interagir avec des documents web principalement destinés à des tests automatisés. Tauri prend en charge l'interface [WebDriver][] en exploitant le serveur [WebDriver][] de la plateforme native sous un wrapper multi-plateforme [`tauri-driver`][].

## Dépendances système

Installez la dernière [`tauri-driver`][] ou mettez à jour une installation existante en exécutant :

```shell
cargaison installer tauri-driver
```

Parce que nous utilisons actuellement le serveur natif [WebDriver][] de la plate-forme, il y a certaines exigences pour exécuter [`tauri-driver`][] sur les plates-formes supportées. La prise en charge de la plate-forme est actuellement limitée à Linux et Windows.

### Linux

Nous utilisons `WebKitWebDriver` sur les plates-formes Linux. Vérifie si ce binaire existe déjà (commande `que WebKitWebDriver`) comme certaines distributions l'empaquetent avec le paquet WebKit normal. Les autres plates-formes peuvent avoir un paquet séparé pour eux, comme comme `webkit2gtk-driver` sur des distributions basées sur Debian.

### Fenêtres

Assurez-vous de saisir la version de [Microsoft Edge Driver][] qui correspond à la version de votre Windows Edge sur laquelle l'application est en cours de construction et de test. Cela devrait presque toujours être la dernière version stable sur les installations Windows à jour. Si les deux versions ne correspondent pas, vous pouvez rencontrer votre suite de test WebDriver suspendue en essayant de vous connecter.

Le téléchargement contient un binaire appelé `msedgedriver.exe`. [`tauri-driver`][] looks for that binary in the `$PATH` so make sure it's either available on the path or use the `--native-driver` option on [`tauri-driver`][]. Vous pouvez télécharger ce fichier automatiquement dans le cadre du processus de configuration CI pour vous assurer que le fichier Edge et les versions Edge Driver restent synchronisées sur les machines Windows CI. Un guide sur la façon de le faire peut être ajouté à une date ultérieure.

## Exemple d'application

La section [suivante](example/setup) du guide montre étape par étape comment créer un exemple minimal d'application testée avec WebDriver.

Si vous préférez voir le résultat du guide et regarder sur une base de code minimale terminée qui l'utilise, vous pouvez regarder https://github. om/chippers/hello_tauri. Cet exemple est également fourni avec un script CI pour tester avec les actions de GitHub , mais vous pouvez toujours être intéressé par le guide [WebDriver CI](ci) car il explique le concept un peu plus.

[WebDriver]: https://www.w3.org/TR/webdriver/
[`tauri-driver`]: https://crates.io/crates/tauri-driver
[tauri-driver]: https://crates.io/crates/tauri-driver
[Microsoft Edge Driver]: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
