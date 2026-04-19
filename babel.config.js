module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          "react-compiler": {
            sources: (filename) => {
              return (
                filename.includes("/app/") ||
                filename.includes("/components/") ||
                filename.includes("/utils")
              );
            },
          },
        },
      ],
    ],
  };
};
