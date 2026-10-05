# Coupons Management System

A full-stack coupon marketplace built with Spring Boot and React. The application supports administrator, company, customer, and guest flows, with JWT authentication, role-based authorization, inventory validation, scheduled coupon expiration handling, and a responsive Material UI frontend.

## Quick Links

- **Live Demo:** [coupons-gamma.vercel.app](https://coupons-gamma.vercel.app/)
- **API Documentation (Swagger):** [coupons.runmydocker-app.com/swagger-ui.html](https://coupons.runmydocker-app.com/swagger-ui.html)
- **Backend Repository:** [github.com/elad9219/coupons-system-backend](https://github.com/elad9219/coupons-system-backend)
- **Frontend Repository:** [github.com/elad9219/coupons-system-react](https://github.com/elad9219/coupons-system-react)

## Highlights

- **Role-based access:** Separate capabilities for administrators, companies, customers, and guests.
- **JWT authentication:** Spring Security and JWT protect authenticated application flows.
- **Real-time purchase validation:** Validates stock and expiration before a coupon purchase is completed.
- **Scheduled expiration handling:** A background job checks for expired coupons and updates the system automatically.
- **Company inventory management:** Companies can create, update, delete, filter, and monitor their coupons.
- **Customer marketplace:** Customers can browse, purchase, filter, and view previously purchased coupons.
- **Responsive frontend:** React, TypeScript, Redux Toolkit, React Router, Material UI, and Axios interceptors.

> **Database note:** The project was originally developed with MySQL and was later migrated to PostgreSQL for deployment.

## Technologies

### Backend

- Java 11
- Spring Boot 2.7.11
- Spring Data JPA / Hibernate
- PostgreSQL
- Spring Security
- JWT
- Swagger 2
- Lombok
- Maven

### Frontend

- React 18
- TypeScript
- Redux Toolkit
- React Router DOM v6
- Material UI v5
- Axios with interceptors

### Deployment

- Docker
- Vercel frontend deployment

## Screenshots

### Home Page

<img width="2512" height="1270" alt="Coupons home page" src="https://github.com/user-attachments/assets/6d8f561f-6869-4500-80fe-36e66184b5a2" />

### Login Page

<img width="2557" height="1271" alt="Coupons login page" src="https://github.com/user-attachments/assets/81ab870a-096c-4ffc-aec8-242cff011891" />

### Get All Companies

<img width="2553" height="1266" alt="Administrator company management" src="https://github.com/user-attachments/assets/4ef1f8b6-1288-412d-a003-ba826a6f0f1b" />

### Get a Customer by ID

<img width="2545" height="1266" alt="Customer lookup" src="https://github.com/user-attachments/assets/e4adeb59-0f3c-4619-8d63-6c9c151ec33a" />

### Add a Company

<img width="2550" height="1270" alt="Add company form" src="https://github.com/user-attachments/assets/73a88301-a3a6-44a5-b0b5-b931e1441ddb" />

### Create a Coupon

<img width="2554" height="1271" alt="Create coupon form" src="https://github.com/user-attachments/assets/45cee5c1-ce9e-4850-a4c7-5c280d656525" />

### Purchase a Coupon

<img width="2559" height="1270" alt="Coupon purchase flow" src="https://github.com/user-attachments/assets/727fe491-e3e0-4b9c-9006-815e4e6d0b9a" />

## Demo Credentials

These are public demo accounts intended only for testing the deployed application.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@admin.com` | `admin` |
| Company | `sony@contact.com` | `1234` |
| Customer | `kobi@gmail.com` | `1234` |

## Local Setup

### Prerequisites

- Java 11
- Maven
- Node.js and npm
- PostgreSQL
- Docker (optional)

### Backend

```bash
git clone https://github.com/elad9219/coupons-system-backend.git
cd coupons-system-backend
```

Create your local `src/main/resources/application.properties` from the example file and use your own database values:

```properties
spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DATABASE>
spring.datasource.username=<USERNAME>
spring.datasource.password=<PASSWORD>
```

Then build and run:

```bash
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
git clone https://github.com/elad9219/coupons-system-react.git
cd coupons-system-react
npm install
npm start
```

## Project Structure

### Backend

```text
src/main/java/com/jb/spring_coupons_project/
├── advice/
├── beans/
├── clr/
├── config/
├── controller/
├── dailyJob/
├── repository/
├── security/
└── service/
```

### Frontend

```text
src/
├── Components/
│   ├── admin/
│   ├── company/
│   ├── customer/
│   ├── user/
│   ├── mainLayout/
│   └── routing/
├── redux/
└── util/
```

## Contact

- **Elad Tennenboim**
- **GitHub:** [elad9219](https://github.com/elad9219)
- **LinkedIn:** [linkedin.com/in/elad-tennenboim](https://www.linkedin.com/in/elad-tennenboim/)
- **Email:** elad9219@gmail.com
