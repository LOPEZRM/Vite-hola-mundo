provider "aws" {
  region = "us-east-1"
}

variable "github_token" {
  description = "Token de acceso personal de GitHub"
  type        = string
  sensitive   = true
}

resource "aws_amplify_app" "hola_mundo" {
  name       = "hola-mundo-vite-v2" 
  repository = "https://github.com/LOPEZRM/vite-hola-mundo.git"
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