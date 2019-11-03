import { parse } from 'cookie';
import { NextFunction, RequestContext } from '../request-handlers';

export interface CookieList {
    [key: string]: string;
}

export interface CookeParserContext extends RequestContext {
    cookies?: CookieList;
}

export interface CookieParserOptions {
    decode?: (value: string) => string;
}

export function createCookieParser(options?: CookieParserOptions) {
    return (context: CookeParserContext, next: NextFunction<CookeParserContext>) => {
        const cookieStrings = context.request.headers.cookie;
        if (!cookieStrings || cookieStrings.length < 1) {
            return;
        }
        const cookies = cookieStrings.reduce((result, cookieString) => ({
            ...result,
            ...parse(cookieString, { decode: options && options.decode }),
        }), {} as CookieList);
        return next({ ...context, cookies });
    };
}
