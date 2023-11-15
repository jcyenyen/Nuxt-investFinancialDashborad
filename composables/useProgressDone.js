import Nprogress from 'nprogress'

export const useProgressDone = (attr) => {    
    watch((attr), (newAttr)=>{
        if(newAttr){
          Nprogress.done()
        }
    })
}