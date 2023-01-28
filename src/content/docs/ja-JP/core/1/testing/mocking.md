# Mocking Tauri APIs

フロントエンドのテストを書くとき、Windowsをシミュレートするための「偽の」牡牛座環境やIPC呼び出しを傍受することが一般的で、いわゆる _モック_ が一般的です。 [`@tauri-apps/api/moks`][] モジュールはこれを簡単にするための便利なツールを提供します。

:::注意

実行間のモック状態の変更を元に戻すには、テスト実行後にモックをクリアすることを忘れないでください! 詳細は [`clearMocks()`][] ドキュメントを参照してください。

:::

## IPCリクエスト

最も一般的には、IPC要求を傍受する必要があります。これは、以下のような状況で役立ちます。

- 正しいバックエンド通話が行われていることを確認します
- バックエンド関数の異なる結果をシミュレートする

牡牛座はIPCリクエストを傍受するためのモックIPC機能を提供します。 特定の API の詳細については、 [ここ][<code>mockipc()</code>] を参照してください。

:::note
以下の例は [Vitest][]を使用しますが、jestのような他のフロントエンドテストライブラリを使用できます。
:::

```js
import { beforeAll, expect, test } from "vitest";
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


test("invoke simple", async () => {
    mockIPC((cmd, args) => {
        // simulated rust command called "add" that just adds two numbers
        if(cmd === "add") {
           return (args.a as number) + (args.b as number)
        }
    })

    expect(invoke("add", { a: 12, b: 15 })).resolves.toBe(27)
})
```

IPC呼び出しの詳細を追跡したい場合もあります。このコマンドは何回実行されましたか? それは全く呼び出されたのでしょうか? [`mockIPC()`][] を他のスパイやモックツールと一緒に使ってテストできます。

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

サイドカーまたはシェルコマンドへのIPCリクエストをモックするには、 `spawn()` または `execute()` が呼び出されたときにイベントハンドラのIDを取得し、バックエンドが返送するイベントを発行するためにこの ID を使用する必要があります。

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

## Windows

ウィンドウ固有のコード(例えばスプラッシュスクリーンウィンドウ)がある場合があるので、別のウィンドウをシミュレートする必要があります。 [`mockWindows()`][] メソッドを使用して偽のウィンドウラベルを作成できます。 最初の文字列は「現在」ウィンドウ(つまり、JavaScript が信じているウィンドウ)を識別し、その他の文字列はすべて追加のウィンドウとして扱われます。

:::note

[`mockWindows()`][] は windows の存在を偽造するだけで、window プロパティはありません。 ウィンドウプロパティをシミュレートするには、 [`mockIPC()`][] を使用して正しい呼び出しを傍受する必要があります。

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

[`@tauri-apps/api/moks`]: ../../api/js/mocks.md
[<code>mockipc()</code>]: ../../api/js/mocks.md#mockipc
[`mockIPC()`]: ../../api/js/mocks.md#mockipc
[`mockWindows()`]: ../../api/js/mocks.md#mockwindows
[`clearMocks()`]: ../../api/js/mocks.md#clearmocks
[Vitest]: https://vitest.dev
