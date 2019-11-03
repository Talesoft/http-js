import { promises } from 'fs';
import { NextFunction, RequestContext } from '../request-handlers';

const { readFile } = promises;

export interface FileInfo {
    path: string;
    mimeType: string;
}

export interface FileServerContext extends RequestContext {
    servedFile?: FileInfo;
}

export function createFileServer() {
    return async (context: FileServerContext, next: NextFunction<FileServerContext>) => {
        if (!context.servedFile) {
            return await next(context);
        }
        const body = await readFile(context.servedFile.path);
        return await next({ ...context, response: { ...context.response, body } });
    };
}
