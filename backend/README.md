<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Marexis Backend API

<p align="center">
  A robust and scalable backend application for Marexis, built with the <a href="http://nestjs.com/" target="blank">NestJS</a> framework.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
</p>

## 📖 Introduction

The Marexis Backend API is designed to power the Marexis platform, providing comprehensive services for product management, user authentication, file handling, and administrative tasks. It leverages modern web technologies to ensure performance, security, and scalability.

## ✨ Key Features

- **🔐 Robust Authentication**: Secure user authentication using JWT (Access & Refresh Tokens) and Argon2 for password hashing.
- **👥 Administrator Module**: Specialized management capabilities for system administrators.
- **📦 Product Management**: Full-featured module for managing products, categories, and inventory.
- **📁 File Management**: Secure file upload and management capabilities for product images and assets.
- **📧 Email Services**: Integrated email notifications using Resend.
- **📝 Contact Forms**: Handling and processing of user contact form submissions.
- **🔍 Search Functionality**: Advanced search capabilities to easily find content.
- **🛡️ Enhanced Security**: Implements `Helmet` for HTTP headers, `hpp` for parameter pollution protection, and strict CORS policies.
- **✅ Strict Validation**: Utilizes `Zod` for robust schema validation and type safety.
- **🗄️ Database**: Powered by MySQL with TypeORM for ORM and database management.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: MySQL
- **ORM**: [TypeORM](https://typeorm.io/)
- **Validation**: [Zod](https://zod.dev/) & `nestjs-zod`
- **Authentication**: `passport-jwt`, `argon2`
- **Email**: [Resend](https://resend.com/)
- **Logging**: Morgan
- **Testing**: Jest

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Yarn](https://yarnpkg.com/)
- [MySQL](https://www.mysql.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd marexis
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory based on the following template (defaults are shown):

   ```env
   NODE_ENV=development
   PORT=5000

   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=marexis_db
   DATABASE_DIALECT=mysql

   # JWT Configuration
   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_ACCESS_EXPIRES_IN=900
   JWT_REFRESH_EXPIRES_IN=10080
   ```

### 🏃‍♂️ Running the Application

```bash
# development mode
$ yarn run start

# watch mode (recommended for dev)
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### 🗄️ Database Migrations

This project uses TypeORM for database migrations.

```bash
# Generate a new migration (replace "MigrationName" with your description)
$ yarn migration:generate --name=MigrationName

# Run pending migrations
$ yarn migration:run
```

## 🧪 Testing

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## 📂 Project Structure

```
src/
├── app.module.ts       # Root module of the application
├── main.ts             # Application entry point
├── config/             # Configuration and environment validation
├── common/             # Shared utilities, decorators, and constants
├── entities/           # Global or shared database entities
├── auth/               # Authentication logic (Guards, Strategies)
└── modules/            # Feature modules
    ├── administrator/  # Admin management
    ├── background/     # Background tasks
    ├── contact-form/   # Contact form handling
    ├── email/          # Email service integration
    ├── file/           # File upload logic
    ├── product/        # Product catalog management
    └── search/         # Search operations
```

---
<p align="center">
  Built with ❤️ by the Marexis Team
</p>
