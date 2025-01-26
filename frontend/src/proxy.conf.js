module.exports = {
  "/arena/vslite/": {
    secure: false,
    bypass: function (req, res, proxyOptions) {
      if (!req.url.startsWith(proxyOptions.context)) {
        return;
      }
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    },
  },
  "/vslite/": {
    target: "http://localhost:5101/",
    secure: false,
  },
};
