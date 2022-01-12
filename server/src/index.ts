import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { Rover } from './Rover';

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

let rover = new Rover(0, 0, 'NORTH');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/rover/initialize', (req, res) => {
  rover = new Rover(req.body.x, req.body.y, req.body.heading);

  if (req.body.obstacles) {
    rover.setObstacles(req.body.obstacles);
  }
  res.status(200).send();
});

app.get('/rover/status', (req, res) => {
  res.json({ status: rover.getStatus() });
});

app.post('/rover/obstacles', (req, res) => {
  rover.setObstacles(req.body);
  res.status(200).send();
});

app.post('/rover/commands', async (req, res) => {
  await rover.runCommands(req.body.commands);
  res.status(200).send();
});

app.post('/rover/navigate', async (req, res) => {
  const route = rover.navigate(req.body.x, req.body.y, []);
  console.log('route', route);
  await rover.followRoute(route);
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
