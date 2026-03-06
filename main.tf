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
    source = "</^((?!\\.).)*$/>"
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

# 3. PERMISOS (IAM) PARA QUE TU APP PUEDA USAR LA TABLA
resource "aws_iam_policy" "amplify_dynamo_policy" {
  name        = "AmplifyDynamoAccessPolicy"
  description = "Permite que Amplify escriba en DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.mi_tabla.arn
      }
    ]
  })
}