// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Reduce file watching to avoid EMFILE errors
config.watchFolders = [path.resolve(__dirname)];
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

// Disable watchman completely to avoid EMFILE errors
config.watcher = {
  watchman: false,
  healthCheck: {
    enabled: false,
  },
};

module.exports = config;

