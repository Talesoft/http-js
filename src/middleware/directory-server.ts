import { RequestHandler, stack } from '../request-handlers';
import { createDirectoryResolver, DirectoryResolverContext, DirectoryResolverOptions } from './directory-resolver';
import { createFileServer, FileServerContext } from './file-server';

export interface DirectoryServerContext extends DirectoryResolverContext, FileServerContext {
}

export function createDirectoryServer(options?: DirectoryResolverOptions) {
    const mapper: RequestHandler<DirectoryServerContext> = (ctx, next) => next({
        ...ctx,
        servedFile: ctx.resolvedFile,
    });
    return stack(createDirectoryResolver(options), mapper, createFileServer());
}
