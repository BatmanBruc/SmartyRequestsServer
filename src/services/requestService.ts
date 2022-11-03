interface IResponse {
    description?: string
    content?: any
    status: number
}

interface IResponseError extends IResponse {
    status: ( 400 | 401 | 403 | 404 )
}
interface IResponseSuccess extends IResponse {
    status: 200
}

abstract class Response{
    description?: string
    content?: any
    status: number
    constructor(data: IResponse){
        this.description = data.description
        this.content = data.content
        this.status = data.status
    }
    getStatus(){
        return this.status;
    }
    get(){
        return {
            description: this.description,
            content: this.content
        }
    }
}

export class ResponseError extends Response{
    status: ( 400 | 401 | 403 | 404 )
    constructor(data: IResponseError){
        super(data)
    }
}
export class ResponseSuccess extends Response{
    status: 200
    constructor(data: IResponseSuccess){
        super(data)
    }
}


type typeParamsOrParams = {
    [key: string]: any
}

abstract class RequestEnity{
    data?: typeParamsOrParams = {}
    verifyBodyToSchema(schema: any): string[]{
        let missing_fields = []
        for( let prop in schema){
            if(schema[prop].isRequired){
                if(this.data){
                    if(!this.data[prop] && typeof this.data[prop] != 'boolean')
                        missing_fields.push(prop)
                }
            }
        }
        return missing_fields
    }
}
export {
    IResponseError,
    IResponseSuccess,
    RequestEnity,
    typeParamsOrParams
}