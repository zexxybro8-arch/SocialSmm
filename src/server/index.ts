import express from 'express';
import { apiRouter } from './apiRouter';

export const backendApp = express();

backendApp.use(express.json());
backendApp.use('/api', apiRouter);

export default backendApp;
