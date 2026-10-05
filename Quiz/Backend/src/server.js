const app=require('./app')
const {env}=require('./config/env')
const {connectDatabase}=require('./config/db')
async function start(){
 await connectDatabase(env.MONGODB_URI)
 app.listen(env.PORT,()=>console.log(`Quiz API listening on port ${env.PORT}`))
}
start().catch(error=>{console.error('Quiz API failed to start',error);process.exit(1)})
