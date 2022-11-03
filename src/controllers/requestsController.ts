import { Types } from 'mongoose';
import Request from '../models/requestModel';
import { IResponseSuccess, RequestEnity, typeParamsOrParams } from '../services/requestsService'
import { FIELD_REQUIRED, NOT_FOUND_REQUEST_ID, BAD_ID } from '../services/errorsService'

interface RequestSerializerType{
    id: string
    name: string;
    description: string;
    date: Date;
    [key: string]: any;
}

const RequestSerializer = (request: InstanceType<typeof Request>): RequestSerializerType=>{
    let requestSerializer: RequestSerializerType 
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

type BodySetData = {
    name: string;
    description: string;
    date: Date;
    [key: string]: any;
}

type BodyGetParams = {
    limit: number;
    skip: number;
}

class RequestRequestEnity extends RequestEnity{
    constructor(body: BodySetData | BodyGetParams, params: {
        id?: string
    }){
        super()
        this.body = body
        this.params = params
    }
    async verifyChangeRequest(schema: any, res: any): Promise<false | { data: typeParamsOrParams, request: InstanceType<typeof Request> }>{
        let request: ( InstanceType<typeof Request> | null ) = null
        request = await Request.findById(this.params.id).exec()
        if(!request){
            res.status(NOT_FOUND_REQUEST_ID[1])
            res.send({ 
                description: NOT_FOUND_REQUEST_ID[0],
                extra: this.params.id,
                status: NOT_FOUND_REQUEST_ID[1]
            })
            return false
        }
        let missing_fields: Array<string>  = this.verifyBodyToSchema(schema)
        if(missing_fields.length){
            res.status(FIELD_REQUIRED[1])
            res.send({
                description: FIELD_REQUIRED[0],
                extra: missing_fields,
                status: FIELD_REQUIRED[1]
            })
            return false
        }
        return { data: this.body, request }
    }
    async verifyIsRequest(schema: any, res: any): Promise<false | InstanceType<typeof Request>>{
        if(!this.params.id || !Types.ObjectId.isValid(this.params.id)){
            res.status(BAD_ID[1])
            res.send({ 
                description: BAD_ID[0],
                extra: this.params.id,
                status: BAD_ID[1]
            })
            return false
        }
        let request: ( InstanceType<typeof Request> | null ) = null
        request = await Request.findById(this.params.id).exec()
        if(!request){
            res.status(NOT_FOUND_REQUEST_ID[1])
            res.send({ 
                description: NOT_FOUND_REQUEST_ID[0],
                extra: this.params.id,
                status: NOT_FOUND_REQUEST_ID[1]
            })
            return false
        }
        return request
    }
}
const getRequest = async (req: any, res: any)=>{
    const requestRequest = new RequestRequestEnity(req.body, req.params)
    let request = await requestRequest.verifyIsRequest(Request.schema.obj, res)
    if(!request) return
    let content = RequestSerializer(request)
    res.send(content)
}
const getRequests = async (req: any, res: any)=>{
    const requestRequest = new RequestRequestEnity(req.body, req.params)
    let requests = await Request.find().limit(requestRequest.body.limit).skip(requestRequest.body.skip).exec()
    let count = await Request.count().exec()
    let list = []
    for (let request of requests) {
        let item = RequestSerializer(request)
        list.push(item)
    }
    res.send({
        list: list,
        count: count
    })
}

const setRequest = async (req: any, res: any)=>{
    const requestRequest = new RequestRequestEnity(req.body, req.params)
    const missing_fields = requestRequest.verifyBodyToSchema(Request.schema.paths)
    if(missing_fields.length){
        res.status(FIELD_REQUIRED[1])
        res.send({
            description: FIELD_REQUIRED[0],
            extra: missing_fields,
            status: FIELD_REQUIRED[1]
        })
        return false
    }
    let request = new Request(requestRequest.body)
    request.save()
    res.status(200)
    res.send({
        description: 'Поле создано',
        content: request,
        status: 200
    })
}
const changeRequest = async (req: any, res: any)=>{
    const requestRequest = new RequestRequestEnity(req.body, req.params)
    let result = await requestRequest.verifyChangeRequest(Request.schema.paths, res)
    if(!result) return

    let request = result.request
    let data = result.data
    for( let prop in data ){
        request.set(prop, data[prop])
    }
    await request.save()

    let response: IResponseSuccess = {
        description: 'Заявка изменена',
        content: request,
        status: 200
    }
    res.send(response)
}
const deleteRequest = async (req: any, res: any)=>{
    const requestRequest = new RequestRequestEnity(req.body, req.params)
    let request = await requestRequest.verifyIsRequest(Request.schema.obj, res)
    if(!request) return 
    request.remove()
    let response: IResponseSuccess = {
        description: 'Удалена заявка: ',
        content: request,
        status: 200
    }
    res.send(response)
}
export {
    getRequest,
    getRequests,
    setRequest,
    changeRequest,
    deleteRequest
}