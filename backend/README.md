# CityFix Backend

This is the backend service for the CityFix application, built with NestJS.

## Features

- REST API with JWT authentication
- User roles (citizen, admin)
- CRUD operations for reports
- File upload support
- Geolocation support
- Status tracking with audit trail
- Swagger API documentation

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `cityfix`

4. Copy the environment variables:

   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your database credentials and JWT secret

6. Run the migrations:
   ```bash
   npm run typeorm migration:run
   ```

## Development

Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation will be available at `http://localhost:3000/api`

## Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start:prod
```

## API Documentation

The API documentation is available through Swagger UI at `/api` endpoint when the server is running.

## Testing

Run the tests:

```bash
npm test
```

Run the tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # Users module
├── reports/        # Reports module
├── common/         # Common utilities and interfaces
└── main.ts         # Application entry point
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

ISC
