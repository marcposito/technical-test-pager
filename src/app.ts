import { start } from "./infrastructure/server";
import { cpus } from "node:os";
import process = require("node:process");
import * as notReallyCluster from "cluster";
import logger from "./logger";

const cluster = (notReallyCluster as unknown) as notReallyCluster.Cluster;
const numCPUs = cpus().length;

if (cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    logger.info(`Worker ${worker.process.pid} died`);
  });
} else {
  start();
  logger.info(`Worker ${process.pid} started`);
}
