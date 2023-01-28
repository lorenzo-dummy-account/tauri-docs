---
sidebar_position: 2
---

Importer la commande depuis '@theme/Command'

# Cycle de développement

### 1. Démarrez votre serveur Dev

Maintenant que vous avez tout configuré, vous devriez démarrer votre serveur de développement d'applications fourni par votre framework UI ou bundler (en supposant que vous en utilisiez un, bien sûr).

:::note

Chaque cadre a ses propres outils de développement. Il est hors de portée de ce document de les couvrir tous ou de rester à jour.
:::

### 2. Démarrer la fenêtre de développement de Tauri

<Command name="dev" />

La première fois que vous exécutez cette commande, le gestionnaire de paquets Rust prend plusieurs minutes pour télécharger et compiler tous les paquets nécessaires. Puisqu'ils sont mis en cache, les versions suivantes sont beaucoup plus rapides, car seul votre code a besoin d'être reconstruit.

Une fois la construction de Rust terminée, le webview s'ouvre, affichant votre application web. Vous pouvez apporter des modifications à votre application web, et si votre outil l'active, le webview devrait se mettre à jour automatiquement, tout comme un navigateur. Lorsque vous apportez des modifications à vos fichiers Rust ils sont reconstruits automatiquement, et votre application redémarre automatiquement.

:::info À propos de Cargo.toml et Contrôle Source

Dans votre dépôt de projet, vous DEVEZ valider le « src-tauri/Cargo.lock » avec le « src-tauri/Cargo.toml » pour git car Cargo utilise le fichier de verrouillage pour fournir des constructions déterministes. Par conséquent, il est recommandé que toutes les applications vérifient dans leur Cargo.lock. Vous NE DEVEZ PAS livrer le dossier "src-tauri/target" ou son contenu.

:::
