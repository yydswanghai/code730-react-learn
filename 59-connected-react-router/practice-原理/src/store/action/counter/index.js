export const actionTypes = {
    increase: Symbol('increase'),
    decrease: Symbol('decrease'),
    asyncIncrease: Symbol('asyncIncrease'),
    asyncDecrease: Symbol('asyncDecrease'),
    autoIncrease: Symbol('autoIncrease'),
    stopIncrease: Symbol('stopIncrease')
}

export const increase = () => ({
    type: actionTypes.increase
})
export const decrease = () => ({
    type: actionTypes.decrease
})

export const asyncIncrease = () => ({
    type: actionTypes.asyncIncrease
})
export const asyncDecrease = () => ({
    type: actionTypes.asyncDecrease
})
export const autoIncrease = () => ({
    type: actionTypes.autoIncrease
})
export const stopIncrease = () => ({
    type: actionTypes.stopIncrease
})