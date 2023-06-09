import React, { useState } from 'react'

export default function Test6() {
    console.log('Test6 render')
    const [n, setN] = useState(0);
    return (
        <div>
            <button onClick={() => {
                // setN(n-1)
                // setN(n-1)
                setN(prev => prev - 1);
                setN(prev => prev - 1);
            }}>-</button>
            <span>{n}</span>
            <button onClick={() => {
                // setN(n+1)
                // setN(n+1)
                setN(prev => prev + 1);
                setN(prev => prev + 1);
            }}>+</button>
        </div>
    )
}
