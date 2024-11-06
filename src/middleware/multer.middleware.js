import multer from "multer";
//middlewar ....
//req json , fie upload(multar middleware) , cb = callback
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp") //public/temp/.gitkeep
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})