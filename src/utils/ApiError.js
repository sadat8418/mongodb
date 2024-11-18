class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors  //replace

        //production a kaje lage
        if (stack) {         //onek boro stack a error 
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor) //documentation a ase
        }

    }
}

export {ApiError}