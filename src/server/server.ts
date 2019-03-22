import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';

const app: express.Application = express();
const port = process.env.PORT || 8080;
const isDevMode = process.env.NODE_ENV || 'development';
let disableKeepAlive = false;

// Default setting
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.disable('etag');
app.use((req, res, next) => {
  res.header('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate');
  next();
});

app.use(
  express.static(path.resolve(__dirname, '../../dist/static'), {
    etag: false,
    maxAge: '1d',
  })
);

app.use((req: any, res: any, next: any) => {
  if (disableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

app.get('/', (req: any, res: any) => {
  res.send('Hello world');
});

// Default Error handler
app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).send('Internal server error');
  next();
});

const server = app.listen(port, () => {
  console.log('Server is running on port', port);
});

if (!isDevMode) {
  process.on('SIGINT', () => {
    disableKeepAlive = true;
    server.close(() => {
      process.exit(0);
    });
  });
}

process.on('unhandledRejection', (reason, p) => {
  console.error(
    'Possibly Unhandled Rejection at: Promise ',
    p,
    ' reason: ',
    reason
  );
});
