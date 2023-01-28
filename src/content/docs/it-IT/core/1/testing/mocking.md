# Mocking Tauri APIs

Quando si scrivono i test del fronten, avere un ambiente "falso" Tauri per simulare le finestre o intercettare le chiamate IPC è comune, il cosiddetto _beffardo_. Il modulo [`@tauri-apps/api/mocks`][] fornisce alcuni strumenti utili per rendere questo più facile per te:

:::cautela

Ricordati di cancellare i mocks dopo ogni esecuzione di test per annullare le modifiche allo stato fittizio tra le esecuzioni! Vedere [`clearMocks()`][] docs per ulteriori informazioni.

:::

## Richieste IPC

Più comunemente, si desidera intercettare le richieste IPC; questo può essere utile in una varietà di situazioni:

- Assicurarsi che le chiamate di backend corrette siano effettuate
- Simula risultati diversi dalle funzioni di backend

Tauri fornisce la funzione mockIPC per intercettare le richieste IPC. Puoi trovare ulteriori dettagli sull'API specifica [qui][<code>mockipc()</code>].

:::note
I seguenti esempi usano [Vitest][], ma puoi usare qualsiasi altra libreria di test frontend come jest.
:::

```js
import { beforeAll, expect, test } from "vitest";
import { randomFillSync } from "crypto";

import { mockIPC } from "@tauri-apps/api/mocks"
import { invoke } from "@tauri-apps/api/tauri";

// jsdom non viene fornito con un'implementazione WebCrypto
beforeAll(() => {
  //@ts-ignore
  window. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer);
    },
  };
});


test("invoke simple", async () => {
    mockIPC((cmd, args) => {
        // comando di rust simulato chiamato "add" che aggiunge solo due numeri
        if(cmd === "add") {
           return (args. come numero) + (args. come numero)
        }
    })

    expect(invoke("add", { a: 12, b: 15 })). esolves.toBe(27)
})
```

A volte vuoi tracciare ulteriori informazioni su una chiamata IPC; quante volte è stato invocato il comando? È stato invocato affatto? È possibile utilizzare [`mockIPC()`][] con altri strumenti di spionaggio e scherzo per testare questo:

```js
import { beforeAll, expect, test, vi } from "vitest";
import { randomFillSync } from "crypto";

import { mockIPC } from "@tauri-apps/api/mocks"
import { invoke } from "@tauri-apps/api/tauri";

// jsdom non viene fornito con un'implementazione WebCrypto
beforeAll(() => {
  //@ts-ignore
  window. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer);
    },
  };
});


test("invoke", async () => {
    mockIPC((cmd, args) => {
        // comando di rust simulato chiamato "add" che aggiunge solo due numeri
        if(cmd === "add") {
           return (args. come numero) + (args. come numero)
        }
    })

    // possiamo utilizzare gli strumenti di spionaggio forniti da vitest per tracciare la funzione beffata
    const spy = vi. pyOn(finestra, "__TAURI_IPC__")

    expect(invoke("add", { a: 12, b: 15 })).resolves.toBe(27)
    expect(spy).toHaveBeenCalled()
})
```

Per simulare le richieste IPC a un comando sidecar o shell è necessario catturare l'ID del gestore eventi quando `spawn()` o `execute()` è chiamato e utilizzare questo ID per emettere eventi che il backend invierebbe:

```js
mockIPC(async (cmd, args) => {
  if (args.message. md === 'execute') {
    const eventCallbackId = `_${args.message.onEventFn}`;
    const eventEmitter = window[eventCallbackId];

    // L'evento 'Stdout' può essere chiamato più volte
    eventEmitter({
      event: 'Stdout',
      payload: 'some data sent from the process',
    });

    // L'evento 'Terminato' deve essere chiamato alla fine per risolvere la promessa
    eventEmitter({
      evento: 'Terminato',
      carico utile: {
        code: 0,
        signal: 'kill',
      },
    });
  }
});
```

## Finestre

A volte si dispone di un codice specifico per la finestra (una finestra della schermata iniziale, per esempio), quindi è necessario simulare diverse finestre. È possibile utilizzare il metodo [`mockWindows()`][] per creare etichette finte finestra. La prima stringa identifica la finestra "corrente" (cioè la finestra in cui il tuo JavaScript si crede), e tutte le altre stringhe sono trattate come finestre aggiuntive.

:::note

[`mockWindows()`][] falsa solo l'esistenza di finestre ma nessuna proprietà di finestra. Per simulare le proprietà della finestra, è necessario intercettare le chiamate corrette utilizzando [`mockIPC()`][]

:::

```js
import { beforeAll, expect, test } from 'vitest'
import { randomFillSync } from 'crypto'

import { mockWindows } from '@tauri-apps/api/mocks'

// jsdom doesn't comes with a WebCrypto implementation
beforeAll(() => {
  //@ts-ignore
  window. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer)
    },
  }
})

test('invoke', async () => {
  mockWindows('main', 'second', 'third')

  const { getCurrent, getAll } = await import('@tauri-apps/api/window')

  expect(getCurrent()). oHaveProperty('label', 'main')
  expect(getAll().map((w) => w.label)).toEqual(['main', 'second', 'third'])
})
```

[`@tauri-apps/api/mocks`]: ../../api/js/mocks.md
[<code>mockipc()</code>]: ../../api/js/mocks.md#mockipc
[`mockIPC()`]: ../../api/js/mocks.md#mockipc
[`mockWindows()`]: ../../api/js/mocks.md#mockwindows
[`clearMocks()`]: ../../api/js/mocks.md#clearmocks
[Vitest]: https://vitest.dev
