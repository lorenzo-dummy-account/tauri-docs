---
sidebar_label: Linux 代码签名
sidebar_position: 3
---

# 代码签名 Linux 软件包

本指南提供关于Linux软件包代码签名的信息。

## B. 所需经费

- gpg 或 gpg2

必须准备签署的钥匙。 可以使用以下方式生成一个新的：

```shell
gpg2 --fullgen-key
```

详情请参阅gpg或gpg2文件。 您应该更多地注意在安全的位置备份您的私钥和公钥。

## 正在签名 AppImages

您可以通过设置以下环境变量在应用图像中嵌入签名：

- **SIGN**: 设置为 `1` 以在应用图像上签字。
- **SIGN_Key**: 可选变量使用特定的 GPG 密钥ID进行签名。
- **APPIMAGETOOL_SIGN_PASSPHRASE**: 签名密钥密码。 如果未设置，gpg 会显示对话框以便您可以输入它。 您必须在运行自动化任务时设置此项。

您可以通过运行以下命令在应用程序图像中显示嵌入的签名：

```shell
./src-tauri/target/release/bundle/appimage/$APPNAME_$VERSION_amd64.AppImage --appimage-signature
```

请注意，您需要根据您的配置使用正确的 $APPNAME 和 $VERSION 值。

:::谨慎.签名未验证

AppImage 无法验证签名，所以您不能依靠它来检查文件是否被篡改。 要验证签名，您必须为您的用户提供一个外部工具。 欲了解更多信息，请参阅 [官方的 AppImage 文档][]。

:::

[官方的 AppImage 文档]: https://docs.appimage.org/packaging-guide/optional/signatures.html
