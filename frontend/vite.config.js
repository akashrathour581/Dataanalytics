import react from '@vitejs/plugin-react'
import {defineConfig,loadEnv} from 'vite'
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 return {plugins:[react()],define:{'import.meta.env.VITE_ADS_ENABLED':JSON.stringify(process.env.ADS_ENABLED||env.ADS_ENABLED||env.VITE_ADS_ENABLED||'false')},server:{port:5173,proxy:{'/api':{target:'http://127.0.0.1:8000',changeOrigin:true,configure(proxy){proxy.on('proxyReq',req=>req.setHeader('Origin','http://127.0.0.1:8000'));}}}}};
})
