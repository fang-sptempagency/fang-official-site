# FOLDER NAME
photos/ # 人物の写真 ※イラストのこと 
scenarios/ # 音声の文字起こし文書　※脚本のこと 
records/ # 映像記録 ※漫画のこと 
archives/ # 補足資料 ※篠原のメールとか。SIRENの「アーカイブ」まんま。 
videos/ # 映像（予約語） 
assets/ # 共通素材 ※FANGロゴなど。

# IMAGE SIZE
photos/    # イラスト・人物写真
  main.webp   長辺 1400〜1800px
  thumb.webp  長辺 400〜600px

episodes/   # 漫画・映像記録
  pages/*.webp  縦1500px固定
  thumb.webp    長辺 600px

assets/    # ロゴなど
  svg優先
  pngは必要なサイズだけ

# SCRIPT TYPE
status: fixed      # 脚本あり・確定
status: draft      # 脚本あり・仮
status: missing    # 脚本なし・タイムライン上の目印
status: branch     # 分岐点

# AUTO CONVERT SCRIPT
make-photo-folders.zsh  # イラストを作品ごとに準備するためのスクリプト。inputにYYYYMMDD_タイトル.pngを投げ込んで実行。outputにフォルダが生成される。
make-photo-thumbs.zsh   # すでに作ったイラストフォルダ内をチェックして、サムネイルを自動生成するスクリプト。
export-scenario-dates.zsh # 脚本フォルダを全て読み取って、情報を集計するスクリプト。seshat.用に作ったが、結局手入力に頼っている。(2026/7/19時点)

# REJECTED
- Fang.へのダークモード適用
白ベースのFang.　黒ベースのDecan.と個性をつけるため

- 世界線作図へのJavascriptライブラリ利用
実装に手こずった上、drawioを用いた作図で十分だったため