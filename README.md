# IroSphere

これは[Tali](https://github.com/TaliPhoto)さんが、[youtube](https://youtu.be/jrCr4j_qdPo)で紹介した、アイデアまで含めてCC0のソフトであるIroSphereというソフトをtauriというフレームワークで一から書き直したものです。<br>
[本家](https://github.com/TaliPhoto/IroSphere)

## install方法
[デモページ](https://oligami-0424.github.io/IroSphere/)<br><br>
このgithubのページの右の方にある[Release](https://github.com/oligami-0424/IroSphere/releases/latest)から、それぞれのプラットフォームにあったinstallerをダウンロードし、実行してください。<br>
windows: msi<br>
linux(debian系列): deb <br>
linux: AppImage<br>
mac: dmg<br>
※私はwindowユーザーなので、実際に他のOSで正常に動作するかは知りません

## 使い方
画像をクリックまたは長押しで右のSphereに色が付きます。<br>
Ctrl+Oもしくはドラッグアンドドロップで画像ファイルを読み込みます。<br>
Fキーなどの便利機能や他の機能などは搭載していません。誰かプルリクを出してもいいですよ

## 重要
- アイコンがデフォルトなので早く変更する！！<br>
誰かアイコンくれてもいいですよ！

## なぜ
私があの余りにもノーコードに寄ったunityが嫌いなので、あれにファイル読み込み機能を実装したくありませんでした。そもそも嫌いなので書けません。<br>
なので、気になっていたtauri(初)でthree.js(初)とvite(初)を使って書かせていただきました

## メモ
- 本家のwasdと動きが逆
- 色相の回り方が角度の増え方と逆
- fキーの実装
- リセット方法がない

## License
Mit Licenseです。アイコンなどがデフォルトのままですから...
