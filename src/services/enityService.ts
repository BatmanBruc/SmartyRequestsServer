import { SchemaType } from 'mongoose'

interface IRejoin {
    description?: string
    content?: any
    status: number
}

interface IRejoinError extends IRejoin {
    status: ( 400 | 401 | 403 | 404 )
}
interface IRejoinSuccess extends IRejoin {
    status: 200
}

export abstract class Rejoin{
    description?: string
    content?: any
    status: number
    constructor(data: IRejoin){
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

export class RejoinError extends Rejoin{
    status: ( 400 | 401 | 403 | 404 )
    constructor(data: IRejoinError){
        super(data)
    }
}
export class RejoinSuccess extends Rejoin{
    status: 200
    constructor(data: IRejoinSuccess){
        super(data)
    }
}


type typeParamsOrParams = {
    [key: string]: any
}

abstract class Enity{
    data?: typeParamsOrParams = {}
    verifyBodyToSchema(schema: {
        [key: string]: SchemaType<any>;
    }): string[]{
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


export type IPagination = {
    limit: number;
    skip: number;
}

export {
    IRejoinError,
    IRejoinSuccess,
    Enity,
    typeParamsOrParams
}