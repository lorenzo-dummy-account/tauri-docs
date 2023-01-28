# Mocking Tauri APIs

在编写您的前端测试时，您有一个“假的”Tauri环境来模拟窗口或拦截IPC通话是常见的，即所谓的 _嘲弄_。 [`@tauri-apps/api/mocks`][] 模块提供一些有用的工具，使您更容易：

:::注意事项

在每次测试运行后清理模型以撤消运行之间的模拟状态变化！ 请参阅 [`clearMocks()`][] 文档以获取更多信息。

:::

## IPC 请求

最常见的情况是，你想要拦截IPC请求；这在各种情况下都会有所帮助：

- 确保正确的后端呼叫
- 模拟来自后端函数的不同结果

Tauri 提供模型IPC 函数来拦截IPC 请求。 您可以找到更多关于指定的 API 的详细信息 [这里][<code>mockipc()</code>]

:::note
以下示例使用 [Vitest][], 但你可以使用任何其他的前端测试库, 例如jest。
:::

```js
从 "vitest"导入 { beforeAll, expect, test } ；
从 "crypto"导入 { randomFillSync } ；

从 "@tauri-apps/api/mocks" 导入 { mockIPC }
从 "@tauri-apps/api/tauri" 导入 { invoke } ；

// jsdoes not with a WebCrypto implement
before-All() => *
  /@ts-with
  window. rypto = □
    getRandomValues: function (buffer) }
      return randomFillSync(缓冲)；
    },
  };
});


test("calling simple", async () => }
    mockIPC(cmd, args) => P,
        // simplated rust 命令 "add" 只是增加两个数字
        if(cmd === "add") Power
           return (args. 编号) + (args)。 如数)
        }
    })

    exped(invoquke("add", { a: 12, b: 15 })。 esolves.toBe(27)
})
```

您有时想要跟踪更多关于 IPC 通话的信息；所引用的命令有多少次？ 它是否被援引？ 您可以使用 [`mockIPC()`][] 和其他间谍和嘲弄工具来测试这个：

```js
import { beforeAll, expect, test, vi } from "vitest";
import { randomFillSync } from "crypto";

import { mockIPC } from "@tauri-apps/api/mocks"
import { invoke } from "@tauri-apps/api/tauri";

// jsdom doesn't come with a WebCrypto implementation
beforeAll(() => {
  //@ts-ignore
  window.crypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer);
    },
  };
});


test("invoke", async () => {
    mockIPC((cmd, args) => {
        // simulated rust command called "add" that just adds two numbers
        if(cmd === "add") {
           return (args.a as number) + (args.b as number)
        }
    })

    // we can use the spying tools provided by vitest to track the mocked function
    const spy = vi.spyOn(window, "__TAURI_IPC__")

    expect(invoke("add", { a: 12, b: 15 })).resolves.toBe(27)
    expect(spy).toHaveBeenCalled()
})
```

要模拟IPC 请求到 sidecar 或 shell 命令时，当 `spawn()` or `execute()` 被调用时，您需要抓取事件处理程序的 ID。</code> 被调用来释放后端会发送的事件：

```js
mockIPC(async (cmd, args) => {
  if (args.message.cmd === 'execute') {
    const eventCallbackId = `_${args.message.onEventFn}`;
    const eventEmitter = window[eventCallbackId];

    // 'Stdout' event can be called multiple times
    eventEmitter({
      event: 'Stdout',
      payload: 'some data sent from the process',
    });

    // 'Terminated' event must be called at the end to resolve the promise
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

## 窗口

有时您有针对窗口的代码 (例如，初始屏幕窗口)，所以您需要模拟不同的窗口。 您可以使用 [`mockWindows()`][] 方法来创建假窗口标签。 第一个字符串识别了“当前”窗口(即你的 JavaScript 自信的窗口)，所有其他字符串都被当作附加窗口处理。

:::note

[`mockWindows()`][] 只提供窗口存在，但没有窗口属性。 要模拟窗口属性，您需要使用 [`mockIPC()`][] 拦截正确的来电

:::

```js
import { beforeAll, expect, test } from 'vitest'
import { randomFillSync } from 'crypto'

import { mockWindows } from '@tauri-apps/api/mocks'

// jsdom doesn't come with a WebCrypto implementation
beforeAll(() => {
  //@ts-ignore
  window.crypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer)
    },
  }
})

test('invoke', async () => {
  mockWindows('main', 'second', 'third')

  const { getCurrent, getAll } = await import('@tauri-apps/api/window')

  expect(getCurrent()).toHaveProperty('label', 'main')
  expect(getAll().map((w) => w.label)).toEqual(['main', 'second', 'third'])
})
```

[`@tauri-apps/api/mocks`]: ../../api/js/mocks.md
[<code>mockipc()</code>]: ../../api/js/mocks.md#mockipc
[`mockIPC()`]: ../../api/js/mocks.md#mockipc
[`mockWindows()`]: ../../api/js/mocks.md#mockwindows
[`clearMocks()`]: ../../api/js/mocks.md#clearmocks
[Vitest]: https://vitest.dev
