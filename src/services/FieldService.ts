import { Types } from 'mongoose';
import { Field } from '../models/fieldModel'
import Request from '../models/requestModel'
import { FIELD_REQUIRED, NOT_FOUND_FIELD_ID, FIELD_ALREADY_EXISTS, BAD_ID } from './errorsService'
import { RequestEnity, ResponseError, ResponseSuccess } from './requestService'

const enum InputTypes {
    INPUT,
    TEXTAREA,
    CHECKBOX,
    SELECT,
    DATEPICKER
}

interface IFieldSerializer{
    id: string
    title: string
    name: string
    inputType: InputTypes
    required: boolean
    default?: any,
    options?: Array<string>
}

const FieldSerializer = (field: Field): IFieldSerializer =>{
    return {
        id: field.id,
        title: field.title,
        name: field.name,
        inputType: field.inputType,
        default: field.default,
        required: field.required,
        options: field.options
    }
}

export type IFieldData = {
    title: string,
    name: string,
    required: boolean,
    inputType: InputTypes,
    default?: string,
    options?: string[]
}

export type IFieldPagination = {
    limit: number;
    skip: number;
}

interface FieldRequestEnityType{
    verifyIsField(): Promise<ResponseError | Field>
    verifySetField(): Promise<ResponseError | true>
    verifyChangeField(): Promise<ResponseError | Field>

    // getOne(): Promise<ResponseError | ResponseSuccess>
    // getList(): Promise<ResponseError | ResponseSuccess>
    // setField(): Promise<ResponseError | ResponseSuccess>
    // deleteField(): Promise<ResponseError | ResponseSuccess>
}

class FieldRequestEnity extends RequestEnity implements FieldRequestEnityType{
    id?:string
    data?: IFieldData
    pagination?: IFieldPagination
    constructor(params:{
        id?: string,
        data?: IFieldData,
        pagination?: IFieldPagination
    }){
        super()
        this.id = params.id
        this.data = params.data
        this.pagination = params.pagination
    }
    async verifyIsField(){
        if(!this.id || !Types.ObjectId.isValid(this.id)){
            return new ResponseError({ 
                description: BAD_ID[0],
                content: this.id,
                status: BAD_ID[1]
            })
        }
        let field = await Field.findById(this.id).exec()
        if(!field){
            return new ResponseError({ 
                description: NOT_FOUND_FIELD_ID[0],
                content: this.id,
                status: NOT_FOUND_FIELD_ID[1]
            })
        }
        return field
    }
    async verifySetField(){
        let missing_fields = this.verifyBodyToSchema(Field.schema.paths)
        if(missing_fields.length){
            return new ResponseError({
                description: FIELD_REQUIRED[0],
                content: missing_fields,
                status: FIELD_REQUIRED[1]
            })
        }
        let field = null
        field = await Field.exists({name: this.data.name})
        if(field){
            return new ResponseError({
                description: FIELD_ALREADY_EXISTS[0],
                content: this.data.name,
                status: FIELD_ALREADY_EXISTS[1]
            })
        }
        return true
    }
    async verifyChangeField(){
        if(!this.id || !Types.ObjectId.isValid(this.id)){
            return new ResponseError({ 
                description: BAD_ID[0],
                content: this.id,
                status: BAD_ID[1]
            })
        }
        let field = await Field.findById(this.id).exec()
        if(!field){
            return new ResponseError({ 
                description: NOT_FOUND_FIELD_ID[0],
                content: this.id,
                status: NOT_FOUND_FIELD_ID[1]
            })
        }
        let missing_fields: Array<string> = this.verifyBodyToSchema(Field.schema.paths)
        if(missing_fields.length){
            return new ResponseError({
                description: FIELD_REQUIRED[0],
                content: missing_fields,
                status: FIELD_REQUIRED[1]
            })
        }
        return field
    }
}


export const FieldService =  new class {
    async getOne(id: string){
        let result = await (new FieldRequestEnity({id})).verifyIsField()
        if(result instanceof ResponseError){
            return result
        }else{
            let field = FieldSerializer(result)
            return new ResponseSuccess({
                content: field,
                status: 200
            })
        }
    }
    async getList(limit: number, skip: number){
        let fields = await Field.find().limit(limit).skip(skip).exec()
        let list = []
        for (let field of fields) {
            let item = await FieldSerializer(field)
            list.push(item)
        }
        let count = await Field.count().exec()
        return new ResponseSuccess({
            content: {
                list: list,
                count: count
            },
            status: 200
        })
    }
    async setField(data: IFieldData) {
        let result = await (new FieldRequestEnity({data})).verifySetField()
        if(result instanceof ResponseError)
            return result
    
        let field = new Field(data)
        await field.save()
        Request.updateExtraFields()
        let content = await FieldSerializer(field)
        return new ResponseSuccess({
            description: 'Поле создано',
            content: content,
            status: 200
        })
    }
    async changeField(id: string, data: IFieldData){    
        let result = await (new FieldRequestEnity({id, data})).verifyChangeField()
        if(result instanceof ResponseError)
            return result
    
        let field = result
        field.name = data.name
        field.inputType = data.inputType
        field.required = data.required
        field.options = data.options
        field.default = data.default
        await field.save()
        Request.updateExtraFields()
        let content = FieldSerializer(field)
        return new ResponseSuccess({
            description: 'Поле изменено',
            content: content,
            status: 200
        })
    }
    async deleteField(id: string){
        let result: ResponseError | Field = await (new FieldRequestEnity({id})).verifyIsField()
        if(result instanceof ResponseError)
            return result
    
        await result.remove()
        Request.updateExtraFields()
        let content = await FieldSerializer(result)
        return new ResponseSuccess({
            description: 'Удалено поле: ',
            content: content,
            status: 200
        })
    }
}