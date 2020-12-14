const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)
    console.log('Des des')
    
module.exports =  asyncHandler