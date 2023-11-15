// 死圖

const onError = (event) => {
    // 當圖片加載失敗時，可以把 src 設為空或者預設的佔位圖片
    // event.target.style.display = 'none';
    event.target.src = '/FTNT.png'
}

export default onError