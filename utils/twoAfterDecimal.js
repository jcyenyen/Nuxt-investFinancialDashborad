// 取到小數後兩位

const twoAfterDecimal = (num) => {
    num = Math.round(num * 100) / 100
    return num
}

export default twoAfterDecimal