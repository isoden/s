## 自己紹介

株式会社まぼろし
フロントエンドエンジニア

いそだ ゆう

❤️ Angular, TypeScript, RxJS, VS Code

---

## RxJS のテストの書き方を調べた話 📝

- Angular きっかけで RxJS を使い始めた 🅰️
- Angular は非同期系のテストユーティリティーが充実している 🔧
- テストユーティリティーがないと書き方がいまいちわからない 🙄

---

## ドキュメントを見てみる 👀

- [Writing Marble Tests | ReactiveX/RxJS](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md)  

---

## Marble Tests とは？ 🤔

---

## Marble？ 🤔

Marble Diagram のこと 👇

<img width="605" alt="marble diagram" src="https://qiita-image-store.s3.amazonaws.com/0/16955/163a27c5-7e41-e261-812b-d2a375bc68c9.png">

- [例その 1](https://rxviz.com/v/dJPm4Y8D)
- [例その 2](https://rxviz.com/v/QJVkZ78Z)

---

## Marble Tests はどう書く？ 🤔

---

## Marble Tests はどう書く？ 🤔

さっきの Observable を関数にしてみる 🔧

```ts
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * 渡された `Observable<number>` を倍にして返す
 */
const double = <T>(input$: Observable<number>) => {
  return input$.pipe(
    map(value => value * 2)
  )
}

//
// 使用例
//
import { interval } from 'rxjs/observable/interval'
import { take } from 'rxjs/operators'

// 入力: 1000ミリ秒ごとに数値が流れるストリーム
const source$ = interval(1000).pipe(take(3))

double(source$)
 .subscribe(value => console.log(value))

// 1000ミリ秒後
// -> log: 0
// 1000ミリ秒後
// -> log: 2
// 1000ミリ秒後
// -> log: 4
```

---

## Marble Tests はどう書く？ 🤔

テストコード

```ts
import { cold } from 'jest-marbles'

describe('double', () => {
  it('2倍になる', () => {
    const input$    = cold('--a--b--c|', { a: 0, b: 1, c: 2 })
    const expected$ = cold('--a--b--c|', { a: 0, b: 2, c: 4 })

    expect(double(input$)).toBeObservable(expected$)
  })
})
```

---

## Marble Diagram を文字列で表現する

さっきの図
![_Users_isodayuu_Desktop_index.html.png](https://qiita-image-store.s3.amazonaws.com/0/16955/c935d0c6-2763-68f1-e73d-21d11cffcfb0.png)

を記号で書く ✍️

```
--a--b--c--d--
```

期待するストリームと実際のストリームが一致するかテストする 🚨

---

## Marble Tests の書き方 ✍️

```
  value
  ↓
  ↓     error
  ↓     ↓     complete
  ↓     ↓     ↓
--a--b--#--d--|
```

- `-` - 時間 (10 frame)
- `a` - なにか値が来たとき (`next()`)
- `|` - ストリームの終わり (`complete()`)
- `#` - エラーが起きたとき (`error()`)

[syntax の一覧](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md#marble-syntax)

---

## Marble Tests の書き方 ✍️

```ts
// 入力: a には 0, b には 1, c には 2 が流れるストリーム
const input$    = cold('--a--b--c|', { a: 0, b: 1, c: 2 })

// 期待値: 値が流れるタイミングは同じ。 それぞれの値が倍になっている
const expected$ = cold('--a--b--c|', { a: 0, b: 2, c: 4 })

// double 関数を実行することで
// 期待するストリームとなるかをチェック
expect(double(input$)).toBeObservable(expected$)
```
---

## Marble Tests の書き方 ✍️

テストが同期的に書ける 🙌

```ts
import { cold } from 'jest-marbles'

describe('double', () => {
  it('2倍になる', () => {
    const input$    = cold('--a--b--c|', { a: 0, b: 1, c: 2 })
    const expected$ = cold('--a--b--c|', { a: 0, b: 2, c: 4 })

    // Promise を返したり、 done を実行しなくていい
    expect(double(input$)).toBeObservable(expected$)
  })
})
```
---

## 何に使う? 🤔

---

## ユースケース

Flux 的な実装で：

- ユーザー検索アクション(`'[Users] Search'` アクション)が発行された 👇
- 検索APIにリクエストを投げて結果を受け取る 👇
  - リクエスト成功時にはリクエスト成功アクション(`'[Users] Search Success'`)を発行 🙆
  - リクエスト失敗時にはリクエスト失敗アクション(`'[Users] Search Failure'`)を発行 🙅
- `'[Users] Search'` アクションは後から来たものを優先する ⚠️

---

## ユースケース

Angular(ngrx) だと副作用を伴うアクションはこう書ける。
redux-observable でいう Epic。

```ts
import { UsersActions } from './actions'

@Injectable()
class UsersEffects {

  @Effect()
  searchAction$ = this.actions$ // actions$ は Observable。 action が発行されたらそのアクションが流れてくる
    .pipe(
      // 検索アクションをフィルタリング
      ofType(UsersActions.SEARCH),

      // 検索APIにリクエストを投げる
      // 検索中に更にアクションが来た場合は以前のリクエストは捨てられる
      switchMap((action) => this.userService.search(action.payload)),

      // 結果に応じたアクションを返す
      map(result => new SearchSuccess(result)),
      catchError(err => of(new SearchFailure(err)))
    )

  // constructor で DI (今回は無関係)
  constructor(
    private actions$: Actions,
    private userService: UserSerivce,
  ) {}
}
```

---

## これのテストを書いてみる

---

## テストしたいこと

### 正常系

- 検索アクションを発行 → 検索成功アクションが発行
- 検索じゃないアクションを発行 → 何も起きない
- 複数の検索アクションを発行 → 最新のアクションだけが有効 → 検索成功アクションが発行

### 異常系
- 検索アクションを発行 → APIがエラーを返す → 検索失敗アクションが発行

---

## テストのベース

```ts
describe('UsersEffects', () => {
  describe('searchAction$', () => {
    describe('正常系', () => {
      it('検索成功アクションが発行される', () => {})
      it('検索以外のアクションは無視される', () => {})
      it('複数アクションが発行された場合は後から発行されたアクションを優先する', () => {})
    })

    describe('異常系', () => {
      it('検索失敗アクションが発行される', () => {})
    })
  })
})
```

---

## テストのベース

```ts
describe('UsersEffects', () => {
  let actions$: Actions
  let usersEffects: UsersEffects
  let usersService: UsersService

  beforeEach(() => {
    // テスト環境の準備 (コードは省略
    // ...

    // インスタンスを受け取って
    // テストとモックができるようのする
    actions$ = TestBed.get(Actions)
    usersEffects = TestBed.get(UsersEffects)
    usersService = TestBed.get(UsersService)
  })

  describe('searchAction$', () => {
    describe('正常系', () => {
      beforeEach(() => {
        // 検索サービスをモック
        // 20 frame 後に検索結果を返す
        spyOn(usersService, 'searchUsers')
          .and
          .returnValue(cold('--a|', { result: { users: [/* 略 */] }))
      })
    })
  })
})
```

---

## テストその1

```ts
it('検索成功アクションが発行される', () => {
  // 20 frame 後に Search アクションが流れてくるストリーム
  const actions$  = hot ('--a'   , { a: { type: '[Users] Search' } })

  // Search アクションの更に 20 frame 後に検索処理成功のアクションが流れるストリーム
  const expected$ = cold('----x', { x: { type: '[Users] Search Success', payload: { result: { /* 検索結果 */ } } }})

  // UsersEffects の actions$ にアクションが流れるようにする
  actions$.stream = actions$

  expect(usersEffects.usersSearch$).toBeObservable(expected$)
})
```

テストパス 🙆

---

## テストその2

```ts
it('検索以外のアクションは無視される', () => {
  // 20 frame 後に Search じゃないアクションが流れるストリーム
  const actions$  = hot ('--a', { a: { type: '[Users] NOT Search' } })

  // 何も流れないストリーム
  const expected$ = cold('---')

  // UsersEffects の actions$ にアクションが流れるようにする
  actions$.stream = actions$

  expect(usersEffects.usersSearch$).toBeObservable(expected$)
})
```

テストパス 🙆

---

## テストその3

```ts
it('複数アクションが発行された場合は後から発行されたアクションを優先する', () => {
  // Search アクションが続けて流れてくるストリーム
  const actions$  = hot ('--a-a---a'   , { a: { type: '[Users] Search' } })

  // 1つ目のリクエストが解決する前に2つ目のアクションが来たので1つ目はスキップされるはず
  const expected$ = cold('------x---x', { x: { type: '[Users] Search Success' } })

  // UsersEffects の actions$ にアクションが流れるようにする
  actions$.stream = actions$

  expect(usersEffects.usersSearch$).toBeObservable(expected$)
})
```

テストパス 🙆

正常系はこれでおわり 🙆

---

## テストその4の準備

```ts
describe('異常系', () => {
  beforeEach(() => {
    // 検索サービスはモックしておく
    // 20 frame 後にエラーを返す (404 とか 500 とか)
    spyOn(usersService, 'searchUsers')
      .and
      .returnValue(cold('--#'))
  })

  it('検索失敗のアクションが発行される', () => {})
})
```

---

## テストその4

```ts
it('検索失敗のアクションが発行される', () => {
  const actions$  = hot ('--a'   , { a: { type: '[Users] Search' } })

  // 途中のサービスでエラーが起きるので検索失敗のアクションが発行される (なぜか `|` が必要…いらないはず…)
  const expected$ = cold('----(y|)', { y: { type: '[Users] Search Failure' } })

  actions$.stream = actions$

  expect(usersEffects.usersSearch$).toBeObservable(expected$)
})
```

---

## 見てみて

- テストがシンプルに書けた 😁
  - 初見殺し感は強め？ 🔪
- 例外系のテストもラク 😁
- 同期的にかけるのはやっぱり嬉しい 😁

---

## Thank you 🤗