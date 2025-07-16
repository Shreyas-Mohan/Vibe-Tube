import dotenv from 'dotenv'
import connectdb from './db/db.js'
import { app } from './app.js'

dotenv.config({
   path: './env'
})
connectdb()
.then(()=>{
   app.listen(process.env.PORT, ()=>{
         console.log(`app is listening on port ${process.env.PORT}`);
      })
})
.catch((err)=>{console.log('mongo db connection failed.', err);
})
/*

(async ()=>{
   try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on('error',(error)=>{
         console.log('error', error);
         throw error
      })
      app.listen(process.env.PORT, ()=>{
         console.log(`app is listening on port ${process.env.PORT}`);
      })
   } catch (error) {
      console.error('error: ', error)
      throw error
   }
}) ()
*/