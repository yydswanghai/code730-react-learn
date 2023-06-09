import React, { Component } from 'react'

/**
 * 不加key的渲染效率会很低
 */

export default class App extends Component {
    state = {
        arr: [3, 5]
    }
    render() {
        const lis = this.state.arr.map(it => <li key={it}>{it}</li>)
        return (
            <div>
                <ul>{lis}</ul>
                <button onClick={() => {
                    var n = parseInt(Math.random() * 1000)
                    this.setState({
                        arr: [n, ...this.state.arr]
                    })
                }}>向数组第一项添加随机数</button>
            </div>
        )
    }
}