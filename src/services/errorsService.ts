type ITypeError = [ string, ( 400 | 401 | 403 | 404 ) ]



const FIELD_REQUIRED: ITypeError = ['Не заполнены необходимые поле:', 400]
const BAD_ID: ITypeError = ['Некорректный id:', 400]
const NOT_FOUND_FIELD_ID: ITypeError = ['Поле с указанным id не найден:', 404]
const NOT_FOUND_REQUEST_ID: ITypeError = ['Заявка с указанным id не найдена:', 404]
const FIELD_ALREADY_EXISTS: ITypeError = ['Поле уже создано', 400]

export {
    FIELD_REQUIRED,
    BAD_ID,
    NOT_FOUND_FIELD_ID,
    NOT_FOUND_REQUEST_ID,
    FIELD_ALREADY_EXISTS
}