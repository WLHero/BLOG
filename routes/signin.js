const express = require('express')
const router = express.Router()
var sha1 = require("sha1");

var UserModel = require("../models/user");
var checkLogin = require("../middlewares/check").checkLogin;

//get /signin 登录页

router.get("/",checkLogin,function(req,res,next) {
	res.render("signin");
})

//post /signin 登录页
router.post("/",checkLogin,function(req,res,next) {
	var name = req.fields.name;
	var password = req.fields.password;

	 try {
	    if (!name.length) {
	      throw new Error('请填写用户名')
	    }
	    if (!password.length) {
	      throw new Error('请填写密码')
	    }

	  } catch (e) {
	    req.flash('error', e.message)
	    return res.redirect('back')
	  }

	UserModel.getUserByName(name)
		.then(function(user) {
			console.log(name,password,100000000000000001)
			if(!user) {
				req.flash('error', '用户不存在')
        		return res.redirect('back')
			}
			
			//检查密码是否匹配
			if(sha1(password) !== user.password) {
				req.flash('error', '密码错误')
        		return res.redirect('back')
			}
			req.flash("success","登录成功");

			//将用户名存入session
			delete user.password;
			req.session.user = user;
			// 跳转到主页
      		return res.redirect('/posts')
		})
		.catch(next)
})

module.exports = router;