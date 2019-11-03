import { promises } from 'fs';
import { resolve } from 'path';
import { RequestHandler, stack } from '../request-handlers';
import { FileInfo } from './file-server';
import { createUriParser, UriParserContext } from './uri-parser';

const { stat } = promises;

export interface DirectoryResolverContext extends UriParserContext {
    resolvedFile?: FileInfo;
}

export interface DirectoryResolverOptions {
    path?: string;
    indexFiles?: string[];
}

export function createDirectoryResolver(options?: DirectoryResolverOptions) {
    const opts: Required<DirectoryResolverOptions> = {
        path: process.cwd(),
        indexFiles: [],
        ...options,
    };
    const root = resolve(opts.path);
    async function resolveFile(path: string) {
        // Make sure the path is relative (URIs always come in prefixed with a /)
        // TODO: Sanitize more?
        const safePath = `.${path}`;
        let fullPath = resolve(root, safePath);
        if (!fullPath.startsWith(root)) { // File is not actually in this root directory
            return undefined;
        }
        const stats = await stat(fullPath);
        if (stats.isDirectory()) {
            // It's a directory, try to find fitting index files
            const indexFullPath = (await Promise.all(
                opts.indexFiles.map(indexPath => resolveFile(resolve(fullPath, indexPath))),
            )).find(p => !!p);
            if (!indexFullPath) {
                return undefined;
            }
            fullPath = indexFullPath;
        }

        // TODO: Handle symbolic links here

        if (!stats.isFile()) {
            return undefined;
        }

        return fullPath;
    }
    const directoryResolver: RequestHandler<DirectoryResolverContext> = async (context, next) => {
        if (!context.uri) {
            // Auto-fallback to default URI parser
            return await stack(createUriParser(), directoryResolver)(context, next);
        }
        const fullPath = await resolveFile(context.uri.pathname || '/');
        if (!fullPath) {
            return await next(context);
        }
        const resolvedFile = { path: fullPath, mimeType: '' };
        return await next({ ...context, resolvedFile });
    };
    return directoryResolver;
}
