import url, { UrlWithParsedQuery } from 'url';
import { NextFunction, RequestContext } from '../request-handlers';

export interface UriParserContext extends RequestContext {
    uri?: UrlWithParsedQuery;
}

export function createUriParser() {
    return (context: UriParserContext, next: NextFunction<UriParserContext>) => {
        const uri = url.parse(context.request.uri, true);
        return next({ ...context, uri });
    };
}
