const path = require("path");
const webpack = require("webpack");
require("dotenv").config();

module.exports = {
  mode: "development",
  entry: "./src/App.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    publicPath: "/",
  },
  devtool: "source-map",
  plugins: [
    new webpack.EnvironmentPlugin({
      API_URL: process.env.API_URL || "https://capstone-1-backend-indol.vercel.app",
      REACT_APP_AUTH0_DOMAIN: process.env.REACT_APP_AUTH0_DOMAIN || "franccesco.us.auth0.com",
      REACT_APP_AUTH0_CLIENT_ID: process.env.REACT_APP_AUTH0_CLIENT_ID || "YVI08TG7FVmUomdxAYaLjyYzLBaMXlt5",
      REACT_APP_AUTH0_AUDIENCE: process.env.REACT_APP_AUTH0_AUDIENCE || "https://franccesco.us.auth0.com/api/v2/",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    historyApiFallback: true,
    port: 3000,
  },
};
