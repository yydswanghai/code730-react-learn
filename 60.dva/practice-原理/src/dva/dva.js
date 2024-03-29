import React from 'react'
import reactDom from 'react-dom'
import { Provider } from 'react-redux'
import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import * as sagaEffects from './saga'
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'

/**
 * 创建dva对象
 * @param {object} opt
 */
export default function(opt = {}) {
    const app = {
        model,
        _models: [],
        router,
        _router: null,
        start,
        use
    }
    const options = _getOptions();
    return app;

    /**
     * 使用dva插件
     * @param {*} plugin 配置对象
     */
    function use(plugin) {
        options = { ...options, ... plugin }
    }
    /**
     * 得到配置
     * @descirpt history: {history} 如果没有就使用hashHistory创建一个
     * @descirpt initialState: {*} 默认状态
     * @descirpt onAction: {Object|Array} 可以配置redux中间件
     * @descirpt onError: {(err, dispatch) => {}} 错误的时候运行该函数
     * @descirpt onStateChange: {() => {}} 仓库的状态(rootState)发生改变时，运行
     * @descirpt onReducer: {(reducer) => (state, action) => reducer(state, action)} 对reducer进一步封装用的函数，参数为一个reducer，需要返回一个新的reducer
     * @descirpt onEffect: {(oldEffect, sagaEffect, model, actionType) => generatorFn(action)} 对effect的进一步封装，需要返回一个生成器函数
     * @descirpt extraReducers: {Object} 配置额外的reducer
     * @descirpt extraEnhancers: {Array} 用于封装createStore函数的
     */
    function _getOptions() {
        return {
            history: opt.history || createHashHistory(),
            initialState: opt.initialState === undefined ? {} : opt.initialState,
            onAction: opt.onAction ? (Array.isArray(opt.onAction) ? opt.onAction : [opt.onAction]) : [],
            onError: opt.onError || (() => {}),
            onStateChange: opt.onStateChange || (() => {}),
            onReducer: opt.onReducer || (reducer => (state, action) => reducer(state, action)),
            onEffect: opt.onEffect,
            extraReducers: opt.extraReducers || {},
            extraEnhancers: opt.extraEnhancers || []
        }
    }
    /**
     * 根据模型对象定义模型
     * @param {{
     * namespace:*,
     * state:*,
     * reducers:object,
     * effects:object,
     * subscriptions:object}} modelObj
     */
    function model(modelObj) {
        app._models.push(modelObj);
    }
    /**
     * 传入一个路由函数，该函数返回路由配置
     * @param {(app,history) => JSX.Element} routerFunc
     */
    function router(routerFunc) {
        app._router = routerFunc;
    }
    /**
     * 启动函数
     * @param {string} selector 选择器
     */
    function start(selector) {
        const store = _getStore();
        _runSubScripttions(store.dispatch);
        _render(selector, store);
    }
    function _render(selector, store) {
        const routerConfig = app._router({
            app,
            history: options.history
        });
        const root = <Provider store={store}>
            {routerConfig}
        </Provider>
        reactDom.render(root, document.querySelector(selector));
    }
    /**
     * 得到仓库，需要reducer
     * reducer从model里获取
     */
    function _getStore() {
        let rootReducerObj = {};
        app._models.forEach(model => {
            let { name, reducer } = _transformReducer(model);
            rootReducerObj[name] = reducer;
        })
        rootReducerObj = { ...rootReducerObj, ..._getExtraReducers() };
        // 合并所有的reducer
        let rootReducer = combineReducers(rootReducerObj);
        const oldReducer = rootReducer;
        // 封装onStateChange
        // rootReducer = combineReducers(reducers) => (state, action) => { 状态: xxx }
        // 因为需要newState，只能通过重新改写rootReducer，调用rootReducer(state, action)先拿到状态
        rootReducer = function(state, action) {
            const newState = oldReducer(state, action);
            options.onStateChange(newState);
            return newState;
        }
        // 封装onReducer
        const oldReducer2 = rootReducer;
        rootReducer = options.onReducer(oldReducer2);

        // 封装 fn1 => fn2 => create
        const newCreateStore = options.extraEnhancers.reduce((fn1, fn2) => {
            return fn2(fn1)
        }, createStore)

        const store = newCreateStore(rootReducer, options.initialState, _getMiddlewares());
        _getMiddlewares.runSaga(store);// 运行saga
        // window.store = store
        return store;
    }
    /**
     * 将一个模型转换为包含reducer的对象
     * @param {{name:string, reducer:Function}} model 模型
     */
    function _transformReducer(model) {
        if(!model.namespace){
            throw new Error(`模型${model}里，必须要有 namespace`)
        }
        if(model.state === undefined || model.state === null){
            throw new Error(`模型${model}里，必须要有 state`)
        }
        const actionTypes = [];
        if(model.reducers){
            Object.keys(model.reducers).forEach(actionType => {
                actionTypes.push({
                    type: `${model.namespace}/${actionType}`,// 匹配的action类型
                    reducerFn: model.reducers[actionType]// 匹配后运行的reducer处理函数
                });
            })
        }
        return {
            name: model.namespace,
            reducer(state = model.state, action){
                const temp = actionTypes.find(it => it.type === action.type);
                if(temp){// 匹配上相应的类型，运行对应的函数
                    return temp.reducerFn(state, action)
                }else{
                    return state;
                }
            }
        }
    }
    /**
     * 中间件
     */
    function _getMiddlewares() {
        const saga = createSagaMiddleware();
        _getMiddlewares.runSaga = function(store) {// 将saga.run加入到静态方法里
            let arr = [];// 保存副作用函数的数据
            app._models.forEach(model => {
                // 改造put方法，让它与模型关联
                // {type:'increase'} => {type:'counter/increase'}
                const put = function(action) {
                    const newAction = _getNewAction(action, model);
                    return sagaEffects.put(newAction);
                }
                if(model.effects){
                    Object.keys(model.effects).forEach(actionType => {
                        arr.push({
                            type: `${model.namespace}/${actionType}`,
                            generatorFn: model.effects[actionType],
                            put,
                            model
                        })
                    })
                }
            })
            // 处理副作用
            saga.run(function*() {
                for (const item of arr) {
                    // 因为takeEvery里的回调生成器函数只有一个action参数，但是使用的时候需要两个参数，所以重新封装一下
                    // effects: { actionType: function(action, sagaEffect){} }
                    let generatorFn = function*(action) {
                        try {
                            yield item.generatorFn(action, { ...sagaEffects, put: item.put })
                        } catch (err) {
                            options.onError(err, store.dispatch)
                        }
                    }
                    // 封装onEffect
                    if(options.onEffect){
                        let oldEffect = generatorFn;
                        generatorFn = options.onEffect(oldEffect, sagaEffects, item.model, item.type)
                    }
                    yield sagaEffects.takeEvery(item.type, generatorFn)
                }
            })
        }
        return composeWithDevTools(applyMiddleware(
            routerMiddleware(options.history),
            saga,
            ...options.onAction
        ));
    }
    /**
     * 将action的类型绑定到模型
     * @param {*} action
     * @param {*} model
     */
    function _getNewAction(action, model) {
        return {
            ...action,
            type: action.type.includes(`${model.namespace}/`) ?
                action.type :
                `${model.namespace}/${action.type}`
        }
    }
    /**
     * 得到一些额外的reducer，会合并到根reducer中去
     */
    function _getExtraReducers() {
        return {
            router: connectRouter(options.history),
            /* eslint-disable */
            ['@@dva'](state = 0, action){
                return state;
            },
            ...options.extraReducers
        }
    }
    /**
     * 运行注册函数
     */
    function _runSubScripttions(dispatch) {
        app._models.forEach(model => {
            // 改造dispatch方法，让它与模型关联
            const newDispatch = function(action) {
                const newAction = _getNewAction(action, model);
                return dispatch(newAction);
            }
            if(model.subscriptions){
                Object.keys(model.subscriptions).forEach(prop => {
                    const fn = model.subscriptions[prop];
                    fn({ dispatch: newDispatch, history: options.history })
                })
            }
        })
    }
}