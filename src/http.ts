import http from 'http';
import { Readable } from 'stream';

export interface HeaderList {
    readonly [name: string]: readonly string[];
}

export interface Message {
    readonly protocol: string;
    readonly protocolVersion: string;
    readonly headers: HeaderList;
    readonly body: ReadableStream;
}

export interface Request extends Message {
    readonly requestTarget: string;
    readonly method: string;
    readonly uri: string;
}

export interface Response extends Message {
    readonly statusCode: number;
    readonly reasonPhrase: string;
}

export function createProtocol(name: string = 'HTTP', version: string = '1.1') {
    return { protocol: name, protocolVersion: version } as const;
}

export function createHeadersFromNode(headers: http.IncomingHttpHeaders | http.OutgoingHttpHeaders) {
    return Object.entries(headers).reduce((result, [name, value]) => {
        const values = (Array.isArray(value) ? value : [value])
            .filter(v => typeof v !== 'undefined' && v !== null)
            .map(v => (v as string | number).toString());
        return { ...result, [name]: values };
    }, {} as HeaderList);
}

export function createMessage(
    headers: HeaderList = {},
    body: ReadableStream = new Readable(),
    protocol: string = 'HTTP',
    protocolVersion: string = '1.1',
) {
    return { protocol, protocolVersion, headers, body } as const;
}

export function createRequest(method: string, uri: string, headers: HeaderList = {}, body: Buffer = new Buffer(0)) {
    return { ...createMessage(headers, body), method, uri } as const;
}

export function createRequestFromNode(request: http.IncomingMessage) {
    const { headers, httpVersion, method, url } = request;
    return {
        ...createMessage(
            createHeadersFromNode(headers),
            new Buffer(0),
            'HTTP',
            httpVersion,
        ),
        method: method || '',
        uri: `/${(url || '').replace(/^[./\\]+/, '')}`,
    } as const;
}

export function createResponse(
    statusCode: number,
    reasonPhrase: string,
    headers: HeaderList = {},
    body: Buffer = new Buffer(0),
) {
    return { ...createMessage(headers, body), statusCode, reasonPhrase } as const;
}

export function withHeader<T extends Request | Response>(message: T, name: string, value: string[]): T {
    return { ...message, headers: { ...message.headers, [name]: value } };
}

export function withAddedHeader<T extends Request | Response>(message: T, name: string, value: string): T {
    return { ...message, headers: { ...message.headers, [name]: [...message.headers[name], value] } };
}

export function withAddedHeaders<T extends Request | Response>(message: T, name: string, value: string[]): T {
    return { ...message, headers: { ...message.headers, [name]: [...message.headers[name], ...value] } };
}

export function getHeaderValue<T extends Request | Response>(
    message: T,
    name: string,
    delimiter: string = '',
): string | undefined {
    return name in message.headers ? message.headers[name].join(delimiter) : undefined;
}
