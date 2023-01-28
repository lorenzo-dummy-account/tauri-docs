---
sidebar_position: 5
---

# Compilazione Cross-Platform

Tauri si basa pesantemente su librerie native e toolchains, quindi la cross-compilation significativa non è **possibile** al momento attuale. La prossima opzione migliore è quella di compilare utilizzando una pipeline CI/CD ospitata su qualcosa come [Azioni GitHub][], Gasdotti azuri, GitLab, o altre opzioni. La pipeline può eseguire la compilazione per ogni piattaforma contemporaneamente rendendo il processo di compilazione e rilascio molto più facile.

Per una facile installazione, attualmente forniamo [Tauri Action][], un'azione GitHub che viene eseguita su tutte le piattaforme supportate, compila il tuo software, genera gli artefatti necessari e li carica in una nuova versione di GitHub.

## Tauri GitHub Action

Tauri Action sfrutta le azioni di GitHub per costruire simultaneamente l'applicazione come binario nativo di Tauri per macOS, Linux, e Windows, e automatizza la creazione di una release GitHub.

Questa azione GitHub può anche essere utilizzata come pipeline di test per la tua app Tauri, garantire compilazione funziona bene su tutte le piattaforme per ogni pull request inviato, anche se non si desidera creare una nuova release.

:::info Firma Codice

Per configurare la firma del codice per Windows e macOS sul flusso di lavoro, segui la guida specifica per ogni piattaforma:

- [Firma di codice di Windows con azioni GitHub][]
- [firma codice macOS con azioni GitHub][]

:::

### Per Iniziare

Per configurare l'azione Tauri devi prima configurare un repository GitHub. È possibile utilizzare questa azione su un repo che non ha Tauri configurato dal momento che automaticamente inizializza Tauri prima di costruirlo e configurarlo per usare i tuoi artefatti.

