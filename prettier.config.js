module.exports = {
  overrides: [
    {
      files: "package.json",
      options: {
        plugins: ["prettier-plugin-packagejson"],
      },
    },
  ],
};
