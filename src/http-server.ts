import http from 'http';
import { RequestHandler, RequestContext } from './request-handlers';
import { createRequestFromNode, createResponse } from './http';

export interface HttpServerOptions {
    host: string;
    port: number;
    backlog: number;
}

export function createServer<T extends RequestContext>(options?: Partial<HttpServerOptions>) {
    const opts = {
        host: HttpServer.defaultHost,
        port: HttpServer.defaultPort,
        backlog: 512,
        ...options,
    };
    return (handler: RequestHandler<T>, initialContext?: T) => new Promise((resolve, reject) => {
        const server = new http.Server(async (req, res) => {
            const context = await handler({
                request: createRequestFromNode(req),
                response: createResponse(200, 'OK'),
                ...initialContext,
            } as T, ctx => Promise.resolve(ctx));
            const response = context.response;
            res.writeHead(response.statusCode, Object.entries(response.headers)
                .reduce((result, [name, value]) => {
                    result[name] = value.join('; ');
                    return result;
                }, {} as any),
            );
            if (response.body.byteLength > 0) {
                res.pipe()
            }
        });
        internalServer.once('listening', () => resolve());
        internalServer.once('error', err => reject(err));
        internalServer.listen(opts.port, opts.host, opts.backlog);
    });
}

export class HttpServer {
    public static defaultHost = '127.0.0.1';
    public static defaultPort = 80;

    private readonly internalServer: http.Server;
    private readonly options: HttpServerOptions;

    constructor() {
    }

    public listen() {
    }
}
