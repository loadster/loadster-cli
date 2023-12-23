module.exports = {
  apiBotTypes: {
    protocol: 'HTTP',
    browser: 'BROWSER'
  },
  createCodeCommandFromJavaScript (js) {
    return {
      type: 'code',
      code: js,
      language: 'javascript',
      enabled: true
    }
  }
};
