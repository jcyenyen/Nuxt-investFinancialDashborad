# 美股資訊網站 – Deeping Stock (鐵人賽 SideProject)

使用Nuxt3+HighChart+Tailwind，做出一個投資人會去逛的股票資訊圖表網站

![dondon](https://github.com/user-attachments/assets/5f042925-d30f-4fba-961d-21463d7831ee)

[Demo](https://jcyenyen.github.io/Nuxt-investFinancialDashborad)

# 作品說明

* 框架 : Nuxt3.js

* 技術及套件 : Tailwind / HighChart.js / element-plus / vue3-simple-typeahead/ nprogress /axios

* 專案簡述 :

  串接國外美股的Restful API，輔以簡約及線條感的方式將股票資訊圖表化呈現，使用者透過本網站後可輕易了解市場資訊，並比較出適合投資的股票標的。

* 頁面功能介紹 :
 
  1.首頁 : 股票預先輸入及搜尋(vue3-simple-typeahead)、科技類股價格走勢圖(HighChart的area圖表)、當日上漲下跌活躍前五名股票、市場新聞+篩選。

  2.個股頁(由首頁正上方搜尋or四大科技股公司名稱or股票篩選頁的股票代號點選進入) : HighChart個股技術指標圖表(MACD、SMA、OHLC等常用圖表，可任意做更換)、個股公司詳細資料、HighChart股票績效圖表(可以新增或刪除其他股票做為比較)。

  3.股票篩選 : 選擇篩選條件(市值、成交量、產業、Beta值、股息、股價)，用Table的方式條列出股票，漲跌幅及價格以不同顏色表示。

  4.股票熱區地圖 : 以HighChart的TreeMap格狀圖表呈現。將科技股分為11大類股，每個分類底下以格子顯示市值超過100億的公司。市值越高格子面積越大，並以顏色及數字顯示目前漲跌幅，使用者可以立即透過該圖迅速掌握市場類股強弱，進而選擇投資策略。


# 執行流程

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
