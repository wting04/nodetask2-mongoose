const mongoose = require('mongoose');

/*
* posts貼文集合欄位
- name：貼文姓名(必填)
- content：貼文內容(必填)
- image：貼文圖片
- likes：按讚數
- createdAt：發文時間(系統產生)
- updatedAt：異動時間(系統產生)
*/

const postSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "貼文姓名未填寫"]
        },
        content: {
            type: String,
            required: [true, "貼文內容未填寫"]        
        },
        image: {
            type: String,
            default: ""            
        },
        likes: {
            type: Number,
            default: 0
        }

    },
    {
        versionKey: false, //移除欄位 _v
        timestamps: true 
    }
);

//模組名稱字首大寫
//mongoose issue: Post(模組名稱) > posts(DB collection name)
const Post = mongoose.model('Post', postSchema);

module.exports = Post;