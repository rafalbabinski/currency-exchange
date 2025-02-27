# Currency Exchange Service

The Currency Exchange Service provides real-time currency conversion capabilities, allowing users to convert amounts between different currencies efficiently.

## Features

- **Real-Time Conversion**: Instantly convert currency values based on up-to-date exchange rates.
- **Historical Data**: Retrieve historical exchange rates for various currencies.
- **Supported Currencies**: Access a wide range of currencies for conversion.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **npm**: Node package manager is required to manage dependencies.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rafalbabinski/currency-exchange.git
   ```

2. **Navigate to the Project Directory**:
   ```bash
   cd currency-exchange
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**:
   - Configure the necessary environment variables within the `.env` file.

### Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

## API Endpoints

The service exposes several RESTful endpoints for currency conversion and data retrieval:

### 1. Import rates

- **Endpoint**: `POST /rates-importer`
- **Description**: Converts a specified amount from one currency to another.
- **Response**:
  ```json
  {
    "currency": CURRENCY_CODE,
    "rates": [{
      "currency": CURRENCY_CODE,
      "rate": number,
    }]
  }
  ```

### 2. Get actual rates

- **Endpoint**: `GET /get-rates`
- **Description**: Retrieves actual rates.
- **Query Parameters**:
  - `currencyFrom`: The base currency code (e.g., `USD`).
- **Response**:
  ```json
  {
    "CURRENCY_CODE": number
  }
  ```

### 3. Start transaction

- **Endpoint**: `POST /transaction/start`
- **Description**: Starts transaction with exchange details.
- **Request Body**:
  ```json
  {
    "currencyFrom": CURRENCY_CODE,
    "currencyTo": CURRENCY_CODE,
    "currencyFromAmount": 100
  }
  ```
- **Response**:
  ```json
  {
    "transactionId": string,
    "status": "pending" | "started" | "waitingForPayment" | "waitingForPaymentStatus" | "paymentSuccess" | "paymentFailure" | "expired" | "error",
  }
  ```

### 4. Check transaction status

- **Endpoint**: `GET /transaction/{id}/status`
- **Description**: Verifies transaction status.
- **Response**:
  ```json
  {
    "status": "pending" | "started" | "waitingForPayment" | "waitingForPaymentStatus" | "paymentSuccess" | "paymentFailure" | "expired" | "error",
  }
  ```

### 5. Start transaction

- **Endpoint**: `POST /transaction/{id}/save-user-data`
- **Description**: Apply required user data for transaction
- **Request Body**:
  ```json
  {
    "firstName": string,
    "lastName": string,
    "city": string,
    "street": string,
    "zipCode": string,
    "email": string
  }
  ```
- **Response**:
  ```json
  {
    "success": boolean,
  }
  ```

  ### 5. Start transaction

- **Endpoint**: `POST /transaction/{id}/save-user-data`
- **Description**: Apply required user data for transaction
- **Request Body**:
  ```json
  {
    "firstName": string,
    "lastName": string,
    "city": string,
    "street": string,
    "zipCode": string, (accepted formats: XX-XXX, XXXXX, XX XXX)
    "email": string
  }
  ```
- **Response**:
  ```json
  {
    "success": boolean,
  }
  ```

  ### 6. Complete transaction

- **Endpoint**: `POST /transaction/{id}/payment`
- **Description**: Completes transaction with payment details.
- **Request Body**:
  ```json
  {
    "cardholderName": string,
    "cardNumber": string,
    "expirationMonth": string,
    "expirationYear": string,
    "ccv": string
  }
  ```
- **Response**:
  ```json
  {
    "success": boolean,
  }
  ```

## Application Architecture

The project follows a modular architecture, organized as follows:

- **`functions/`**: Contains the core business logic for currency conversion and data retrieval.
- **`data/`**: Holds data-related modules, such as exchange rate data sources.
- **`shared/`**: Includes shared utilities and helper functions used across the application.
- **`workflows/transaction-workflow/`**: Manages transaction-related workflows and processes.

## Testing

To run tests for the application:

```bash
npm test
```
