import { Schema, model } from 'mongoose';

export interface IField {
  title: string
  name: string
  inputType: number
  required: boolean
  options?: Array<string>
  default?: ( string | number | boolean )
}
const fieldSchema = new Schema<IField>({
  title: { type: String, required: true },
  name: { type: String, required: true },
  inputType: { type: Number, default: 1 },
  required: { type: Boolean, default: false },
  options: [String],
  default: Schema.Types.Mixed
});


export class Field extends model<IField>('Field', fieldSchema){}