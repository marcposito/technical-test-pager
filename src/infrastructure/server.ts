import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";
import { Request, Response } from "express";
import logger from "../logger";
import config from "./config";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (_req: Request, res: Response): void => {
  res.send(`${config.app_name} is running`);
});

app.use(morgan("combined"));

const start = (): void => {
  app.listen(config.port, (): void => {
    logger.info(`${config.app_name} running on port ${config.port}`);
  });
};

export { start, app };
