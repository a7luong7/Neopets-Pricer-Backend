import express from 'express';

const itemRouter = express.Router();

itemRouter.get('/', async (req:express.Request, res:express.Response) => {
  res.status(404).send('not implemented yet');
});

export default itemRouter;
