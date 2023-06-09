# 起步

直接在页面上使用React，引用下面的JS

```html
<!-- React的核心库，与宿主环境无关 -->
<script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
<!-- 依赖核心库，将核心的功能与页面结合 -->
<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
<!-- 编译JSX -->
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
```

## React.createElement

创建一个React元素，称作虚拟DOM，本质上是一个对象

1. 参数1：元素类型，如果是字符串，一个普通的HTML元素
2. 参数2：元素的属性，一个对象
3. 后续参数：元素的子节点

## JSX

JS的扩展语法，需要使用babel进行转义。

# 使用脚手架搭建工程

官方：create-react-app 第三方：next.js、umijs

凡是使用JSX的文件，必须导入React

# 开发环境搭建

## VSCode配置

emmet配置：

```json
"javascript": "javascriptreact"
```

## VSCode插件安装

- ESLint：代码风格检查
- ES7 React/Redux/GraphQL/React-Native snippets：快速代码编写

## Chrome插件安装

React Developer Tools