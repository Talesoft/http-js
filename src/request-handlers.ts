import { Request, Response } from './http';

export type NextFunction<T extends RequestContext> = (context: Readonly<T>) => Promise<Readonly<T>>;

export interface RequestContext {
    readonly request: Readonly<Request>;
    readonly response: Readonly<Response>;
}

export type RequestHandler<T extends RequestContext> = (
    context: T,
    next: NextFunction<T>,
) => Promise<Readonly<T>>;

export function createStack<T extends RequestContext>(handlers: ReadonlyArray<RequestHandler<T>>) {
    const iterator = handlers[Symbol.iterator]();
    let context: T;
    const innerNext = async (ctx: T, next?: NextFunction<T>) => {
        const handler = iterator.next();
        if (!handler.done) {
            context = await handler.value(ctx, innerNext);
        }
        return next ? await next(context) : context;
    };
    return innerNext;
}

export function stack<T extends RequestContext>(...handlers: ReadonlyArray<RequestHandler<T>>) {
    return createStack(handlers);
}
