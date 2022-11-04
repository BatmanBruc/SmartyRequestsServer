import type { Response, Request } from 'express';

import { FieldService, IFieldData } from "../services/FieldService"
import { IPagination, Rejoin } from "../services/enityService"

const getField = async (req: Request, res: Response)=>{
    let id: string = req.params.id
    let rejoin: Rejoin = await FieldService.getOne(id)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
const getFields = async (req: Request, res: Response)=>{
    let pagination: IPagination = {
        limit: req.body.limit,
        skip: req.body.skip
    }
    let rejoin: Rejoin = await FieldService.getList(pagination.limit, pagination.skip)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
const setField = async (req: Request, res: Response)=>{
    let data: IFieldData = {
        title: req.body.title,
        name: req.body.name,
        required: req.body.required,
        inputType: req.body.inputType,
        default: req.body.default,
        options: req.body.options
    }
    let rejoin: Rejoin = await FieldService.set(data)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}

const changeField = async (req: Request, res: Response)=>{
    let id: string = req.params.id
    let data: IFieldData = {
        title: req.body.title,
        name: req.body.name,
        required: req.body.required,
        inputType: req.body.inputType,
        default: req.body.default,
        options: req.body.options
    }

    let rejoin: Rejoin = await FieldService.change(id, data)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}

const deleteField = async (req: Request, res: Response)=>{
    let id: string = req.params.id
    let rejoin: Rejoin = await FieldService.delete(id)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
export {
    setField,
    changeField,
    deleteField,
    getField,
    getFields
}