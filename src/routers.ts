import { Router } from 'express';
import { setRequest, getRequests, changeRequest, deleteRequest, getRequest } from './controllers/requestsController';
import { setField, changeField, deleteField, getField, getFields } from './controllers/fieldsController';
const router = Router();

router.get('/request/:id', getRequest);
router.post('/requests', getRequests);
router.post('/request', setRequest);
router.post('/request/:id', changeRequest);
router.delete('/request/:id', deleteRequest);

router.post('/field', setField);
router.post('/field/:id', changeField);
router.get('/field/:id', getField);
router.post('/fields', getFields);
router.delete('/field/:id', deleteField);

export default router;