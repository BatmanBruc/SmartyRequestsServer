import type { Response, Request } from 'express';

import { RequestService, IRequestData } from '../services/RequestsService';
import { IPagination, Rejoin } from "../services/enityService"

const getRequest = async (req: Request, res: Response)=>{
    let id: string = req.params.id
    let rejoin: Rejoin = await RequestService.getOne(id)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
const getRequests = async (req: Request, res: Response)=>{
    let pagination: IPagination = {
        limit: req.body.limit,
        skip: req.body.skip
    }
    let rejoin: Rejoin = await RequestService.getList(pagination.limit, pagination.skip)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}

const setRequest = async (req: Request, res: Response)=>{
    let data: IRequestData
    for( let prop in req.body ){
        data[prop] = req.body[prop]
    }
    let rejoin: Rejoin = await RequestService.set(data)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
const changeRequest = async (req: Request, res: Response)=>{
    let id: string = req.params.id
    let data: IRequestData
    for( let prop in req.body ){
        data[prop] = req.body[prop]
    }
    let rejoin: Rejoin = await RequestService.change(id, data)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
const deleteRequest = async (req: Request, res: Response)=>{
    let id: string = req.params.id
    let rejoin: Rejoin = await RequestService.delete(id)
    res.status(rejoin.getStatus())
    res.send(rejoin.get())
}
export {
    getRequest,
    getRequests,
    setRequest,
    changeRequest,
    deleteRequest
}