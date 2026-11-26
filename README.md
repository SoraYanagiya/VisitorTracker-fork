## Visitor Trackerの使い方
このシステムは研究室公開の際などに来場者の出身を確認するのに使います。
1つの画面で、左側で学校・学年をタップし、右側の地図で「どこから来たか」の都道府県（海外の方は国名を入力）を選んで「送信する」を押すだけで記録できます。

### 手元で動かす
1. 自分の環境にNode.jsとnpmの環境を構築する。(参考：https://qiita.com/mk185/items/7ad004bf202f400daea1 (最終閲覧日：2025-04-24))
2. このレポジトリをクローンする。
3. クローンされたレポジトリで`npm install`を実行する。
4. `npm start`コマンドを実行する。
5. `3000`番ポートで起動するので、アクセスする。(http://localhost:3000)
6. ログを確認したい場合は /logs にアクセスする。(http://localhost:3000/logs) 日付を切り替えて過去のログも見られます。新しい記録はリアルタイムで反映されます。
7. 終了する際は普通に Ctrl+C で良い。

### ラズパイで公開する(常時起動)
```bash
sudo bash deploy/install.sh
```
- systemd サービス `visitor-tracker` として登録され、ラズパイの起動時に自動で立ち上がります。落ちても自動で再起動します。
- ufw が有効な場合は 3000/tcp を許可します。
- 最後に表示される `http://<ラズパイのIP>:3000/` を同じネットワークの端末(タブレット等)で開きます。

よく使うコマンド:
```bash
sudo systemctl status visitor-tracker     # 状態確認
sudo systemctl restart visitor-tracker    # 再起動(コードを更新したとき)
sudo systemctl stop visitor-tracker       # 停止
journalctl -u visitor-tracker -f          # 動作ログ
```
ポートを変えたい場合は `sudo PORT=8080 bash deploy/install.sh` のように実行します。

### ログ(記録データ)
- `logs/` フォルダに **1日1ファイル** の CSV (`logs/2026-11-20.csv` のような名前) で保存されます。日付は日本時間で切り替わります。
- 列は `学校所在地,学校区分,その他` です。Excel 等でそのまま開けます。
- `logs/` は Web からは直接ダウンロードできない場所にあります。
- 保存先を変えたい場合は環境変数 `LOG_DIR` で指定できます。
