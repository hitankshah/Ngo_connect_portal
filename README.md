# NGO Connect Portal

**NGO Connect Portal** is a non-profit project designed to help users find and connect with NGOs in their area. The platform facilitates donations and provides features such as OTP-based login, tax receipts, and QR code payments for convenience.

## Features

- List of 50 NGOs with details.
- Donation functionality.
- OTP-based authentication. 
- QR code generation for NGO payments.
- Automatic generation of 80G donation receipts.
- Fundraiser pages for individual NGOs with QR codes.
- User profiles showing donation history and receipts.

## Technologies Used

- Node.js
- Express.js
- MySQL (Database)
- PDFKit (PDF generation for donation receipts)
- QR Code generation

## Getting Started

To get started with this project, follow the installation steps below.

### Prerequisites

You’ll need the following tools:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/hitankshah/ngo-connect-portal.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ngo_connect_portal
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

    Create a `.env` file in the root directory and add your credentials for Firebase, Razorpay, and MySQL.

    ```env

    MYSQL_HOST=your_mysql_host
    MYSQL_USER=your_mysql_user
    MYSQL_PASSWORD=your_mysql_password
    MYSQL_DATABASE=your_mysql_database
    ```

5. Set up MySQL database:

    Run the following commands to create and configure the MySQL database:

    ```sql
    CREATE DATABASE ngo_portal;
    ```

6. Start the application:

    ```bash
    npm start
    ```

The app will run at [http://localhost:3000](http://localhost:3000).

## Usage

- Users can log in using OTP authentication.
- NGOs are displayed with details, and users can donate using Razorpay.
- 80G receipts are automatically generated and available for download from user profiles.

## Project Structure

```bash
.
├── server.js          # Main server file
├── routes             # Contains route files for NGOs, users, and donations
├── models             # Contains database models
├── views              # Contains front-end code
├── public             # Static files like images and styles
└── README.md          # This file
