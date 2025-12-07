// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const MetroResolver = require('metro-resolver');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase webchannel-wrapper modüllerini boş olarak çöz
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@firebase/webchannel-wrapper/bloom-blob') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(
        __dirname,
        'node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/bloom_blob_es2018.js'
      ),
    };
  }

  if (moduleName === '@firebase/webchannel-wrapper/webchannel-blob') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(
        __dirname,
        'node_modules/@firebase/webchannel-wrapper/dist/webchannel-blob/webchannel_blob_es2018.js'
      ),
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return MetroResolver.resolve(context, moduleName, platform);
};

module.exports = config;

