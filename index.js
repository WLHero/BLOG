var express = require("express");
var path = require("path");
var session = require("express-session");
var mongoStore = require("connect-mongo")(session);
const flash = require('connect-flash');
const config = require("config-lite")(__dirname); //指向根目录下的config目录
var winston = require("winston");
const expressWinston = require('express-winston'); //日志文件
var formidable = require("express-formidable")  //文件上传
var routes = require("./routes");
var pkg = require("./package")

var app = express();

//设置模板目录
app.set('views', path.join(__dirname, 'views'))
//设置模板引擎
app.set('view engine', 'ejs')

//设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))


//设置session中间件
app.use(session({
	name:config.session.key,
	secret:config.session.secret, //用来对session_id相关的cookie进行签名
	resave:true, //强制更新session
	saveUninitialized:false, //设置为 false，强制创建一个 session，即使用户未登录
	cookie:({
		maxAge:config.session.maxAge //过期时间，过期后 cookie 中的 session id 自动删除
	}),
	store: new mongoStore({  //将session存储在mongodb 中
		url: config.mongodb //mongodb的url
	})
}))

// flash 中间件，用来显示通知
app.use(flash())

//处理表单及文件处理中间件
app.use(require('express-formidable')({
	uploadDir:path.join(__dirname,"public/upload"), // 上传文件目录
	keepExtensions:true //是否保留后缀
}))


//设置三个重要变量
app.use(function(req,res,next) {
	res.locals.user = req.session.user; //用户名存储
	res.locals.error = req.flash("error").toString();
	res.locals.success = req.flash("success").toString();
  next();
})

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))

// 路由
routes(app)

// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

app.use(function(err,req,res,next) {
	req.flash("error",err.message);
	res.redirect("/posts");
})


if (module.parent) {
  // 被 require，则导出 app
  module.exports = app
} else {
  // 监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}
