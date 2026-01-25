# **Coupons Management System**

A comprehensive full-stack web application for managing, selling, and purchasing coupons. The system facilitates a marketplace connecting companies and customers, governed by an administrator. Built with **Spring Boot** (Java) for the backend and **React** (TypeScript) with **Material UI** for the frontend.

## **Quick Links**

* **Live Demo**: [https://coupons.runmydocker-app.com/](https://coupons.runmydocker-app.com/) 
* **Swagger API**: [https://coupons.runmydocker-app.com/swagger-ui.html#/](https://coupons.runmydocker-app.com/swagger-ui.html#/) 
* **Backend Repository**: [https://github.com/elad9219/coupons-system-backend](https://github.com/elad9219/coupons-system-backend)  
* **Frontend Repository**: [https://github.com/elad9219/coupons-system-react](https://github.com/elad9219/coupons-system-react)

## **Table of Contents**

* [Overview](https://www.google.com/search?q=%23overview)  
* [Features](https://www.google.com/search?q=%23features)  
* [Technologies](https://www.google.com/search?q=%23technologies)  
* [Screenshots](https://www.google.com/search?q=%23screenshots)  
* [Installation](https://www.google.com/search?q=%23installation)  
* [Usage & Demo Credentials](https://www.google.com/search?q=%23usage)  
* [Project Structure](https://www.google.com/search?q=%23project-structure)  
* [Contact](https://www.google.com/search?q=%23contact)

## **Overview**

The Coupons System is a Single Page Application (SPA) designed to handle high-load coupon trading. It features a robust **RESTful API**, JWT-based authentication, and a scheduled daily job that automatically invalidates expired coupons. The frontend provides a responsive, professional dashboard for all user types.

## **Features**

### **For Administrator**

* **Company Management**: Add, update, delete, and view all companies in the system.  
* **Customer Management**: Add, update, delete, and view all customers.  
* **System Oversight**: Full access to view system data.

### **For Companies**

* **Coupon Management**: Create new coupons with categories, prices, images, and expiration dates.  
* **Inventory Control**: Update existing coupons and track stock (Amount).  
* **Dashboard**: View all active coupons belonging to the specific company.  
* **Filtering**: Filter coupons by category and maximum price.

### **For Customers**

* **Marketplace**: Browse all available coupons in the system.  
* **Purchase System**: Buy coupons (stock and expiration validated in real-time).  
* **Personal Portfolio**: View purchased coupons history.  
* **Smart Filtering**: Filter available or owned coupons by category and price.

### **General / System**

* **Security**: Secure Login with JWT (JSON Web Tokens) and Role-Based Access Control (RBAC).  
* **Daily Job**: Background thread that runs once a day to detect and mark expired coupons.  
* **Guest Mode**: View available coupons and register as a new customer.

## **Technologies**

### **Backend**

* **Language**: Java 11  
* **Framework**: Spring Boot 2.7.11  
* **Database**: PostgreSQL  
* **ORM**: Hibernate / Spring Data JPA  
* **Security**: Spring Security, JWT (jjwt)  
* **Documentation**: Swagger 2  
* **Tools**: Lombok, Maven

### **Frontend**

* **Framework**: React 18  
* **Language**: TypeScript  
* **State Management**: Redux Toolkit  
* **Routing**: React Router DOM v6  
* **UI Library**: Material UI (MUI) v5  
* **HTTP Client**: Axios (with Interceptors)

### **DevOps**

* **Containerization**: Docker  
* **Deployment**: Docker Cloud

## **Screenshots**



### **Home Page**




<img width="2512" height="1270" alt="image" src="https://github.com/user-attachments/assets/6d8f561f-6869-4500-80fe-36e66184b5a2" />





### **Login Page**



<img width="2557" height="1271" alt="image" src="https://github.com/user-attachments/assets/81ab870a-096c-4ffc-aec8-242cff011891" />





### **Get All Companies**



<img width="2553" height="1266" alt="image" src="https://github.com/user-attachments/assets/4ef1f8b6-1288-412d-a003-ba826a6f0f1b" />





### **Get a Customer By ID **



<img width="2545" height="1266" alt="image" src="https://github.com/user-attachments/assets/e4adeb59-0f3c-4619-8d63-6c9c151ec33a" />





### **Add a Company**



<img width="2550" height="1270" alt="image" src="https://github.com/user-attachments/assets/73a88301-a3a6-44a5-b0b5-b931e1441ddb" />





### **Create a Coupon**





<img width="2554" height="1271" alt="image" src="https://github.com/user-attachments/assets/45cee5c1-ce9e-4850-a4c7-5c280d656525" />






### **Purchase a Coupon**




<img width="2559" height="1270" alt="image" src="https://github.com/user-attachments/assets/727fe491-e3e0-4b9c-9006-815e4e6d0b9a" />









## **Installation**

### **Prerequisites**

* Java 11 JDK  
* Node.js & npm  
* PostgreSQL Database  
* Docker (Optional)

### **1\. Database Setup**

Ensure you have a PostgreSQL instance running. Update the application.properties file:

spring.datasource.url=jdbc:postgresql://\[node128.codingbc.com:7878/niv\_test\](https://node128.codingbc.com:7878/niv\_test)  
spring.datasource.username=postgres  
spring.datasource.password=Nov2017890\#

### **2\. Backend Setup**

Navigate to the backend directory and run:

mvn clean install  
mvn spring-boot:run

### **3\. Frontend Setup**

Navigate to the frontend directory and run:

npm install  
npm start

## **Usage**

To test the system immediately, use these demo credentials:

| Role | Email | Password |
| ----: | ----: | ----: |
| **Administrator** | admin@admin.com | admin |
| **Company** | sony@contact.com | 1234 |
| **Customer** | kobi@gmail.com | 1234 |

## **Project Structure**

### **Backend Structure**

src/main/java/com/jb/spring\_coupons\_project/  
├── advice/           \# Global Exception Handlers  
├── beans/            \# Entities (Company, Customer, Coupon)  
├── clr/              \# Data Seeding (CommandLineRunner)  
├── config/           \# CORS, Swagger, RestTemplate Config  
├── controller/       \# REST Controllers (API Endpoints)  
├── dailyJob/         \# Scheduled Tasks (Expiration Logic)  
├── repository/       \# JPA Repositories (DAO)  
├── security/         \# JWT Utilities & Logic  
└── service/          \# Business Logic (Admin, Company, Customer)

### **Frontend Structure**

src/  
├── Components/  
│   ├── admin/        \# Admin specific components  
│   ├── company/      \# Company specific components  
│   ├── customer/     \# Customer specific components  
│   ├── user/         \# Login, Register, Public views  
│   ├── mainLayout/   \# Layout wrapper  
│   └── routing/      \# App Routes  
├── redux/            \# Store and Reducers  
└── util/             \# Interceptors and Globals

## **Contact**

* **Author**: Elad Tennenboim  
* **GitHub**: [elad9219](https://github.com/elad9219)  
* **Email**: elad9219@gmail.com  
* **LinkedIn**: [https://www.linkedin.com/in/elad-tennenboim/](https://www.linkedin.com/in/elad-tennenboim/)
