import express from 'express';
import { connect } from 'mongoose';
import cors from 'cors'
import router from './routers';
import Request from './models/requestModel';
import config from './config'

const app = express();
app.use(express.json())
const port = config.port;

app.use('/',cors({
  origin: true
}), router);
app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});

runDB().catch(err => console.log(err));

async function runDB() {
  await connect(config.db_domain + config.db_name);
  Request.updateExtraFields()
}