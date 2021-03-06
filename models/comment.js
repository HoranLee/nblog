/**
 * Created by Mars on 2014/9/10 0010.
 */
var mongodb = require('mongodb').Db,
    settings = require('../settings');

function Comment(name, day, title, comment){
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback){
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;
    //打开数据库
    mongodb.connect(settings.url, function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function(err, collection){
            if(err){
                db.close();
                return callback(err);
            }
            //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的comments数组里
            collection.update({
                'name': name,
                'time.day': day,
                'title': title
            }, {
                $push: {'comments': comment}
            }, function(err){
                db.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};