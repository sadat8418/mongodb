import multer from "multer";
//middlewar ....
//req json , fie upload(multer middleware) , cb = callback

const storage = multer.diskStorage({  //storage method ..
    destination: function (req, file, cb) {
      cb(null, "./public/temp") //public/temp/.gitkeep
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname) //user ja naam rakhse  tai rakhbo
    }
  })
  
export const upload = multer({ 
    storage,          //ES6 a storage:storage lekhar dorkar pore na ... 
})


/* gothub/ expressjs/multer
const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()

app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})

app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
})

const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
app.post('/cool-profile', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
})

*/