//開啟伺服器連線
const http = require('http'); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//環境變數
dotenv.config({path: './config.env'});
//console.log(process.env.PORT); 
//連接資料庫
//const DB = "mongodb://localhost:27017/NFT500";
const DB = process.env.DATABASE.replace(
    "<password>", 
    process.env.DB_PASSWORD ??= ""
  );

mongoose.connect(DB)
    .then(()=>{ console.log("資料庫連線成功!")})
    .catch(error => {console.log(error)});
//model    
const Post = require('./model/post');    

//回傳結果模組化
const headers = require('./headers');
const succHandle = require('./handleSuccess');
const errHandle = require('./handleError');

const requestListener = async(req, res) => {
    console.log(req.url);
    console.log(req.method);

    let body = '';
    req.on('data', chunk =>{
        body += chunk;
    });

    if (req.url == "/posts" && req.method == "GET"){
        //由貼文時間的新到舊顯示
        const getPost = await Post.find().sort({createdAt: -1});
        succHandle(res, getPost);

    }else if (req.url == "/posts" && req.method == "POST"){
        req.on('end', async()=>{
            try{
                const data = JSON.parse(body);
                const newPost = await Post.create(
                    {
                        name: data.name,
                        content: data.content.trim(),
                        image: data.image,
                        likes: data.likes                        
                    }
                );
                succHandle(res, newPost);

            }catch({errors}){
                errHandle(res, 400, 'format', errors);
            }
        })

    }else if (req.url == "/posts" && req.method == "DELETE"){
        if (await Post.find().count() >= 1) {
            await Post.deleteMany({});
            succHandle(res, []); //顯示清空
        }else{
            errHandle(res, 400, 'data');
        }
    }else if (req.url.startsWith("/posts/") && req.method == "DELETE"){
        try{
            const id = req.url.split('/').pop();
            const delPost = await Post.findByIdAndDelete(id);
            if (delPost) {
                succHandle(res, delPost);
            } else {
                errHandle(res, 400, 'id');
            }            
        }catch({errors}){
            errHandle(res, 400, 'id', errors);
        }
    }else if (req.url.startsWith("/posts/") && req.method == "PATCH"){
        req.on('end', async()=>{
            try{
                const data = JSON.parse(body); //AS POST 
                const upddata = { 
                    name: data.name, 
                    content: data.content.trim(), 
                    image: data.image, 
                    likes: data.likes
                };
                //更新單筆
                const id = req.url.split('/').pop(); //AS DELETE{id}
                //option開啟new 可回傳修改成功的資料、開啟runValidators 作更新資料的驗證
                const resPost = await Post.findByIdAndUpdate(id,upddata,{new: true, runValidators: true});                  
                if (resPost) {
                    succHandle(res, resPost);
                } else {
                    errHandle(res, 400, 'id');
                }                                    
            }catch({errors}){
                errHandle(res, 400, 'update', errors);
            }
        })        
    }
    //跨網域請求(部署雲端後才有效果)
    else if (req.method == "OPTIONS"){
        res.writeHead(200, headers);
        res.end()
    }else{
        errHandle(res, 404, 'routing');
    }

}
const server = http.createServer(requestListener);
server.listen(process.env.PORT);