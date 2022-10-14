import { Types } from 'mongoose';
import Field from '../models/fieldModel'
import Request from '../models/requestModel'
import { FIELD_REQUIRED, NOT_FOUND_FIELD_ID, FIELD_ALREADY_EXISTS, BAD_ID } from '../services/errorsService'
import { IResponseSuccess, RequestEnity, typeParamsOrParams } from '../services/requestsService'

const enum InputTypes {
    INPUT,
    TEXTAREA,
    CHECKBOX,
    SELECT,
    DATEPICKER
}

interface FieldSerializerType{
    id: string
    title: string
    name: string
    inputType: InputTypes
    required: boolean
    default?: any,
    options?: Array<string>
}

const FieldSerializer = async (field: InstanceType<typeof Field>): Promise<FieldSerializerType> =>{
    let fieldSerializer: FieldSerializerType
    fieldSerializer = {
        id: field.id,
        title: field.title,
        name: field.name,
        inputType: field.inputType,
        default: field.default,
        required: field.required,
        options: field.options
    }
    return fieldSerializer
}

type BodySetData = {
    title: string,
    name: string,
    required: boolean,
    typeInput: InputTypes,
    default?: string,
    options?: string[]
}

type BodyGetParams = {
    limit: number;
    skip: number;
}

class FieldRequestEnity extends RequestEnity{
    constructor(body: BodySetData | BodyGetParams, params: {
        id?: string
    }){
        super()
        this.body = body
        this.params = params
    }
    async verifySetField(schema: any, res: any): Promise<false | typeParamsOrParams>{
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
        let field: ( object | null ) = null
        field = await Field.exists({name: this.body.name})
        if(field){
            res.status(FIELD_ALREADY_EXISTS[1])
            res.send({
                description: FIELD_ALREADY_EXISTS[0],
                extra: this.body.name,
                status: FIELD_ALREADY_EXISTS[1]
            })
            return false
        }
        return this.body
    }
    async verifyChangeField(schema: any, res: any): Promise<false | { data: typeParamsOrParams, field: InstanceType<typeof Field> }>{
        if(!this.params.id || !Types.ObjectId.isValid(this.params.id)){
            res.status(BAD_ID[1])
            res.send({ 
                description: BAD_ID[0],
                extra: this.params.id,
                status: BAD_ID[1]
            })
            return false
        }
        let field: ( InstanceType<typeof Field> | null ) = null
        //let fieldObject: 
        field = await Field.findById(this.params.id).exec()
        if(!field){
            res.status(NOT_FOUND_FIELD_ID[1])
            res.send({ 
                description: NOT_FOUND_FIELD_ID[0],
                extra: this.params.id,
                status: NOT_FOUND_FIELD_ID[1]
            })
            return false
        }
        let missing_fields: Array<string> = this.verifyBodyToSchema(schema)
        if(missing_fields.length){
            res.status(FIELD_REQUIRED[1])
            res.send({
                description: FIELD_REQUIRED[0],
                extra: missing_fields,
                status: FIELD_REQUIRED[1]
            })
            return false
        }
        return { data: this.body, field }
    }
    async verifyRemoveField(schema: any, res: any): Promise<false | InstanceType<typeof Field>>{
        if(!this.params.id || !Types.ObjectId.isValid(this.params.id)){
            res.status(BAD_ID[1])
            res.send({ 
                description: BAD_ID[0],
                extra: this.params.id,
                status: BAD_ID[1]
            })
            return false
        }
        let field: ( InstanceType<typeof Field> | null ) = null
        field = await Field.findById(this.params.id).exec()
        if(!field){
            res.status(NOT_FOUND_FIELD_ID[1])
            res.send({ 
                description: NOT_FOUND_FIELD_ID[0],
                extra: this.params.id,
                status: NOT_FOUND_FIELD_ID[1]
            })
            return false
        }
        return field
    }
}
const getFields = async (req: any, res: any)=>{
    const fieldRequest = new FieldRequestEnity(req.body, req.params)
    let fields = await Field.find().limit(fieldRequest.body.limit).skip(fieldRequest.body.skip).exec()
    let list: Array<FieldSerializerType> = []
    for (let field of fields) {
        let item = await FieldSerializer(field)
        list.push(item)
    }
    let count: number = await Field.count().exec()
    res.send({
        list: list,
        count: count
    })
}
const setField = async (req: any, res: any)=>{
    const fieldRequest = new FieldRequestEnity(req.body, {})
    let data = await fieldRequest.verifySetField(Field.schema.paths, res)
    if(!data)
        return

    let field = new Field(data)
    await field.save()
    Request.updateExtraFields()
    let content = await FieldSerializer(field)
    let result: IResponseSuccess = {
        description: 'Поле создано',
        content: content,
        status: 200
    }
    res.send(result)
}

const changeField = async (req: any, res: any)=>{
    const fieldRequest = new FieldRequestEnity(req.body, req.params)

    let result = await fieldRequest.verifyChangeField(Field.schema.obj, res)
    if(!result) return

    let field = result.field
    let data = result.data
    field.name = data.name
    field.inputType = data.inputType
    field.required = data.required
    field.options = data.options
    field.default = data.default
    await field.save()
    Request.updateExtraFields()
    let content = await FieldSerializer(field)
    let response: IResponseSuccess = {
        description: 'Поле изменено',
        content: content,
        status: 200
    }
    res.send(response)
}

const deleteField = async (req: any, res: any)=>{
    const fieldRequest = new FieldRequestEnity(req.body, req.params)
    let field = await fieldRequest.verifyRemoveField(Field.schema.obj, res)
    if(!field) return 
    await field.remove()
    Request.updateExtraFields()
    let content = await FieldSerializer(field)
    let response: IResponseSuccess = {
        description: 'Удалено поле: ',
        content: content,
        status: 200
    }
    res.send(response)
}
export {
    setField,
    changeField,
    deleteField,
    getFields
}