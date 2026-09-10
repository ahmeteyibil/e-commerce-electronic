const pool = require('../db')

const getAllUserInfosById = async function (userId) {
    const query = "SELECT * from users WHERE id = $1";
    var userDatas;
    try {
        const response = await pool.query(query, [userId]);
        if(response.rowCount > 0){
            userDatas = response.rows[0];
        }   
    } catch(err){
        console.log("Veritabanından kullanıcı bilgileri getirilirken hata oluştu: ", err.message);
    }
    return userDatas;
}

module.exports = {
    getAllUserInfosById
}