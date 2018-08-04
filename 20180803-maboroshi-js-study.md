## 自己紹介

株式会社まぼろし  
フロントエンドエンジニア

いそだ ゆう

❤️ Angular, TypeScript, RxJS, VS Code

---

## 過去の「型とテスト」ネタ

- [JavaScript 開発でも TypeScript の恩恵を受けよう #mbrs_study #1](https://github.com/isoden/s/blob/gh-pages/20171007-maboroshi-js-study.md)
- [RxJS のテストの書き方を調べた話 #mbrs_study #3](https://github.com/isoden/s/blob/gh-pages/20180413-maboroshi-js-study.md)

---

## テーマ： E2E のよもやま 🤔💭

- 今使っている Cypress がすごい便利 (紹介)
- E2E テストのココどうしてますか？ (雑談)

---

## 今使っている Cypress がすごい便利

---

## E2E とワタシ

- あんまりしっかり書いたことない…
  - AngularJS 時代に Protractor でを使った記憶が…
- 今の案件で Cypress 初導入 💪

---

## Cypress とは 🔍

[公式サイト - https://www.cypress.io/](https://www.cypress.io/)

- E2E Test Runner
- フルスタックフレームワーク
  - ランナー、アサーション、スタブなど全部入り
- 2017年10月に Public beta が公開 - [Cypress is now public beta](https://www.cypress.io/blog/2017/10/10/cypress-is-now-public-beta/)
- 有料プランでダッシュボード機能がある(らしい)

---

## 布教せねば 🙋

---

## [Cypress 推し機能](https://www.cypress.io/features/) 👑

1. Time Travel
2. Debuggability
3. Real time reloads
4. Automatic waiting
5. Spies, stubs, and clocks
6. Network traffic control
7. Consistent results
8. Screenshots and videos

---

## 実行速度がはやい 😊

- Cypress そもそも起動も動作も早い
- リアルタイムリロード機能がある
  - スペックファイルを更新すると即テストが再実行される

快適にテストフローが回せている 😊

---

## デバッグ機能が強力 😊

- 操作のたびに DOM のスナップショットを保存してくれる
  - スナップショットの DOM は Chrome の開発者ツールがそのまま使える
    - なので(?)今の所対応ブラウザは Chrome 系のみ
- スクリーンショットや動画を保存してくれる機能があるので CI 上でもデバッグが容易 💪💪

端末に赤字でエラーメッセージが出るだけよりも遥かにわかりやすい 👍

---

## 非同期な処理を意識しなくていい 😊

`browser.sleep(5000)` 的なもの。

Cypress にも `wait` 機能はあるけど殆どの場合に必要ないのでアンチパターンとされている

```js
// ページ遷移。 ページの `'load'` イベントが呼ばれてから次の処理に移る
cy.visit('http://localhost/8080')

// ↓ そのためいらない
cy.wait(5000)
```

```js
// モックの定義
cy.server()
cy.route('GET', /users/, [{name: 'Maggy'}, {name: 'Joan'}])

// データ取得
cy.get('#fetch').click()

// ↓ 不要
// cy.wait(4000)

// tr が 2 個になるまで (≒ 条件にマッチするまで)自動的に再試行してくれる(タイムアウトは別で設定あり)
cy.get('table tr').should('have.length', 2)
```

暗黙的な解決なので好き嫌いがわかれるかも。  
こちらは明示的なパターン。

```js
// モックの定義
cy.server()

// ↓ リクエストにエイリアス名をつける
cy.route('GET', /users/, [{name: "Maggy"}, {name: "Joan"}])
  .as('getUsers')

// データ取得
cy.get('#fetch').click()

// getUsers のレスポンスが返るまで待機
cy.wait('@getUsers')

// 待機してからリストをチェック
cy.get('table tr').should('have.length', 2)
```

非同期を意識せずに動作の次はこうなると迷わず書いていける 😊

---

すごい、 すごいぞ Cypress 👏😊

- テスト、正直めんどくさいので快適に書ける環境大事
- クロスブラウザ対応は…今後に期待


---

## E2E テストのココどうしてますか?

- どの環境をテストしていますか?
  - ローカル環境だけ?
  - ステージング環境だけ?
  - 本番環境だけ?
- テストシナリオはどうやって決めていますか?
  - そもそもだれが決めるもの?エンジニアだけで決めていいの?
- 異常系はどこまでテストするもの?
  - Network Error とかはやるやらない？

---

## 🍣 ありがとうございました 🍺
