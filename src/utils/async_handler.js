/*
const async_handler = (fn) => async (req, res, next) => {
   try {
      await fn(req, res, next)
   } catch (error) {
      res.status(error.code ||500).json({
         success: false,
         mesaage: error.mesaage
      })
   }
}
*/ 

const async_handler = (request_handler) => {                                        // async_handler takes a func and returns a new func
   (req, res, next) => {                                                            // this new function that takes req, res, next callbacks
      Promise.resolve(request_handler(req, res, next)).catch((err) => next(err))    // Executes the request_handler and catches any errors, passing them to next
   }
}

export {async_handler}