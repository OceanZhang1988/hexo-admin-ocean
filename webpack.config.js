const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const settings = {
  distPath: path.join(__dirname, "www"),
  srcPath: path.join(__dirname, "src"),
  templatePath: path.join(__dirname, "templates"),
};

const babelLoaderOpts = {
  cacheDirectory: true,
  babelrc: false,
  presets: [
    [
      '@babel/preset-env',
      {
        // or whatever your project requires
        useBuiltIns: "entry",
        targets: { browsers: 'last 2 versions' }
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    'react-hot-loader/babel',
  ],
}

module.exports = (env, options) => {
  process.env.NODE_ENV = options.mode;
  const isDevMode = options.mode === "development";
  const webpackConfig = {
    devtool: isDevMode ? "source-map" : false,
    stats: 'minimal',
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    output: {
      publicPath: '',
      filename: `[name]/bundle.js`,
      path: settings.distPath,
    },
    entry: {
      [`admin`]: ["@babel/polyfill", "./src/index.tsx"],
    },
    devServer: {
      hot: true,
      contentBase: settings.templatePath,
      compress: true,
      port: 20000,
      overlay: {
        warnings: true,
        errors: true
      },
      // stats: 'errors-only',
      // before(app, server) {
        // app.use('/admin/api', require('./mock')(app));
      // }
      proxy: {
        '/admin/api': 'http://localhost:4000'
      }
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            isDevMode ? "style-loader" : { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } },
            { loader: "css-loader", options: { sourceMap: isDevMode } },
            { loader: "postcss-loader", options: { plugins: [require("autoprefixer")()], sourceMap: isDevMode } },
            { loader: "less-loader", options: { sourceMap: isDevMode } }
          ]
        },
        { test: /\.tsx?$/, use: [{ loader: "babel-loader", options: babelLoaderOpts }] },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          use: { loader: "file-loader", options: { name: "fonts/[name].[ext]" } },
        },
        {
          test: /\.(jpe?g|png|gif|svg|ico)$/i,
          use: [{ loader: "file-loader", options: { outputPath: "assets/" } }]
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        "React": "react",
      }),
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        minify: !isDevMode,
        template: path.join(settings.templatePath, 'index.html')
      }),
    ]
  };
  // For production mode.
  if (!isDevMode) {
    webpackConfig.plugins.push(
      new CleanWebpackPlugin([settings.distPath], {
        verbose: true
      })
    );
    webpackConfig.plugins.push(
      new CopyWebpackPlugin([
        { from: 'templates/vendor', to: `${settings.distPath}/vendor/`, toType: 'dir' },
        { from: 'templates/login', to: `${settings.distPath}/login/`, toType: 'dir' },
        { from: 'templates/css', to: `${settings.distPath}/css/`, toType: 'dir' },
        { from: 'templates/logo.png', to: `${settings.distPath}/logo.png`, toType: 'file' },
      ]),
    );
    webpackConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: `[name]/bundle.css`
      }),
    );
  }
  return webpackConfig;
};