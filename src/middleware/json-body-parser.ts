import { getHeaderValue } from '../http';
import { NextFunction, RequestContext } from '../request-handlers';

export interface JsonBodyParserRequestContext<T = any> extends RequestContext {
    jsonBody?: T;
}

export interface JsonBodyParserOptions {
    contentTypes?: string[];
}

export function createJsonBodyParser(options?: JsonBodyParserOptions) {
    const types = (options && options.contentTypes) || ['application/json'];
    return (context: JsonBodyParserRequestContext, next: NextFunction<JsonBodyParserRequestContext>) => {
        const contentType = getHeaderValue(context.request, 'content-type');
        if (!contentType || !types.includes(contentType)) {
            return next(context);
        }
        return next({ ...context, jsonBody: JSON.parse(context.request.body.toString('utf8')) });
    };
}
