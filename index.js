const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const params = {
        TableName: "TablaUsuariosRuben",
        Item: {
            UserId: body.UserId,
            Nombre: body.Nombre
        }
    };
    try {
        await docClient.put(params).promise();
        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST"
            },
            body: JSON.stringify({ message: "Usuario Guardado!" })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        };
    }
};
