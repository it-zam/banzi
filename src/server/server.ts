import * as express from 'express';

const app = express();
const port = process.env.PORT || 8080;
const isDevMode = process.env.NODE_ENV || 'development';
let disableKeepAlive = false;

app.use((req, res, next) => {
  if (disableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

app.use((req, res, next) => {
  res.header('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello world');
});

const server = app.listen(port, function() {
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

process.on('unhandledRejection', function(reason, p) {
  console.error(
    'Possibly Unhandled Rejection at: Promise ',
    p,
    ' reason: ',
    reason
  );
});
