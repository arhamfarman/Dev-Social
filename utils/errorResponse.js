class ErrorResponse extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        console.log('err respo 5');
    }
   
}
module.exports =  ErrorResponse