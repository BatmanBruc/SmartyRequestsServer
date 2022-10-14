import { Router } from 'express';
import { setRequest, getRequests, changeRequest, deleteRequest } from './controllers/requestsController';
import { setField, changeField, deleteField, getFields } from './controllers/fieldsController';
const router = Router();

router.post('/requests', getRequests);
router.post('/request', setRequest);
router.post('/request/:id', changeRequest);
router.delete('/request/:id', deleteRequest);

router.post('/field', setField);
router.post('/field/:id', changeField);
router.post('/fields', getFields);
router.delete('/field/:id', deleteField);

export default router;