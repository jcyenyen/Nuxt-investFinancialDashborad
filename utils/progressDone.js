import Nprogress from 'nprogress'

export const progressDone = (attr) => {    
    watch((attr), (newAttr)=>{
        if(newAttr){
          Nprogress.done()
        }
    })
}