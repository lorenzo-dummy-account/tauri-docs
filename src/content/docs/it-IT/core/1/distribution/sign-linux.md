---
sidebar_label: Firma Codice Linux
sidebar_position: 3
---

# Code Signing Linux packages

Questa guida fornisce informazioni sulla firma del codice per i pacchetti Linux.

## Requisiti

- gpg o gpg2

Deve essere preparata una chiave per la firma. Uno nuovo può essere generato utilizzando:

```shell
gpg2 --full-gen-key
```

Fare riferimento alla documentazione gpg o gpg2 per ulteriori informazioni. Dovresti prestare ulteriore attenzione al backup delle chiavi pubbliche e private in una posizione sicura.

## Firma per AppImages

È possibile inserire una firma nell'AppImage impostando le seguenti variabili d'ambiente:

- **SIGN**: impostato a `1` per firmare l'AppImage.
- **SIGN_KEY**: variabile opzionale per usare un ID chiave GPG specifico per la firma.
- **APPIMAGETOOL_SIGN_PASSPHRASE**: la password della chiave di firma. Se disattivato, gpg mostra una finestra di dialogo in modo da poterla inserire. È necessario impostare questo quando si eseguono attività automatizzate.

È possibile visualizzare la firma incorporata nell'AppImage eseguendo il seguente comando:

```shell
./src-tauri/target/release/bundle/appimage/$APPNAME_$VERSION_amd64.AppImage --appimage-signature
```

Nota che devi modificare i valori $APPNAME e $VERSION con quelli corretti in base alla tua configurazione.

:::cautela La firma non è verificata

AppImage non convalida la firma, quindi non puoi fare affidamento su di essa per verificare se il file è stato manomesso o meno. Per convalidare la firma, è necessario fornire uno strumento esterno per i propri utenti. Vedere [la documentazione ufficiale di AppImage][] per ulteriori informazioni.

:::

[la documentazione ufficiale di AppImage]: https://docs.appimage.org/packaging-guide/optional/signatures.html
