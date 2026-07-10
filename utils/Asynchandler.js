const asyncHandler = (requesthandler_register) => {
    
    
    return (req, res, next) => {

    Promise.resolve(requesthandler_register(req, res, next))

        .catch((error) => {
            console.error("AsyncHandler caught error:", error);
            const statusCode = (typeof error.statuscode === 'number' && error.statuscode >= 100 && error.statuscode < 600)
                ? error.statuscode
                : (typeof error.code === 'number' && error.code >= 100 && error.code < 600)
                    ? error.code
                    : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        });
    }
};

export { asyncHandler };


//  const asyncHandler = ( async (req,res)=>
    
//     {
//     res.status(200).json({
//         message:"ok"
//                          })
//     }

    
 
// )       
 
//  => {
    
    
//     return (req, res, next) => {

//     Promise.resolve(requesthandler_register(req, res, next))

//         .catch((error) => {

//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             });

//         });
//     }
// };

// export { asyncHandler };


























// const asynchandler =(fn)=>async(req,res,next)=>{

//     try {
//         await fn (req,res,next)
//     } catch (error) {

//         res.status(error.code || 500).json(
//             {
//                 success:false,
//                 message:error.message

//             }
//         )
//     }

// }

// export {asynchandler}