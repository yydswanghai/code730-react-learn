import React from 'react'
import useReducer from './useReducer'

/**
 * 自实现 useReducer
 */

const reducer = (state, action) => {
    switch (action.type) {
        case 'increase':
            return state + 1;
        case 'decrease':
            if(state === 0){
                return 0;
            }
            return state - 1;
        default:
            return state;
    }
}

export default function Test() {
    const [n, dispatch] = useReducer(reducer, 0, (args) => 10);

    return (
        <div>
            <button onClick={() => {
                dispatch({ type: 'increase' })
            }}>+</button>
            <span>{n}</span>
            <button onClick={() => {
                dispatch({ type: 'decrease' })
            }}>-</button>
        </div>
    )
}