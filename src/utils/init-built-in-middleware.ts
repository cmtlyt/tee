import type { TeeKoa } from '../types';
import { getRandomString } from '@cmtlyt/base';
import cors from '@koa/cors';
import multer from '@koa/multer';
import { koaBody } from 'koa-body';
import mount from 'koa-mount';
import koaStatic from 'koa-static';
import { getStorages } from '../storage';

export function initBuiltInMiddleware(app: TeeKoa.Application) {
  const { config } = getStorages(['config']);
  const { middlewareOptions } = config;
  const {
    cors: corsOptions,
    multer: multerOptions,
    bodyParse: bodyParseOptions,
    static: staticOptions,
  } = middlewareOptions;

  if (corsOptions) {
    app.use(cors(corsOptions));
  }

  if (multerOptions) {
    const { uploadDir } = multerOptions;
    if (uploadDir) {
      multerOptions.storage = multer.diskStorage({
        destination: uploadDir,
        filename(_, file, cb) {
          cb(null, `${getRandomString(8)}-${file.originalname}`);
        },
      });
    }
    app.use(multer(multerOptions).any());
  }

  if (bodyParseOptions) {
    app.use(koaBody(bodyParseOptions));
  }

  if (staticOptions) {
    app.use(mount(staticOptions.path, koaStatic(staticOptions.dir, staticOptions)));
  }
}
