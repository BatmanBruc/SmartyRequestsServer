import { Types } from 'mongoose';
import Request from '../models/requestModel';
import { Enity, IPagination, RejoinError, RejoinSuccess } from './enityService'
import { FIELD_REQUIRED, NOT_FOUND_REQUEST_ID, BAD_ID } from '../services/errorsService'

interface IRequestSerializer{
    id: string
    name: string;
    description: string;
    date: Date;
    [key: string]: any;
}

const RequestSerializer = (request: InstanceType<typeof Request>): IRequestSerializer=>{
    let requestSerializer: IRequestSerializer 
    requestSerializer = {
        id: request.id,
        name: request.name,
        description: request.description,
        date: request.date,
    }
    let obj = request.toObject()
    for(let key in obj){
        requestSerializer[key] = obj[key]
    }
    return requestSerializer
}

export type IRequestData = {
    name: string;
    description: string;
    date: Date;
    [key: string]: any;
}

interface RequestEnityType{
    verifyIsRequest(): Promise<RejoinError | Request>
    verifySetData(): Promise<RejoinError | true>
}

class RequestEnity extends Enity implements RequestEnityType{
    id?:string
    data?: IRequestData
    pagination?: IPagination
    constructor(params:{
        id?: string,
        data?: IRequestData,
        pagination?: IPagination
    }){
        super()
        this.id = params.id
        this.data = params.data
        this.pagination = params.pagination
    }
    async verifyIsRequest(){
        if(!this.id || !Types.ObjectId.isValid(this.id)){
            return new RejoinError({ 
                description: BAD_ID[0],
                content: this.id,
                status: BAD_ID[1]
            })
        }
        let request: Request | null = await Request.findById(this.id).exec()
        if(!request){
            return new RejoinError({ 
                description: NOT_FOUND_REQUEST_ID[0],
                content: this.id,
                status: NOT_FOUND_REQUEST_ID[1]
            })
        }
        return request
    }
    async verifySetData(){
        let missing_fields: Array<string> = this.verifyBodyToSchema(Request.schema.paths)
        if(missing_fields.length){
            return new RejoinError({
                description: FIELD_REQUIRED[0],
                content: missing_fields,
                status: FIELD_REQUIRED[1]
            })
        }
        return true
    }
}

export const RequestService = new class {
    async getOne(id: string){
        const requestEnity = new RequestEnity({id})
        let resultVerify: RejoinError | Request = await requestEnity.verifyIsRequest()
        if(resultVerify instanceof RejoinError)
            return resultVerify
    
        let request: IRequestSerializer = RequestSerializer(resultVerify)
        return new RejoinSuccess({
            content: request,
            status: 200
        })
    }
    async getList(limit: number, skip: number){
        let requests: Request[] = await Request.find().limit(limit).skip(skip).exec()
        let count: number = await Request.count().exec()
        let list: IRequestSerializer[] = []
        for (let request of requests) {
            let item = RequestSerializer(request)
            list.push(item)
        }
        return new RejoinSuccess({
            content: {
                list,
                count
            },
            status: 200
        })
    }
    async set(data: IRequestData){
        const requestEnity = new RequestEnity({data})
        let resultVerify: RejoinError | true | Request
    
        resultVerify = await requestEnity.verifySetData()
        if(resultVerify instanceof RejoinError)
            return resultVerify
    
        let request: Request = new Request(data)
        request.save()
        return new RejoinSuccess({
            description: 'Поле создано',
            content: request,
            status: 200
        })
    }
    async change(id: string, data: IRequestData){
        const requestEnity = new RequestEnity({id, data})
        let resultVerify: RejoinError | true | Request
    
        resultVerify = await requestEnity.verifySetData()
        if(resultVerify instanceof RejoinError)
            return resultVerify
        
        resultVerify = await requestEnity.verifyIsRequest()
            if(resultVerify instanceof RejoinError)
                return resultVerify
    
        let request: Request = resultVerify
        for( let prop in data ){
            request.set(prop, data[prop])
        }
        await request.save()
        return new RejoinSuccess({
            description: 'Заявка изменена',
            content: request,
            status: 200
        })
    }
    async delete(id: string){
        const requestEnity = new RequestEnity({id})
        let resultVerify: RejoinError | true | Request
        
        resultVerify = await requestEnity.verifyIsRequest()
            if(resultVerify instanceof RejoinError)
                return resultVerify
    
        let request: Request = resultVerify
        request.remove()
        return new RejoinSuccess({
            description: 'Удалена заявка: ',
            content: request,
            status: 200
        })
    }

}