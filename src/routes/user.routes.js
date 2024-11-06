import {Router} from "express";
import { registerUser }  from "../controllers/user3.controller.js"; 
//emon import tokhon e nite johon export default na ...
import { upload } from "../middleware/multer.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([//images send korte parbo
    {
        name:"avatar",
        maxCount: 1

    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),
registerUser
)  ///register hit hoile tokhon  method call korbo, naile kisui korbo na

export default router //yes default export, app.js a icca moto naam deya jabe 