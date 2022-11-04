import { Types } from 'mongoose';
import { Field } from '../models/fieldModel'
import Request from '../models/requestModel'
import { FIELD_REQUIRED, NOT_FOUND_FIELD_ID, FIELD_ALREADY_EXISTS, BAD_ID } from './errorsService'
import { Enity, Rejoin, RejoinError, RejoinSuccess } from './enityService'

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

class FieldEnity extends Enity{
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
    async verifyIsField(): Promise<RejoinError | Field>{
        if(!this.id || !Types.ObjectId.isValid(this.id)){
            return new RejoinError({ 
                description: BAD_ID[0],
                content: this.id,
                status: BAD_ID[1]
            })
        }
        let field: Field | null = await Field.findById(this.id).exec()
        if(!field){
            return new RejoinError({ 
                description: NOT_FOUND_FIELD_ID[0],
                content: this.id,
                status: NOT_FOUND_FIELD_ID[1]
            })
        }
        return field
    }
    async verifySetField(): Promise<RejoinError | true>{
        let field: { _id: Types.ObjectId } | null = await Field.exists({name: this.data.name})
        if(field){
            return new RejoinError({
                description: FIELD_ALREADY_EXISTS[0],
                content: this.data.name,
                status: FIELD_ALREADY_EXISTS[1]
            })
        }
        return true
    }
    async verifySetData(): Promise<RejoinError | true>{
        let missing_fields: Array<string> = this.verifyBodyToSchema(Field.schema.paths)
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


export const FieldService =  new class {
    async getOne(id: string): Promise<Rejoin>{
        let result: RejoinError | Field = await (new FieldEnity({id})).verifyIsField()
        if(result instanceof RejoinError){
            return result
        }else{
            let field: IFieldSerializer = FieldSerializer(result)
            return new RejoinSuccess({
                content: field,
                status: 200
            })
        }
    }
    async getList(limit: number, skip: number): Promise<Rejoin>{
        let fields: Field[] = await Field.find().limit(limit).skip(skip).exec()
        let list: IFieldSerializer[] = []
        for (let field of fields) {
            let item = await FieldSerializer(field)
            list.push(item)
        }
        let count: number = await Field.count().exec()
        return new RejoinSuccess({
            content: {
                list: list,
                count: count
            },
            status: 200
        })
    }
    async set(data: IFieldData): Promise<Rejoin>{
        let fieldEnity = new FieldEnity({data})
        let resultVerify: RejoinError | true | Field

        resultVerify = await fieldEnity.verifySetField()
        if(resultVerify instanceof RejoinError)
            return resultVerify
        resultVerify = await fieldEnity.verifySetData()
        if(resultVerify instanceof RejoinError)
            return resultVerify
    
        let field: Field = new Field(data)
        await field.save()
        Request.updateExtraFields()
        let content: IFieldSerializer = await FieldSerializer(field)
        return new RejoinSuccess({
            description: 'Поле создано',
            content: content,
            status: 200
        })
    }
    async change(id: string, data: IFieldData): Promise<Rejoin>{
        let fieldEnity = new FieldEnity({data})
        let resultVerify: RejoinError | true | Field

        resultVerify = await fieldEnity.verifySetData()
        if(resultVerify instanceof RejoinError)
            return resultVerify
        resultVerify = await fieldEnity.verifyIsField()
        if(resultVerify instanceof RejoinError)
            return resultVerify
    
        let field: Field = resultVerify
        field.name = data.name
        field.inputType = data.inputType
        field.required = data.required
        field.options = data.options
        field.default = data.default
        await field.save()
        Request.updateExtraFields()
        let content: IFieldSerializer = FieldSerializer(field)
        return new RejoinSuccess({
            description: 'Поле изменено',
            content: content,
            status: 200
        })
    }
    async delete(id: string): Promise<Rejoin>{
        let resultVerify: RejoinError | Field = await (new FieldEnity({id})).verifyIsField()
        if(resultVerify instanceof RejoinError)
            return resultVerify
        
        let field: Field = resultVerify
        await field.remove()
        Request.updateExtraFields()
        let content: IFieldSerializer = await FieldSerializer(field)
        return new RejoinSuccess({
            description: 'Удалено поле: ',
            content: content,
            status: 200
        })
    }
}