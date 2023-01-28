---
sidebar_position: 1
---

Importer la commande depuis '@theme/Command'

# Publication de l'application

### 1. Construisez votre application Web

Maintenant que vous êtes prêt à empaqueter votre projet, vous devez exécuter la commande de build de vos frameworks ou bundler (en supposant que vous en utilisiez une, bien sûr).

:::note

Chaque framework a son outil de publication. Il est hors de portée de ce document de les traiter tous ou de les tenir à jour.

:::

### 2. Bundle votre application avec Tauri

<Command name="build" />

Cette commande intègre vos ressources web en un seul binaire avec votre code Rust . Le binaire lui-même sera situé dans `src-tauri/target/release/[nom de l'application]`et les installateurs seront situés dans `src-tauri/target/release/bundle/`.

Comme la commande `tauri dev` , la première fois que vous exécutez ceci, il faut un peu de temps pour collecter les caisses Rust et tout construire - mais lors des exécutions suivantes, il suffit de reconstruire le code de votre application, ce qui est beaucoup plus rapide.
