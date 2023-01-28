Importer la commande depuis '@theme/Command'

# En-tête temporaire pour corriger le rendu

<!-- The above heading is here because fragments aren't really supported in the context of Astro Content Collections -->

Pour compiler et regrouper votre application Tauri en un seul exécutable, exécutez simplement la commande suivante :

<Command name="build" />

Il construira votre interface (si configuré, voir [`beforeBuildCommand`][beforebuildcommand]), compilera le binaire Rust collecter tous les binaires et ressources externes et enfin produire des paquets et des installateurs propres à la plate-forme.

[beforebuildcommand]: ../../api/config.md#buildconfig.beforebuildcommand
