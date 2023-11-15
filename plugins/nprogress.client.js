import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

export default defineNuxtPlugin((nuxtApp) => {

    Nprogress.configure({ showSpinner: false, ease: 'ease', speed: 500 })

    // 路由事件開始進度條
    nuxtApp.$router.beforeEach((to, from, next) => {
        Nprogress.start();
        next();
    });

})