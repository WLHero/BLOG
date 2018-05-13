const marked = require("marked");
const Comment = require("../lib/mongo").Comment;

Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

module.exports = {
	// 通过文章 id 获取该文章下留言数
	getCommentsCount:function(postId) {
		return Comment.count({ postId: postId }).exec();
	},
	//通过评论 id 获取一条评论
	getCommentByid:function(commentId) {
		return Comment.findOne({_id:commentId}).exec();
	},
	//通过文章id获取该文章下的所有留言
	getCommnets: function getCommnets (postId) {
    return Comment
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },
	//创建一条留言
	create: function create (comment) {
    return Comment.create(comment).exec()
  },
  //通过文章id删除对应的留言
  delCommentsByPostId:function(postId) {
      return Comment.deleteMany({postId:postId}).exec();
  }

}