import {IncomingMessage, ServerResponse} from 'node:http';

export const HttpMethod = {
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
    Delete: 'DELETE',
} as const;

export const HttpStatus = {
    Ok: 200,
    Created: 201,
    BadRequest: 400,
    NotFound: 404,
    InternalError: 500,
    GatewayTimeout: 504,
    BadGateway: 502
} as const;

export type HttpMethodValue = typeof HttpMethod[keyof typeof HttpMethod];
export type HttpStatusValue = typeof HttpStatus[keyof typeof HttpStatus];

export type RequestHandler = (
    req: IncomingMessage,
    res: ServerResponse
) => Promise<boolean>;

export interface Route {
    pattern: URLPattern;
    handler: RequestHandler;
    method: HttpMethodValue;
}

export type Routes = Record<string, Route>;

export function router(routes: Routes): (
    req: IncomingMessage,
    res: ServerResponse
) => Promise<void> {
    return async function route(
        req: IncomingMessage,
        res: ServerResponse
    ): Promise<void> {
        for (const key in routes) {
            const {pattern, handler, method} = routes[key];
            if (req.method === method && pattern.test(req.url)) {
                const handled = await handler(req, res);
                if (typeof handled !== "boolean" || !handled) {
                    res.statusCode = HttpStatus.InternalError;
                    res.end('Internal Error\n');
                }
                return;
            }
        }
        res.statusCode = HttpStatus.NotFound;
        res.end('Not Found\n');
    }
}