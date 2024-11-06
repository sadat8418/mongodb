import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//cors ...cross origin resourse sharing 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//body parser lage na ekhon, json text express porte pare .. kintu file porte "multer" lage 
app.use(express.json({limit:"16kb"}))


//urlencoded mane ARif+20% .. encodded ase ...
app.use(express.urlencoded({extended:true, limit:"16kb"}))
//public asset ...jodi images kisu public asset (folder) a rakhte chai ...sobai dekhbe ...
app.use(express.static("public"))
app.use(cookieParser())

//routers import 
// icca moto naam tokhon e deya jay jokhon export default hoy 
import userRouter from './routes/user.routes.js'

//app.get route kaj korbe na , app.use likte hoy ...
//app.use("/users", userRouter)
app.use("/api/v1/users", userRouter)
//http://localhost:8000/api/v1/users/register
export { app }