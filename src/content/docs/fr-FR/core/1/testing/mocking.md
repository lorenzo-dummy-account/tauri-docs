# Mocking Tauri APIs

Lors de l'écriture de vos tests de frontend, avoir un "faux" environnement Tauri pour simuler des fenêtres ou intercepter des appels IPC est courant, ce qu'on appelle _le bouchonnage_. Le module [`@tauri-apps/api/mocks`][] fournit des outils utiles pour vous faciliter la tâche :

:::prudence

N'oubliez pas d'effacer les bouchons après chaque exécution de test pour annuler les changements d'état de bouchon entre les exécutions ! Voir la documentation de [`clearMocks()`][] pour plus d'informations.

:::

## Demandes IPC

Le plus souvent, vous voulez intercepter les requêtes IPC ; cela peut être utile dans une variété de situations :

- S'assurer que les bons appels de backend sont faits
- Simuler différents résultats des fonctions backend

Tauri fournit la fonction mockIPC pour intercepter les requêtes IPC. Vous pouvez en trouver plus sur l'API spécifique en détail [ici][<code>mockipc()</code>].

:::note
Les exemples suivants utilisent [Vitest][], mais vous pouvez utiliser n'importe quelle autre bibliothèque de test frontend comme jest.
:::

```js
importer { beforeAll, expect, test } depuis "vitest";
importer { randomFillSync } depuis "crypto";

importer { mockIPC } depuis "@tauri-apps/api/mocks"
importer { invoke } depuis "@tauri-apps/api/tauri";

// jsdom ne vient pas avec une implémentation WebCrypto
beforeAll(() => {
  //@ts-ignore
  fenêtre. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer);
    },
  };
});


test("invoke simple", async () => {
    mockIPC((cmd, args) => {
        // commande de rouille simulée appelée "add" qui ajoute juste deux nombres
        if(cmd === "add") {
           return (args. comme nombre) + (args. comme nombre)
        }
    })

    attes(invoque("ajouter", { a: 12, b: 15 })). esolves.toBe(27)
})
```

Parfois, vous voulez suivre plus d'informations sur un appel IPC ; combien de fois la commande a-t-elle été invoquée ? Avait-il été invoqué ? Vous pouvez utiliser [`mockIPC()`][] avec d'autres outils d'espionnage et de bouchonnage pour tester ceci :

```js
importer { beforeAll, expect, test, vi } de "vitest";
importer { randomFillSync } de "crypto";

importer { mockIPC } depuis "@tauri-apps/api/mocks"
importer { invoke } depuis "@tauri-apps/api/tauri";

// jsdom ne vient pas avec une implémentation WebCrypto
beforeAll(() => {
  //@ts-ignore
  fenêtre. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer);
    },
  };
});


test("invoke", async () => {
    mockIPC((cmd, args) => {
        // commande simulée appelée "add" qui ajoute juste deux nombres
        if(cmd === "add") {
           return (args. comme nombre) + (args. as number)
        }
    })

    // nous pouvons utiliser les outils d'espionnage fournis par vitest pour suivre la fonction fantaisie
    const spy = vi. pyOn(window, "__TAURI_IPC__")

    expect(invoke("add", { a: 12, b: 15 })).resolves.toBe(27)
    expect(spy).toHaveBeenCalled()
})
```

Pour simuler les requêtes IPC à une commande latérale ou shell, vous devez saisir l'ID du gestionnaire d'événements lorsque `spawn()` ou `execute()` est appelé et utiliser cet ID pour émettre des événements que le backend enverrait :

```js
mockIPC(async (cmd, args) => {
  if (args.message. md === 'execute') {
    const eventCallbackId = `_${args.message.onEventFn}`;
    const eventEmitter = window[eventCallbackId];

    // L'événement 'Stdout' peut être appelé plusieurs fois
    eventEmitter({
      event: 'Stdout',
      payload: 'some data sent from the process',
    });

    // L'événement 'Terminé' doit être appelé à la fin pour résoudre la promesse
    eventEmitter({
      event: 'Terminated',
      payload : {
        code: 0,
        signal: 'kill',
      },
    });
  }
});
```

## Fenêtres

Parfois, vous avez un code spécifique à la fenêtre (une fenêtre d'écran de démarrage, par exemple), donc vous devez simuler différentes fenêtres. Vous pouvez utiliser la méthode [`mockWindows()`][] pour créer de fausses étiquettes de fenêtres. La première chaîne identifie la fenêtre "courant" (c'est-à-dire la fenêtre dans laquelle votre JavaScript croit), et toutes les autres chaînes de caractères sont traitées comme des fenêtres supplémentaires.

:::note

[`mockWindows()`][] ne fait que fausser l'existence de fenêtres mais pas de propriétés de fenêtre. Pour simuler les propriétés de fenêtre, vous devez intercepter les bons appels en utilisant [`mockIPC()`][]

:::

```js
import { beforeAll, expect, test } from 'vitest'
import { randomFillSync } from 'crypto'

import { mockWindows } from '@tauri-apps/api/mocks'

// jsdom doesn't come with a WebCrypto implementation
beforeAll(() => {
  //@ts-ignore
  window. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer)
    },
  }
})

test('invoque', async () => {
  mockWindows('main', 'seconde', 'troisième')

  const { getCurrent, getAll } = wait import('@tauri-apps/api/window')

  expect(getCurrent()). oHaveProperty('label', 'main')
  expect(getAll().map((w) => w.label)).toEqual(['main', 'seconde', 'troisième'])
})
```

[`@tauri-apps/api/mocks`]: ../../api/js/mocks.md
[<code>mockipc()</code>]: ../../api/js/mocks.md#mockipc
[`mockIPC()`]: ../../api/js/mocks.md#mockipc
[`mockWindows()`]: ../../api/js/mocks.md#mockwindows
[`clearMocks()`]: ../../api/js/mocks.md#clearmocks
[Vitest]: https://vitest.dev
