---
sidebar_label: Firma Codice Windows
sidebar_position: 2
---

# Windows - Guida per la firma del codice localmente & con GitHub Actions

## Introduzione

La firma del codice consente agli utenti di sapere che hanno scaricato l'eseguibile ufficiale della tua app e non alcuni malware di terze parti che si pongono come la tua app. Anche se non è necessario, migliora la fiducia degli utenti nella tua app.

## Prerequisiti

- Windows - è possibile utilizzare altre piattaforme, ma questo tutorial utilizza funzionalità native di Powershell.
- Un'applicazione Tauri funzionante
- Codice di firma certificato - è possibile acquisire uno di questi sui servizi elencati in [Microsoft docs][]. Ci sono probabilmente ulteriori autorità per i certificati non-EV rispetto a quanto incluso in tale elenco, si prega di confrontarli e scegliere uno a proprio rischio.
  - Assicurati di ottenere un certificato **per la firma del codice** , i certificati SSL non funzionano!

Questa guida presuppone che si dispone di un certificato di firma codice standard> Se si dispone di un certificato EV, che generalmente coinvolge un token hardware, si prega di seguire la documentazione del vostro emittente, invece.

:::note

Se firmi l'app con un certificato EV, riceverà una reputazione immediata con Microsoft SmartScreen e non mostrerà alcun avvertimento agli utenti.

Se si sceglie di ottenere un certificato OV, che è generalmente più economico e disponibile per gli individui, Microsoft SmartScreen mostrerà ancora un avviso agli utenti quando scaricano l'app. Potrebbe richiedere del tempo fino a quando il tuo certificato costruisce abbastanza reputazione. Puoi optare per [l'invio della tua app][] a Microsoft per la revisione manuale. Anche se non garantito, se l'applicazione non contiene alcun codice dannoso, Microsoft può concedere ulteriore reputazione e potenzialmente rimuovere l'avviso per quel file caricato specifico.

:::

## Per Iniziare

Ci sono alcune cose che dobbiamo fare per ottenere Windows preparati per la firma del codice. Ciò include la conversione del nostro certificato in un formato specifico, l'installazione di questo certificato e decodifica le informazioni richieste dal certificato.

### A. Converti il tuo `.cer` in `.pfx`

1. Avrete bisogno di quanto segue:

   - file certificato (miniera è `cert.cer`)
   - file della chiave privata (il mio è `chiave privata.key`)

2. Apri un prompt dei comandi e cambia nella tua directory corrente usando `cd Documents/Certs`

3. Converti il tuo `.cer` in un `.pfx` usando `openssl pkcs12 -export -in cert.cer -inkey private-key.key -out certificate.pfx`

4. Dovresti essere richiesto di inserire una password di esportazione **NON FORGETTE!**

### B. Import your `.pfx` file into the keystore.

Ora abbiamo bisogno di importare il nostro file `.pfx`.

1. Assegna la password di esportazione a una variabile usando `$WINDOWS_PFX_PASSWORD = 'MYPASSWORD'`

2. Ora Importa il certificato usando `Import-PfxCertificate -FilePath Certs/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_PFX_PASSWORD -Force -AsPlainText)`

### C. Prepara Le Variabili

1. Abbiamo bisogno della miniatura SHA-1 del certificato; puoi ottenerla usando `openssl pkcs12 -info -in certificate.pfx` e cercare sotto per

```
Attributi borsa
    localKeyID: A1 B1 A2 B2 A3 B3 A4 B4 A5 B5 A6 B6 A7 B7 A8 B8 A9 B9 A0 B0
```

2. Catturerai il `localKeyID` ma senza spazi, in questo esempio, sarebbe `A1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0`. Questo è il nostro `certificatoThumbprint`.

3. Abbiamo bisogno dell'algoritmo di digest SHA utilizzato per il tuo certificato (Hint: è probabile che `sha256`

4. Abbiamo anche bisogno di un URL timestamp; questo è un server di tempo utilizzato per verificare l'ora della firma del certificato. Sto usando `http://timestamp.comodoca.com`, ma chi hai ottenuto il tuo certificato probabilmente ne ha anche uno.

## Prepara il file `tauri.conf.json`

1. Ora che abbiamo il nostro `certificatoThumbprint`, `digestAlgorithm`, & `timestampUrl` apriremo il `tauri. onf.json`.

2. Nella `tauri.conf.json` cercherai il pacchetto `tauri` -> `` -> `finestre` sezione. Vedete, ci sono tre variabili per le informazioni che abbiamo acquisito. Riempilo come sotto.

