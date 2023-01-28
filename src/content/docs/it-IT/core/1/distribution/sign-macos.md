---
sidebar_label: firma codice macOS
sidebar_position: 4
---

# Code Signing macOS Applications

Questa guida fornisce informazioni sulla firma del codice e la notarizzazione per le applicazioni macOS.

:::note

Se non si utilizzano le azioni GitHub per eseguire build di OSX DMG, è necessario assicurarsi che la variabile di ambiente <i>CI=true</i> esista. Per ulteriori informazioni consultare [tauri-apps/tauri#592][].

:::

## Requisiti

- macOS 10.13.6 o più tardi
- Xcode 10 o versioni successive
- Un account Apple Developer iscritto al [Programma Apple Developer][]

Per maggiori dettagli si prega di leggere l'articolo dello sviluppatore su [notarizzazione del software macOS prima della distribuzione][].

## tl;dr

Il processo di firma e notarizzazione del codice Tauri è configurato attraverso le seguenti variabili di ambiente:

- `APPLE_SIGNING_IDENTITY`: il nome della voce del portachiavi che contiene il certificato di firma.
- `APPLE_CERTIFICATE`: stringa base64 del certificato `.p12` , esportata dal portachiavi. Utile se non hai il certificato sul portachiavi (ad es. macchine CI).
- `APPLE_CERTIFICATE_PASSWORD`: la password per il certificato `.p12`.
- `APPLE_ID` and `APPLE_PASSWORD`: il tuo account Apple email e una [password specifica per app][]. Richiesto solo per notarizzare l'app.
- `APPLE_API_ISSUER` e `APPLE_API_KEY`: autenticazione con una chiave API App Store Connect invece dell'ID Apple. Richiesto solo se si notarizza l'app.
- `APPLE_PROVIDER_SHORT_NAME`: Nome breve del provider di squadra. Se il tuo ID Apple è connesso a più squadre, è necessario specificare il nome breve del provider del team che si desidera utilizzare per notarizzare l'app. Puoi elencare i tuoi fornitori di servizi utilizzando `xcrun altool --list-providers -u "AC_USERNAME" -p "AC_PASSWORD"` come spiegato nel flusso di lavoro della notarizzazione [](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow).

## Firma app Tauri

Il primo passo per firmare un'applicazione macOS è ottenere un certificato di firma da Apple Developer Program.

### Creare un certificato di firma

Per creare un nuovo certificato di firma, è necessario generare un file di richiesta di firma certificato (CSR) dal computer Mac. [Crea una richiesta di firma di certificati][] descrive la creazione di un CSR.

Sul tuo account Apple Developer vai ai ai Certificati [, ID & Profilo pagina][] e fare clic sul pulsante `Crea un certificato` per aprire l'interfaccia per creare un nuovo certificato. Scegli il tipo di certificato appropriato (`Apple Distribution` per inviare app all'App Store, e `Applicazione ID Sviluppatore` per spedire applicazioni al di fuori dell'App Store). Carica il tuo CSR, e il certificato verrà creato.

:::note

Solo il titolare dell'account `Apple Developer` può creare _certificati per l'ID sviluppatore_. Ma può essere associato con un ID Apple diverso creando un CSR con un indirizzo email diverso utente.

:::

### Scaricamento di un certificato

Su [Certificati, ID & Profilo pagina][], fare clic sul certificato che si desidera utilizzare e fare clic sul pulsante `Scarica`. It saves a `.cer` file that installs the certificate on the keychain once opened. Il nome della voce keychain rappresenta l'identità di firma ``, which also be found by executing `security find-identity -v -p -p codesigning`.

:::note

Un certificato di firma è valido solo se associato al tuo ID Apple. Un certificato non valido non sarà elencato nella scheda <i>Accesso al portachiavi > I miei certificati</i> o nell'uscita <i>identità di sicurezza -v -p -p codesigning</i>.

:::

### Firma l'applicazione Tauri

La configurazione della firma è fornita al bundler Tauri tramite variabili d'ambiente. È necessario configurare il certificato da usare e una configurazione di autenticazione opzionale per notarizzare l'applicazione.

#### Variabili di ambiente certificato

- `APPLE_SIGNING_IDENTITY`: questa è la `identità di firma` che abbiamo evidenziato sopra. Deve essere definito per firmare applicazioni sia a livello locale che su macchine CI.

Inoltre, per semplificare il processo di firma del codice su CI, Tauri può installare il certificato sul portachiavi per te se definisci le variabili di ambiente `APPLE_CERTIFICATE` e `APPLE_CERTIFICATE_PASSWORD`.

1. Apri l'app `Keychain Access` e trova la voce del portachiavi del tuo certificato.
2. Espandi la voce, fai doppio clic sull'elemento chiave e seleziona `Esporta "$KEYNAME"`.
3. Selezionare il percorso per salvare il file `.p12` e definire la password del certificato esportato.
4. Converti il file `.p12` in base64 che esegue il seguente script sul terminale: `openssl base64 -in /path/to/certificate.p12 -out certificate-base64.txt`.
5. Imposta il contenuto del file `certificate-base64.txt` alla variabile di ambiente `APPLE_CERTIFICATE`.
6. Imposta la password del certificato alla variabile di ambiente `APPLE_CERTIFICATE_PASSWORD`.

#### Variabili d' ambiente di autenticazione

Queste variabili sono richieste solo per notarizzare l'applicazione.

:::note

La notarizzazione è necessaria quando si utilizza un certificato <i>Developer ID Application</i>.

:::

- `APPLE_ID` and `APPLE_PASSWORD`: per autenticarsi con il tuo ID Apple, imposta il `APPLE_ID` all'email del tuo account Apple (esempio: `esporta APPLE_ID=tauri@icloud. om`) e `APPLE_PASSWORD` con una password [specifica per app][] per l'account Apple.
- `APPLE_API_ISSUER` e `APPLE_API_KEY`: in alternativa, puoi autenticarti utilizzando una chiave API App Store Connect. Open the App Store Connect's [Users and Access page][], select the `Keys` tab, click on the `Add` button and select a name and the `Developer` access. Il `APPLE_API_ISSUER` (`Issuer ID`) è presentato sopra la tabella delle chiavi, e il `APPLE_API_KEY` è il valore sulla colonna `Key ID` in quella tabella. È inoltre necessario scaricare la chiave privata, che può essere fatto solo una volta ed è visibile solo dopo che una pagina ricarica (il pulsante è mostrato sulla riga della tabella per il nuovo tasto creato). Il file della chiave privata deve essere salvato su `./private_keys`, `~/private_keys`, `~/. rivate_keys` o `~/.appstoreconnect/private_keys`, come indicato nel comando `xcrun altool --help`.

### Costruire l'applicazione

Il bundler Tauri firma automaticamente e notifica la tua applicazione con tutte queste variabili di ambiente impostate quando esegui il comando `tauri build`.

### Esempio

L'esempio seguente utilizza le azioni GitHub per firmare un'applicazione utilizzando l'azione [Tauri][].

Definiamo prima le variabili di ambiente che abbiamo elencato sopra come Secrets su GitHub.

:::note

È possibile visualizzare <a href="https://docs.github.com/en/actions/reference/encrypted-secrets">questa guida</a> per conoscere i segreti di GitHub.

:::

Una volta stabiliti i Segreti GitHub, creiamo un flusso di lavoro GitHub in `.github/workflows/main.yml`:

```yml
name: 'publish'
on:
  push:
    branches:
      - release

jobs:
  publish-tauri:
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v2
        with:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install app dependencies and build it
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ENABLE_CODE_SIGNING: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        with:
          tagName: app-v__VERSION__ # the action automatically replaces \_\_VERSION\_\_ with the app version
          releaseName: 'App v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          prerelease: false
```

Il flusso di lavoro tira i segreti da GitHub e li definisce come variabili di ambiente prima di costruire l'applicazione usando l'azione Tauri. L'output è un rilascio GitHub con l'applicazione macOS firmata e notarizzata.

[tauri-apps/tauri#592]: https://github.com/tauri-apps/tauri/issues/592
[Programma Apple Developer]: https://developer.apple.com/programs/
[notarizzazione del software macOS prima della distribuzione]: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
[password specifica per app]: https://support.apple.com/en-ca/HT204397
[specifica per app]: https://support.apple.com/en-ca/HT204397
[Crea una richiesta di firma di certificati]: https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request
[, ID & Profilo pagina]: https://developer.apple.com/account/resources/certificates/list
[Certificati, ID & Profilo pagina]: https://developer.apple.com/account/resources/certificates/list
[Users and Access page]: https://appstoreconnect.apple.com/access/users
[Tauri]: https://github.com/tauri-apps/tauri-action
