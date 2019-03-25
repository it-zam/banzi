/* eslint-disable import/no-extraneous-dependencies, typescript/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');

const PROJECT_ROOT = path.resolve(__dirname, '../');
const APP_ENTRY = path.join(PROJECT_ROOT, 'src/client');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'dist');

const version = process.env.npm_package_version || '0.0.0';
const APPLICATION_PHASE = process.env.APPLICATION_PHASE || 'production';

console.log('******************** WEBPACK BUILD ********************');
console.log('[APPLICATION_PHASE]', APPLICATION_PHASE);
console.log('[VERSION]', version);
console.log('******************** WEBPACK BUILD ********************');

const commonConfig = {
  mode: APPLICATION_PHASE,
  entry: {
    app: `${APP_ENTRY}/App.tsx`,
  },
  output: {
    filename: `app.${version}.js`,
    path: OUTPUT_PATH,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.json', 'css'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.(png|jpeg|gif|svg|ttf|eof|woff(2)?)(\?.*)?$/,
        loaders: 'file-loader',
      },
    ],
  },
  plugins: [
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(APP_ENTRY, 'resources/img'),
        glob: '*',
      },
      target: {
        image: path.resolve(
          APP_ENTRY,
          'resources/img/spritesmith-generated.png'
        ),
        css: path.resolve(
          APP_ENTRY,
          'resources/img/spritesmith-generated.scss'
        ),
      },
      apiOptions: {
        cssImageRef: '../img/spritesmith-generated.png',
      },
      spritesmithOptions: {
        padding: 10,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        APPLICATION_PHASE: JSON.stringify(APPLICATION_PHASE || 'production'),
        APPLICATION_VERSION: JSON.stringify(version),
      },
    }),
    new HtmlWebPackPlugin({
      template: `${APP_ENTRY}/index.html`,
      filename: `index.${version}.html`,
    }),
  ],
};

const devConfig = {
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [],
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    hot: true,
    publicPath: '/app/client',
  },
};

const prodConfig = {
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `app.${version}.css`,
      publicPath: OUTPUT_PATH,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    return merge(commonConfig, devConfig);
  } else {
    return merge(commonConfig, prodConfig);
  }
};
