const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Si el navegador pregunta (OPTIONS), respondemos que sí de inmediato
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
