importa comando da '@theme/Command'

# Debug Applicazione

Con tutti i pezzi in movimento in Tauri, si può correre in un problema che richiede il debug. Ci sono molte posizioni in cui vengono stampati i dettagli degli errori e Tauri include alcuni strumenti per rendere il processo di debug più semplice.

## Console Di Ruggine

Il primo posto per cercare errori è nella console Rust Console. Questo è nel terminale dove hai eseguito, ad esempio, `tauri dev`. È possibile utilizzare il seguente codice per stampare qualcosa su quella console all'interno di un file Rust:

```rust
println!("Messaggio da Rust: {}", msg);
```

A volte potresti avere un errore nel tuo codice Rust e il compilatore Rust può darti un sacco di informazioni. Se, per esempio, `tauri dev` si blocca, è possibile riavviare come questo su Linux e macOS:

```shell
RUST_BACKTRACE=1 tauri dev
```

o come questo su Windows:

```shell
set RUST_BACKTRACE=1
tauri dev
```

Questo comando ti dà una traccia di pila granulare. In generale, il compilatore Rust ti aiuta fornendoti informazioni dettagliate sul problema, come:

```
error[E0425]: cannot find value `sun` in this scope
  --> src/main. s:11:5
   <unk>
11 <unk> sun += i.to_string().parse::<u64>(). nwrap();
   <unk> ^^^ help: esiste una variabile locale con un nome simile: `sum`

errore: interruzione a causa di un errore precedente

Per ulteriori informazioni su questo errore, prova `rustc --explain E0425`.
```

## WebView Console

Fare clic con il tasto destro del mouse nella WebView, e scegliere `Ispeziona elemento`. Questo apre un web-inspector simile a Chrome o Firefox dev strumenti che si sono abituati a. È inoltre possibile utilizzare la scorciatoia `Ctrl + Shift + i` su Linux e Windows, e `Comando + Opzione + i` su macOS per aprire l'ispettore.

L'ispettore è specifico alla piattaforma, rendendo il webkit2gtk WebInspector su Linux, l'ispettore di Safari su macOS e Microsoft Edge DevTools su Windows.

### Aprire Programmaticamente Devtools

È possibile controllare la visibilità della finestra dell'ispettore utilizzando le funzioni [`Window::open_devtools`][] e [`Window::close_devtools`][]:

```rust
use tauri::Manager;
tauri::Builder::default()
  . etup(<unk> app<unk> {
    #[cfg(debug_assertions)] // include solo questo codice sulle build di debug
    {
      let window = app. et_window("main").unwrap();
      window.open_devtools();
      finestra. lose_devtools();
    }
    Ok())
});
```

### Utilizzo dell'ispettore nella produzione

Per impostazione predefinita, l'inspector è abilitato solo nelle build di sviluppo e debug a meno che non lo abiliti con una funzione Cargo.

#### Crea una Build di Debug

Per creare una build di debug, esegui il comando `tauri build --debug`.

<Command name="build --debug" />

Come i normali processi di build e dev, la costruzione richiede un certo tempo la prima volta che si esegue questo comando, ma è significativamente più veloce nelle successive esecuzioni. L'app completa in bundle ha la console di sviluppo abilitata ed è posizionata in `src-tauri/target/debug/bundle`.

È inoltre possibile eseguire un'app costruita dal terminale, ti dà le note del compilatore Rust (in caso di errori) o i tuoi messaggi `println`. Sfoglia il file `src-tauri/target/(release<unk> debug)/[nome app]` ed eseguilo direttamente nella tua console o fai doppio clic sull'eseguibile stesso nel filesystem (nota: la console chiude gli errori con questo metodo).

#### Abilita Funzione Devtools

:::warning

L'API devtools è privata su macOS. L'utilizzo di API private su macOS impedisce che l'applicazione venga accettata nell'App Store.

:::

Per abilitare i devtools nelle build di produzione, è necessario abilitare la funzione `devtools` Cargo nel file `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "...", features = ["...", "devtools"] }
```

## Debugging the Core Process

Il processo Core è alimentato da Rust in modo da poter utilizzare GDB o LLDB per il debug. È possibile seguire la guida [Debugging in VS Code][] per imparare a utilizzare l'estensione del codice VS LLDB per debug del processo Core delle applicazioni Tauri.

[Debugging in VS Code]: ./vs-code.md
[`Window::open_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.open_devtools
[`Window::close_devtools`]: https://docs.rs/tauri/1/tauri/window/struct.Window.html#method.close_devtools
