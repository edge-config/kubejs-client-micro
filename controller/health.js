

exports.health = async function (req, res) {

    let obj = new Object();
    obj.status = "200";
    obj.message  = "Server healty now, trying this!!!";

    return JSON.stringify(obj);
}





