## これは何？

2017年10月7日開催の、 [まぼろしのJS勉強会 #1 「ナウいJSの書き方・考え方」](https://maboroshi.connpass.com/event/66502/) の発表資料です。

---

## 自己紹介

株式会社まぼろし フロントエンドエンジニア
礒田 優(いそだ ゆう) (@isoden_ or @isoden)

- 業務では主に Web アプリ開発をしてます
- :heart: Angular, TypeScript, RxJS, VS Code

---

## もくじ

1. 内容
1. 事前準備
1. どんなメリットがあるか

---

## 事前準備

TypeScript のコンパイラーオプションでソレ用の設定をする

TypeScript では tsconfig.json というファイルに設定を記述する

- [コンパイラーオプションの一覧](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

---

## 有効にするオプション

**--allowJs** (v1.8 ~)

コンパイル対象のファイルに JavaScript を含めてもエラーがでないようになる

**--checkJs** (v2.3 ~)

JavaScript のファイルでも型のチェックを行う

両方デフォルトでは **無効** になっているので忘れず有効にする

---

## オプションの設定方法

tsconfig.json はコマンドラインから生成する

```console
# TypeScript がインストールされてない場合はインストールする
# TypeScript がインストールされていると tsc コマンドが使えるようになる
$ npm install typescript -g

# カレントディレクトリに tsconfig.json を生成
$ tsc --init
```

先程のオプションを有効化、 チェック対象としたい JavaScript ファイルを `include` で指定する

```json
{
  "compilerOptions": {
    ...
    "allowJs": true,
    "checkJs": true
  },
  "include": [
    "src/**/*.js"
  ]
}
```

これで事前準備は終わり :ok_hand: 

---

## メリットその 1

コードで説明👇

---

## 例 1

JavaScript としては valid なコード

```js
const age = 23;

// number に toUpperCase というメソッドはない… 🤔
age.toUpperCase();

// タイポ…? 🤔
age.toFixeed();
```

---

## 例 1

型チェックを有効にすると以下の警告がでるようになる

```js
// コンパイラーにより age は number 型で型推論される
const age = 23;

age.toUpperCase();
// Property 'toUpperCase' does not exist on type 'number'.
// 🙅 存在しないメソッドは当然エラー！

age.toFixeed();
// Property 'toFixed' does not exist on type 'number'. Did you mean 'toFixed'
// 🙅 存在しないメソッドはエラー！
// タイプミスっぽいも場合は教えてくれる！
```

- 実行前にエラーが出てくれるので問題が早期に発見できる！ 🤗
- 型チェックのための特別な記述は追加していない！ 🤗

<a href="https://www.youtube.com/embed/KnmUWciziWQ?rel=0">demo</a>

---

## 例 2

自分で定義した関数の場合
こちらも JavaScript としては valid

```js
/**
 * 引数の数値を合計した数値を返す
 */
const add = (x, y) => {
  return x + y;
};

// 引数間違えてない…? 🤔
add(5, '5');

/**
 * 値を Promise でラップする
 */
const wrap = value => {
  return Promise.resolve(value);
};

wrap(40)
  .then(value => {
    // value は number 型のはず… 🤔
    return value.toUpperCase();
  });
```

---

## 例 2

JSDoc を追加する

```js
/**
 * 引数の数値を合計した数値を返す
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
const add = (x, y) => {
  return x + y;
};

add(5, '5');
//      ↑ Argument of type '"5"' is not assignable to parameter of type 'number'
//      🙅 文字列はパラメーターに指定できない！

/**
 * 値を Promise でラップする
 * @template T
 * @param {T} value
 * @return {Promise<T>}
 */
const wrap = value => {
  return Promise.resolve(value);
};

wrap(40)
  .then(value => {
    //       ↓ 型推論で数値型になるので先程と同じくエラー 🙅
    return value.toUpperCase();
  });
```

---

## メリットその2 ライブラリの補完が強化される :muscle: 

TypeScript 同様、 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) の型定義が使える

例えば Lodash が使いたいときは型情報をインストールするだけ

```console
$ npm install lodash @types/lodash --save
```

---

## ES6 modules のときはチョット特殊

デフォルトだと以下のように書かないと型情報が有効にならない

```js
import * as _ from 'lodash'
```

詳しい説明は[こちらの記事](https://qiita.com/bouzuya/items/edf5274241b50f32c621#_reference-a09ba7fb9aa114e133e2)を御覧ください 🙇

コンパイラーオプションから、 `allowSyntheticDefaultImports` を有効にすると default import ができるようになる

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
  }
}
```

```js
import _ from 'lodash'
```

---

## 補完の様子

<a href="https://www.youtube.com/embed/e15yCxeNIIM?rel=0">demo</a>

---

## まとめ

- 事前準備は `$ tsc --init` して数行追加するのみ！
- 特殊な記述を覚える必要はない！

---

## Happy Coding with Type :muscle:

---

## 参考資料

- [Type Checking JavaScript Files · Microsoft/TypeScript Wiki](https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files)