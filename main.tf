provider "aws" {
  region = "us-east-1"
}

variable "github_token" {
  description = "Token de acceso personal de GitHub"
  type        = string
  sensitive   = true
}

# 1. APP DE AMPLIFY
resource "aws_amplify_app" "hola_mundo" {
  name        = "hola-mundo-vite-v2" 
  repository  = "https://github.com/LOPEZRM/vite-hola-mundo.git"
  oauth_token = var.github_token

  build_spec = <<-EOT
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
EOT

  custom_rule {
    source = "/^((?!\\.).)*$/"
    target = "/index.html"
    status = "200"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.hola_mundo.id
  branch_name = "main" 
}

# 2. TABLA DYNAMODB
resource "aws_dynamodb_table" "mi_tabla" {
  name           = "TablaUsuariosRuben"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "UserId"

  attribute {
    name = "UserId"
    type = "S"
  }
}

# 3. EL "CEREBRO" (FUNCIÓN LAMBDA)
resource "aws_iam_role" "iam_for_lambda" {
  name = "role_lambda_final_ruben_v3"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "local_file" "lambda_script" {
  content  = <<EOF
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
EOF
  filename = "${path.module}/index.js"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = local_file.lambda_script.filename
  output_path = "${path.module}/lambda_function_payload.zip"
}

resource "aws_lambda_function" "guardar_usuario" {
  function_name    = "GuardarUsuarioDynamo"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

# 4. API GATEWAY UNIVERSAL ($default)
resource "aws_apigatewayv2_api" "api_lambda" {
  name          = "API-Usuarios-Ruben"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api_lambda.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.api_lambda.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.guardar_usuario.invoke_arn
}

resource "aws_apigatewayv2_route" "catch_all" {
  api_id    = aws_apigatewayv2_api.api_lambda.id
  route_key = "$default" 
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.guardar_usuario.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api_lambda.execution_arn}/*/*"
}

output "api_url" {
  value = aws_apigatewayv2_api.api_lambda.api_endpoint
}