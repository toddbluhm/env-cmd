module.exports = new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      THANKS: 'FOR ALL THE FISH',
      ANSWER: 0
    })
  }, 200)
})
