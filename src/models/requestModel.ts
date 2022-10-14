import { Schema, Model, model } from 'mongoose';
import Field from './fieldModel'

interface IRequest {
    name: string;
    description: string;
    date: Date;
    [key: string]: ( string | boolean | Date);
}

interface IRequestMethods extends Model<IRequest> {
    updateExtraFields(): void
}

type typeObjSchema = {
    [key: string]: any
}

const objSchema: typeObjSchema = {
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now() }
}

const requestSchema = new Schema<IRequest>(objSchema);
const updateExtraFields = async (cntx: any)=>{ 
    for (let key in cntx.schema.tree ){
        if(!objSchema[key] && key != '_id' && key != '__v' && key != 'id'){
            cntx.schema.remove(key)
        }
    }
    const query = Field.find()
    query.exec( async (err, fields)=>{
        fields.map((field)=>{
            requestSchema.add({ 
                [field.name]: { type: Schema.Types.Mixed, default: field.default, required: field.required }
            })
        })
    })
}
requestSchema.static('updateExtraFields', function(){ updateExtraFields(this) })

export default model<IRequest, IRequestMethods>('Request', requestSchema)