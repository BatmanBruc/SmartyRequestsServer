import { FieldService, IFieldData, IFieldPagination } from "../services/FieldService"

const getField = async (req: any, res: any)=>{
    let id: string = req.params.id
    let response = await FieldService.getOne(id)
    res.status(response.getStatus())
    res.send(response.get())
}
const getFields = async (req: any, res: any)=>{
    let pagination: IFieldPagination = {
        limit: req.params.limit,
        skip: req.params.skip,
    }
    let response = await FieldService.getList(pagination.limit, pagination.skip)
    res.status(response.getStatus())
    res.send(response.get())
}
const setField = async (req: any, res: any)=>{
    let data: IFieldData = {
        title: req.body.title,
        name: req.body.name,
        required: req.body.required,
        inputType: req.body.inputType,
        default: req.body.default,
        options: req.body.options
    }
    let response = await FieldService.setField(data)
    res.status(response.getStatus())
    res.send(response.get())
}

const changeField = async (req: any, res: any)=>{
    let id: string = req.params.id
    let data: IFieldData = {
        title: req.body.title,
        name: req.body.name,
        required: req.body.required,
        inputType: req.body.inputType,
        default: req.body.default,
        options: req.body.options
    }

    let response = await FieldService.changeField(id, data)
    res.status(response.getStatus())
    res.send(response.get())
}

const deleteField = async (req: any, res: any)=>{
    let id: string = req.params.id
    let response = await FieldService.deleteField(id)
    res.status(response.getStatus())
    res.send(response.get())
}
export {
    setField,
    changeField,
    deleteField,
    getField,
    getFields
}