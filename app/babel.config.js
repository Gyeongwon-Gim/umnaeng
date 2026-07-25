module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // reanimated 4부터 worklets 플러그인 사용, 반드시 마지막에 위치
    plugins: ["react-native-worklets/plugin"],
  };
};
