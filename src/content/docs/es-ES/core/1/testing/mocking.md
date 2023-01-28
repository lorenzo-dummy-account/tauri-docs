# Mocking Tauri APIs

Al escribir las pruebas de tu frontend es común tener un entorno "fake" Tauri para simular las llamadas de Windows o interceptar las llamadas IPC, llamado _mocking_. El módulo [`@tauri-apps/api/mocks`][] proporciona algunas herramientas útiles para hacerle esto más fácil:

:::precaución

¡Recuerde borrar las simulaciones después de cada ejecución de prueba para deshacer los cambios de estado simulados entre ejecuciones! Vea [`clearMocks()`][] documentos para más información.

:::

## Solicitudes IPC

Lo más común es interceptar las solicitudes IPC; esto puede ser útil en una variedad de situaciones:

- Asegúrate de que las llamadas de backend sean correctas
- Simular diferentes resultados de las funciones del backend

Tauri proporciona la función mockIPC para interceptar las solicitudes IPC. Puede encontrar más información sobre la API específica en detalle [aquí][<code>mockipc()</code>].

:::note
Los siguientes ejemplos usan [Vitest][], pero puedes usar cualquier otra biblioteca de pruebas de frontend como jest.
:::

```js
importar { beforeAll, expect, test } desde "vitest";
importar { randomFillSync } desde "crypto";

importar { mockIPC } desde "@tauri-apps/api/mocks"
importar { invoke } desde "@tauri-apps/api/tauri";

// jsdom no viene con una implementación WebCrypto
beforeAll(() => {
  //@ts-ignore
  ventana. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer);
    },
  };
});


test("invoke simple", async () => {
    mockIPC((cmd, args) => {
        // comando de rust simulado llamado "add" que sólo añade dos números
        if(cmd === "add") {
           return (args. como número) + (args. como número)
        }
    })

    expect(invoke("add", { a: 12, b: 15 })). esolves.toBe(27)
})
```

A veces quieres rastrear más información acerca de una llamada IPC; ¿cuántas veces se ha invocado el comando? ¿Se invocó en absoluto? Puedes usar [`mockIPC()`][] con otras herramientas de espionaje y simulación para probar esto:

```js
importar { beforeAll, expect, test, vi } from "vitest";
importar { randomFillSync } de "crypto";

importar { mockIPC } desde "@tauri-apps/api/mocks"
importar { invoke } desde "@tauri-apps/api/tauri";

// jsdom no viene con una implementación WebCrypto
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
        // comando de rust simulado llamado "add" que sólo añade dos números
        if(cmd === "add") {
           return (args. como número) + (args. as number)
        }
    })

    // podemos usar las herramientas de espionaje proporcionadas por vitest para seguir la función simulada
    const spy = vi. pyOn(window, "__TAURI_IPC__")

    expect(invoke("add", { a: 12, b: 15 })).resolves.toBe(27)
    expect(spy).toHaveBeenCalled()
})
```

Para simular las solicitudes IPC a un comando sidecar o shell necesitas obtener el ID del controlador de eventos cuando `spawn()` o `execute()` es llamado y usa este ID para emitir eventos que el backend enviaría:

```js
mockIPC(async (cmd, args) => {
  if (args.message. md === 'execute') {
    const eventCallbackId = `_${args.message.onEventFn}`;
    const eventEmitter = window[eventCallbackId];

    // El evento 'Stdout' puede llamarse varias veces
    eventEmitter({
      event: 'Stdout',
      payload: 'some data sent from the process',
    });

    // El evento 'Terminado' debe ser llamado al final para resolver la promesa
    eventEmitter({
      event: 'Terminated',
      payload: {
        code: 0,
        signal: 'kill',
      },
    });
  }
});
```

## Ventanas

A veces tiene un código específico de ventana (una ventana de pantalla de splash, por ejemplo), así que necesita simular diferentes ventanas. Puede utilizar el método [`mockWindows()`][] para crear etiquetas de ventana falsas. La primera cadena identifica la ventana "actual" (es decir, la ventana en la que su JavaScript cree a sí mismo), y todas las demás cadenas son tratadas como ventanas adicionales.

:::note

[`mockWindows()`][] sólo hace falso la existencia de ventanas pero no tiene propiedades de ventana. Para simular las propiedades de la ventana, necesita interceptar las llamadas correctas usando [`mockIPC()`][]

:::

```js
importar { beforeAll, expect, test } desde 'vitest'
importar { randomFillSync } desde 'crypto'

importar { mockWindows } desde '@tauri-apps/api/mocks'

// jsdom no viene con una implementación WebCrypto
beforeAll(() => {
  //@ts-ignore
  window. rypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer)
    },
  }
})

test('invocar', async () => {
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
