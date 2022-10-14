interface IResponseError {
    description?: string
    extra?: ( string | string[] )
    status: ( 400 | 401 | 403 | 404 )
    object?: object
}
interface IResponseSuccess {
    description: string,
    content?: any,
    status: 200
}


type typeParamsOrParams = {
    [key: string]: any
}

abstract class RequestEnity{
    params: typeParamsOrParams = {}
    body: typeParamsOrParams = {}
    verifyBodyToSchema(schema: any): string[]{
        let missing_fields = []
        for( let prop in schema){
            if(schema[prop].isRequired){
                if(this.body){
                    if(!this.body[prop] && typeof this.body[prop] != 'boolean')
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