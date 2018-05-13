const express = require('express')
const router = express.Router()

const checkNotLogin = require('../middlewares/check').checkNotLogin
const PostModle = require("../models/posts");
const CommentModel = require('../models/comments')

//渲染文章列表
router.get('/', function (req, res, next) {
	const author = req.query.author;
	PostModle.getPosts(author)
		.then(function(posts) {
			res.render("posts", {
				posts:posts
			})
		})
		.catch(next);
  
})

// get /posts/create 发表一篇文章
router.get('/create',function(req,res,next) {
	res.render("create");
})

// POST /posts/create 发表一篇文章
router.post('/create',function(req,res,next) {
	const author = req.session.user._id;
	const title = req.fields.title;
	const content = req.fields.content;
	
	// 校验参数
	try {
		if(!title.length) {
			throw new Error('请填写标题')
		}
		if(!content.length) {
			throw new Error('请填写内容')
		}
	} catch(e) {
		req.flash("error",e.message);
		return res.redirect("back");
	}

	let post = {
		author:author,
		title:title,
		content:content
	}
	
	PostModle.create(post)
		.then(function(result) {
			post  = result.ops[0];
			req.flash("success","发表成功");
			res.redirect(`/posts/${post._id}`)
		})
		.catch(next)

})

// post /posts/:postId 单独一篇的文章页
router.get("/:postId",function(req,res,next) {
	const postId = req.params.postId;

	Promise.all([
		PostModle.getPostById(postId),
		CommentModel.getCommnets(postId),
		PostModle.incPv(postId)
	])
	.then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('该文章不存在')
      }

      res.render('post', {
        post: post,
        comments: comments
      })
    })
    .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get("/:postId/edit",function(req,res,next){
	var postId = req.params.postId;
	var author = req.session.user._id;

	PostModle.getRawPostById(postId)
		.then(function(post) {
			if(!post) {
				throw new Error("该文章不存在")
			}
			if (author.toString() !== post.author._id.toString()) {
				throw new Error("权限不足")
			}

			res.render('edit',{
				post:post
			})
		})
		.catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post("/:postId/edit",function(req,res,next){
	const postId = req.params.postId
	const author = req.session.user._id
	const title = req.fields.title
	const content = req.fields.content

	// 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
	
  PostModle.getRawPostById(postId)
  		.then(function(post) {
  			if(!post) {
				throw new Error("该文章不存在")
			}
			if (author.toString() !== post.author._id.toString()) {
				throw new Error("权限不足")
			}

			PostModle.updatePostById(postId,{title:title,content:content})
				.then(function() {
					req.flash('success','编辑文章成功')
					res.redirect(`/posts/${postId}`)
				})
  		})
  		.catch(next)

})


// GET /posts/:postId/remove 删除一篇文章
// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkNotLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModle.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModle.delPostById(postId)
        .then(function () {
          req.flash('success', '删除文章成功')
          // 删除成功后跳转到主页
          res.redirect('/posts')
        })
        .catch(next)
    })
})



module.exports = router;