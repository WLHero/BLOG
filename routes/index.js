module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/posts')
  })

app.use('/signout', require('./signout')) //退出登录
 app.use('/signup', require('./signup')) //登录
 app.use('/signin', require('./signin')) //登录
 app.use('/posts', require('./posts')) //文章列表
 app.use('/comments', require('./comments')) //文章列表


  //404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404')
    }
  })
}
