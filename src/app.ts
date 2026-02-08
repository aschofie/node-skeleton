import {createServer, IncomingMessage, Server, ServerResponse} from "node:http";
import {router, type Routes} from "./routes/router-definitions.ts";
import {routes} from "./routes/routes.ts";
import {logger} from "./logging/logger.ts";

const useRoutes: Routes = "ROUTES" in process.env
    ? routes[process.env.ROUTES as string]
    : routes.default;
const usePort: number = "PORT" in process.env
    ? parseInt(process.env.PORT as string)
    : 3000;

const server: Server<typeof IncomingMessage, typeof ServerResponse> =
    createServer(router(useRoutes));

server.listen(
    usePort,
    () => {
        logger.info({ formService: "Started", listeningPort: usePort});
    }
);
