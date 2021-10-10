import express from 'express';

const shopRouter = express.Router();

shopRouter.get('/', async (req:express.Request, res:express.Response) => {
  res.status(404).send('not implemented yet');
});

export default shopRouter;
