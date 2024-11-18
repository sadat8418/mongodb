const asyncHandler = (requestHandler)=> {
   return (req,res,next)=> {
     Promise.resolve(requestHandler(req,res,next)).catch
     ((err)=> next(err))   
    } //higher order functon, return o korte hoy, function k parameter er moto use kore 

}

export{ asyncHandler}

/* try catch ... upore promise ...
 const asyncHandler = () => {}
 const asyncHandler = (func) => () => {}
 const asyncHandler = (func) => async () => {}


 const asyncHandler = (fn) => async (req, res, next) => {
     try {
         await fn(req, res, next)    
     } catch (error) {
         res.status(err.code || 500).json({    //err.code jodi আসে user theke naile 500
             success: false,
             message: err.message
         })
     }
 }

*/