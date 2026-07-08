class apierror extends error{

    constructor(statuscode,message="something went wrong ",errors=[],
        statck=""
    )
    {
super(message)
this.statuscode=statuscode
this.data=null
this.message=message
this.success=false;
this.error=errors

if(statck){
    this.statck=statck
}else{
    this.error.captureStackTrace(this,this.constructor)
}
    }
}

export {apierror}