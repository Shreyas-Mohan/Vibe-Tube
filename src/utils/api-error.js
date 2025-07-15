class ApiError extends Error{
   constructor(
      statuscode,
      message = 'something went wrong',
      error =[],
      stack = ''
   ){
      super(message)               // it calls the constructor of the parent class (error) and passes the message argument
      this.statuscode = statuscode
      this.data = null
      this.message = message
      this.success = false
      this.errors = error

      if (stack){
         this.stack = stack
      } else{
         Error.captureStackTrace(this, this.constructor)
      }

   }
}

export {ApiError}