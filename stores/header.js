import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePathStore = defineStore('path',()=>{
    const path = ref('index')

    return {path}
})