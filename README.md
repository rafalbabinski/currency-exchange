Currency Exchange Service

The Currency Exchange Service provides real-time currency conversion capabilities, allowing users to convert amounts between different currencies efficiently.

## Features

- **Real-Time Conversion:** Instantly convert currency values based on up-to-date exchange rates.
- **Historical Data:** Retrieve historical exchange rates for various currencies.
- **Secure Transactions:** Ensures safe and reliable exchange processes.
- **Comprehensive API:** A robust set of endpoints for seamless integration.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **npm**: Node package manager is required to manage dependencies.
- **Docker**: Required for local development and testing.

### Installation

1. Clone the Repository:
   ```sh
   git clone https://github.com/rafalbabinski/currency-exchange.git
   ```
2. Navigate to the Project Directory:
   ```sh
   cd currency-exchange
   ```
3. Install Dependencies:
   ```sh
   npm install
   ```
4. Set Up Environment Variables:
   - Rename `.env.dist` to `.env`.
   - Fill in all required environment variables.

### Running the Application

#### Running Docker:
```sh
docker-compose up
```

#### Development Mode:
```sh
npm run dev
```

## API Endpoints

The service exposes several RESTful endpoints for currency conversion and data retrieval:

### 1. Import Rates
**Endpoint:** `POST /rates-importer`
**Description:** Imports exchange rates for various currencies.

#### Response:
```json
{
  "currency": "CURRENCY_CODE",
  "rates": [
    {
      "currency": "CURRENCY_CODE",
      "rate": number
    }
  ]
}
```

### 2. Get Actual Rates
**Endpoint:** `GET /get-rates`
**Description:** Retrieves the latest exchange rates.

#### Query Parameters:
- `currencyFrom`: The base currency code (e.g., USD).

#### Response:
```json
{
  "CURRENCY_CODE": number
}
```

### 3. Start Transaction
**Endpoint:** `POST /transaction/start`
**Description:** Initiates a currency exchange transaction.

#### Request Body:
```json
{
  "currencyFrom": "CURRENCY_CODE",
  "currencyTo": "CURRENCY_CODE",
  "currencyFromAmount": number
}
```

#### Response:
```json
{
  "transactionId": "string",
  "status": "pending"
}
```

### 4. Check Transaction Status
**Endpoint:** `GET /transaction/{id}/status`
**Description:** Retrieves the current status of a transaction.

#### Response:
```json
{
  "status": "TRANSACTION_STATUS"
}
```

### 5. Save Transaction User Data
**Endpoint:** `POST /transaction/{id}/save-user-data`
**Description:** Stores user information required for a transaction.

#### Request Body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "city": "string",
  "street": "string",
  "zipCode": "string",
  "email": "string"
}
```

#### Response:
```json
{
  "success": true
}
```

### 6. Complete Transaction
**Endpoint:** `POST /transaction/{id}/payment`
**Description:** Completes the transaction by processing payment details.

#### Request Body:
```json
{
  "cardholderName": "string",
  "cardNumber": "string",
  "expirationMonth": "string",
  "expirationYear": "string",
  "ccv": "string"
}
```

#### Response:
```json
{
  "success": true
}
```

## Application Architecture

The project follows a modular architecture, organized as follows:

- **`functions/`**: Core business logic for currency conversion and data retrieval.
- **`data/`**: Data-related modules, such as exchange rate sources.
- **`shared/`**: Shared utilities and helper functions.
- **`workflows/transaction-workflow/`**: Manages transaction-related workflows.

## Development & Debugging

### Running Workflows Locally
```sh
npm run start-workflow --workflow=NAME_OF_THE_WORKFLOW
```

### Debugging Locally
Serverless uses workers to run lambdas locally. To debug them, use:
```sh
npm run dev-with-debug
```

### Viewing Workflow Logs
To follow step function logs:
```sh
npm run get-sf-logs
```

## Testing

To run tests for the application:
```sh
npm test
```

We use the following testing frameworks:
- **[Supertest](https://github.com/visionmedia/supertest)** for API testing.
- **[Mocha](https://mochajs.org/)** for unit and integration testing.
- **[Zod](https://zod.dev/)** for schema validation.

## Deployment

### Using Bitbucket Pipelines
The deployment pipeline consists of two steps:

1. **Compile (automated start)**
   - Build the application
   - Run Lambda offline
   - Run tests

2. **Deploy (manual action required)**

### Additional Resources
- [Serverless Framework Guide](https://serverless.com/framework/docs/providers/aws/guide/variables/)
- [AWS CLI Configuration](https://serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)
