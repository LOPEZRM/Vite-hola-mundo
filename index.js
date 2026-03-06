const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
    };

    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: "TablaUsuariosRuben",
            Item: {
                UserId: body.UserId,
                Nombre: body.Nombre
            }
        };
        await docClient.put(params).promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Usuario Guardado!" })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
