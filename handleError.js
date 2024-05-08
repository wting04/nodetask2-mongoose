const headers = require('./headers');

const errorMag = {
    'data': '無資料',
    'id': '無此 _id',
    'format': '回傳格式錯誤，或欄位填寫錯誤',
    'update': '更新失敗',
    'routing': '無此網站路由'    
}

function handleError (res, statusCode, errorKey, mongooseError) {
    res.writeHead(statusCode, headers);
    res.write(JSON.stringify({
        "status": "false",
        "errorMag": errorMag[errorKey],
        "error": mongooseError
    }));
    res.end();
}

module.exports = handleError
