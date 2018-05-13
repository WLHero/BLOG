const fs = require("fs");
const express = require("express");
const router = express.Router();
const sha1 = require("sha1");
const path = require('path')

const UserModel = require("../models/user");
const checkLogin = require('../middlewares/check').checkLogin;

//get signup 注册
router.get("/",checkLogin,function(req,res,next) {
	res.render("signup");
})

//post signup 注册
router.post("/",checkLogin,function(req,res,next) {
	const name = req.fields.name;
	const bio = req.fields.name;
	const gender = req.fields.gender;
	let password = req.fields.password;
	const repassword = req.fields.repassword;
	const avatar = req.files.avatar.path.split(path.sep).pop()

	//校验参数
	try {
		if(!name.length >= 1 && !name.length <= 10) {
			throw new Error('名字请限制在 1-10 个字符');
		}
		if(["m","f","x"].indexOf(gender) == -1) {
			throw new Error('性别只能是 男 女 保密');
		}
		if(!bio.length >= 1 && !bio.length <= 30) {
			throw new Error('博文请限制在 1-30 个字符');
		}
		if (!req.files.avatar.name) {
			throw new Error('请上传图片');
		}
		if(password.length < 6) {
			throw new Error('密码至少六位数');
		}
		if(password != repassword) {
			throw new Error('两次密码不对');
		}
	} catch(e) {
		//如果注册失败 删除上传头像
		fs.unlink(req.files.avatar.path)
		req.flash("error",e.message);
		return res.redirect('/signup')
	}

	//明文密码加密
	password = sha1(password);

	//要创建的信息
	let user = {
		name:name,
		password:password,
		bio:bio,
		avatar:avatar,
		gender:gender
	}
	UserModel.create(user)
		.then(function(result) {
			let user = result.ops[0];
			//删除密码敏感信息 将user存入session
			delete user.password;
			req.session.user = user;

			//写入flash
			req.flash("success","注册成功");
			//跳转到首页
			res.redirect("/posts");

		})
		.catch(function(e) {
			// 注册失败，异步删除上传的头像
      		fs.unlink(req.files.avatar.path);
      		if(e.message.match("duplicate key")) {
      			req.flash("error","用户名已被占用");
      			res.redirect("/signup");
      		}
      		next(e);
		})
})

module.exports = router;