Vai alla scheda Azioni sul tuo progetto GitHub e scegli "Nuovo flusso di lavoro", quindi scegli "Configura tu stesso un flusso di lavoro". Sostituire il file con l'esempio [Tauri Action build workflow][]. In alternativa, è possibile impostare il flusso di lavoro in base all'esempio [in fondo a questa pagina](#example-workflow)

### Configurazione

Puoi configurare Tauri con le opzioni `configPath`, `distPath` e `iconPath`. Vedi le azioni Readme per i dettagli.


<!-- FIXME: tauriScript is currently broken.
  Custom Tauri CLI scripts can be run with the `tauriScript` option. So instead of running `yarn tauri build` or `npx tauri build`, `${tauriScript}` will be executed. This can be useful when you need custom build functionality such as when creating Tauri apps e.g. a `desktop:build` script.
-->

Quando la tua app non è nella root del repo, usa l'input `projectPath`.

È possibile modificare il nome del flusso di lavoro, modificare i trigger, and add more steps as `npm run lint` or `npm run test`. La parte importante è che si mantiene la linea sottostante alla fine del flusso di lavoro, dal momento che questo esegue lo script di build e rilascia gli artefatti:

```yaml
- utilizzi: tauri-apps/tauri-action@v0
```

### Come attivare

Il flusso di lavoro di rilascio negli esempi README collegati sopra è innescato da pushes sul ramo "release". L'azione crea automaticamente un tag e un titolo per la versione di GitHub utilizzando la versione dell'applicazione specificata in `tauri.config.json`.

È inoltre possibile attivare il flusso di lavoro con il push di un tag di versione come "app-v0.7.0". Per questo è possibile modificare l'inizio del flusso di lavoro del rilascio:

```yaml
nome: publish
on:
  push:
    tags:
      - 'app-v*'
  workflow_dispatch:
```

### Esempio Di Workflow

Di seguito è riportato un flusso di lavoro di esempio che è stato impostato per eseguire ogni volta che viene creata una nuova versione su git.

Questo flusso di lavoro imposta l'ambiente su Windows, Ubuntu, e versioni più recenti di macOS. Nota sotto `jobs.release.strategy.matrix` l'array della piattaforma che contiene `macos-latest`, `ubuntu-20.04`, e `windows-latest`.

I passaggi che questo flusso di lavoro prende sono:

1. Acquista il repository usando `actions/checkout@v3`
2. Impostare Node LTS e una cache per i dati globali del pacchetto npm/yarn/pnpm utilizzando `actions/setup-node@v3`.
3. Imposta Rust e una cache per la cartella `target/` usando `dtolnay/rust-toolchain@stable` e `swatinem/rust-cache@v2`.
4. Installare tutte le dipendenze ed eseguire lo script di build (per l'app web).
5. Infine, utilizza `tauri-apps/tauri-action@v0` per eseguire `tauri build`, generare gli artefatti e creare la release di GitHub.

```yaml
nome: Rilascia
su:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  release:
    strategia:
      fail-fast: false
      matrice:
        piattaforma: [macos-latest, ubuntu-20. 4, windows-latest]
    runs-on: ${{ matrix.platform }}
    passi:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Install dependencies (solo ubuntu)
        if: matrix. latform == 'ubuntu-20.04'
        # È possibile rimuovere libayatana-appindicator3-dev se non si utilizza la funzione vassoio di sistema.
        run: <unk>
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4. -dev libayatana-appindicator3-dev librsvg2-dev

      - name: Rust setup
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        con:
          workspaces: '. src-tauri -> target'

      - name: Sync node version and setup cache
        uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'
          cache: 'yarn' # Impostare questo a npm, yarn o pnpm.

      - nome: Installa le dipendenze dell'app e crea web
        # Rimuovi `&& yarn build` se costruisci il tuo frontend in `beforeBuildCommand`
        esegui: yarn && yarn build # Cambialo in npm, yarn o pnpm.

      - name: Build the app
        uses: tauri-apps/tauri-action@v0

        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }} # This works only if your workflow trigger on new tags.
          Nome rilascio: 'Nome app v__VERSION__' # tauri-action sostituisce \_\_VERSION\_\_ con la versione dell'app.
          releaseBody: 'Vedi gli asset per scaricare e installare questa versione.'
          releaseDraft: true
          prerelease: false
```

### GitHub Environment Token

Il GitHub Token viene rilasciato automaticamente da GitHub per ogni workflow eseguito senza ulteriore configurazione, il che significa che non c'è rischio di perdita segreta. Questo token tuttavia ha solo i permessi di lettura per impostazione predefinita e si può ottenere un errore "Resource not accessible by integration" quando si esegue il flusso di lavoro. Se ciò accade, potrebbe essere necessario aggiungere i permessi di scrittura a questo token. Per fare questo vai alle impostazioni del tuo progetto GitHub, quindi seleziona Azioni, scorri verso il basso su "Permessi del flusso di lavoro" e seleziona "Autorizzazioni di lettura e scrittura".

È possibile vedere il GitHub Token essere passato al flusso di lavoro qui sotto:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Note Di Utilizzo

Assicurati di controllare la documentazione [per le Azioni GitHub][github actions] per capire meglio come funziona questo flusso di lavoro. Fai attenzione a leggere la documentazione [Limiti di utilizzo, fatturazione e amministrazione][usage limits billing and administration] per le azioni GitHub. Alcuni modelli di progetto possono già implementare questo flusso di lavoro di azione GitHub, come [tauri-svelte-template][]. È possibile utilizzare questa azione su un repo che non ha Tauri configurato. Tauri inizializza automaticamente prima di costruirlo e configurarlo per utilizzare i tuoi artefatti web.

[Tauri Action]: https://github.com/tauri-apps/tauri-action
[Tauri Action build workflow]: https://github.com/tauri-apps/tauri-action#creating-a-release-and-uploading-the-tauri-bundles
[Azioni GitHub]: https://docs.github.com/en/actions
[github actions]: https://docs.github.com/en/actions
[usage limits billing and administration]: https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration
[tauri-svelte-template]: https://github.com/probablykasper/tauri-svelte-template
[Firma di codice di Windows con azioni GitHub]: ../distribution/sign-windows.md#bonus-sign-your-application-with-github-actions
[firma codice macOS con azioni GitHub]: ../distribution/sign-macos.md#example
