export default new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      development: {
        THANKS: 'FOR ALL THE FISH',
        ANSWER: 0,
      },
      test: {
        THANKS: 'FOR MORE FISHIES',
        ANSWER: 21,
      },
      production: {
        THANKS: 'FOR WHAT?!',
        ANSWER: 42,
        ONLY: 'IN PRODUCTION',
        BRINGATOWEL: true,
      },
    })
  }, 200)
})