```json tauri.conf.json
"windows": {
        "certificateThumbprint": "A1B1A2B2A3B3A4B4A5B5A6B6A7B7A8B8A9B9A0B0",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.comodoca.com"
}
```

3. Salvare e eseguire `filati <unk> filati costruire`

4. Nell'output della console si dovrebbe vedere il seguente output.

```
info: firma app
info: esecuzione signtool "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041. \\x64\\signtool.exe"
info: "Done Adding Additional Store\r\nFirmato con successo: FILE DI APPLICAZIONE QUI
```

Che mostra che hai firmato con successo il `.exe`.

E questo è tutto! Hai firmato con successo il file .exe.

## BONUS: Firma la tua applicazione con GitHub Actions.

Possiamo anche creare un flusso di lavoro per firmare l'applicazione con le azioni GitHub.

### GitHub Secrets

Abbiamo bisogno di aggiungere alcuni segreti GitHub per la corretta configurazione dell'azione GitHub. Questi possono essere chiamati come si desidera.

- È possibile visualizzare la guida [cifrati segreti][] su come aggiungere segreti GitHub.

I segreti che abbiamo usato sono i seguenti

|         GitHub Secrets         |                                                              Valore per la variabile                                                              |
|:------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------:|
|      WINDOWS_CERTIFICATE       | La versione codificata Base64 del certificato .pfx, può essere fatta utilizzando questo comando `certutil -encode certificate.pfx base64cert.txt` |
| WINDOWS_CERTIFICATE_PASSWORD |                               Password di esportazione certificato utilizzata per la creazione del certificato .pfx                               |

### Modifiche Del Workflow

1. Dobbiamo aggiungere un passo nel flusso di lavoro per importare il certificato nell'ambiente Windows. Questo workflow realizza quanto segue

   1. Assegna i segreti di GitHub alle variabili di ambiente
   2. Crea una nuova directory `certificato`
   3. Importa `WINDOWS_CERTIFICATE` in tempCert.txt
   4. Usa `certutil` per decodificare il tempCert.txt da base64 in un file `.pfx`.
   5. Rimuovi tempCert.txt
   6. Importa il `. fx` file nel Cert store di Windows & converte il `WINDOWS_CERTIFICATE_PASSWORD` in una stringa sicura da usare nel comando importazione.

2. Useremo il modello di pubblicazione [`tauri-action`][].

```yml
nome: 'publish'
su:
  push:
    branches:
      - release

jobs:
  publish-tauri:
    strategia:
      fail-fast: false
      matrix:
        piattaforma: [macos-latest, ubuntu-latest, windows-latest]

    runs-on: ${{ matrix.platform }}
    passi:
      - uses: actions/checkout@v2
      - name: setup node
        uses: actions/setup-node@v1
        con:
          node-version: 12
      - name: install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: install webkit2gtk (ubuntu only)
        if: matrix. latform == 'ubuntu-latest'
        run: <unk>
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-4.
      - nome: installa le dipendenze dell'app e costruiscila
        run: yarn && yarn build
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        con:
          tagName: app-v__VERSION__ # l'azione sostituisce automaticamente \_\_VERSION\_\_ con la versione dell'app
          releaseName: 'App v__VERSION__'
          releaseBody: 'Vedi gli asset per scaricare questa versione e installazione.'
          releaseDraft: true
          prerelease: false
```

3. Proprio sopra `-name: install app dependencies and build it` you will want to add the following step

```yml
- nome: import windows certificate
  se: matrix. latform == 'windows-latest'
  env:
    WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
    WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  esecuzione: <unk>
    New-Item -ItemType directory -Path certificate
    Set-Content -Path certificate/tempCert. xt -Value $env:WINDOWS_CERTIFICATE
    certutil -decode certificate/tempCert.txt certificate/certificate.pfx
    Remove-Item -path certificate -include tempCert. xt
    Import-PfxCertificate -FilePath certificate/certificate.pfx -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString -String $env:WINDOWS_CERTIFICATE_PASSWORD -Force -AsPlainText)
```

4. Salva e invia al tuo repo.

5. Il tuo flusso di lavoro può ora importare il certificato Windows e importarlo nel runner GitHub, consentendo la firma automatica del codice!

[Microsoft docs]: https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-cert-manage
[l'invio della tua app]: https://www.microsoft.com/en-us/wdsi/filesubmission/
[cifrati segreti]: https://docs.github.com/en/actions/reference/encrypted-secrets
[`tauri-action`]: https://github.com/tauri-apps/tauri-action
