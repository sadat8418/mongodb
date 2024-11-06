const asyncHandler = (requestHandler)=> {
   return (req,res,next)=> {
     Promise.resolve(requestHandler(req,res,next)).catch
     ((err)=> next(err))   
    } //higher order functon, return o korte hoy, function k parameter er moto use kore 

}

export{ asyncHandler}