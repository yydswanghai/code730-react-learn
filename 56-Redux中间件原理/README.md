# Redux中间件（Middleware）

中间件：类似于插件，可以在不影响原本功能、并且不改动原本代码的基础上，对其功能进行增强。在Redux中，中间件主要用于增强dispatch函数。

实现Redux中间件的基本原理，是更改仓库中的dispatch函数。

Redux中间件书写：

- 中间件本身是一个函数，该函数接收一个store参数，表示创建的仓库，该仓库并非一个完整的仓库对象，仅包含getState，dispatch。该函数运行的时间，是在仓库创建之后运行。
  - 由于创建仓库后需要自动运行设置的中间件函数，因此，需要在创建仓库时，告诉仓库有哪些中间件
  - 需要调用applyMiddleware函数，将函数的返回结果作为createStore的第二或第三个参数。
- 中间件函数必须返回一个dispatch创建函数


- applyMiddleware函数，用于记录有哪些中间件，它会返回一个函数
  - 该函数用于记录创建仓库的方法，然后又返回一个函数

Redux中间件的基本原理

```js
const store = createStore(reducer);
let oldDispatch = store.dispatch;
store.dispatch = function (action) {
    console.log('中间件1', 'action：', action)
    console.log('旧数据：', store.getState())
    oldDispatch(action)
    console.log('新数据：', store.getState())
}

oldDispatch = store.dispatch;
store.dispatch = function (action) {
    console.log('中间件2', 'action：', action)
    console.log('旧数据：', store.getState())
    oldDispatch(action)
    console.log('新数据：', store.getState())
}
```

## 手写applyMiddleware

middleware的本质，是一个调用后可以得到dispatch创建函数的函数

compose：函数组合，将一个数组中的函数进行组合，形成一个新的函数，该函数调用时，实际上是反向调用之前组合的函数