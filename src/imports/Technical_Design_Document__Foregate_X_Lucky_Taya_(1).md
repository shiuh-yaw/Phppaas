# Technical Design Document: Foregate X Lucky Taya

**Author**: Manus AI

**Date**: March 12, 2026

**Version**: 2.0

## 1. Introduction

This Technical Design Document (TDD) provides a detailed technical blueprint for the **Foregate X Lucky Taya** platform, intended for the engineering team. It outlines the system architecture, technology stack implementation, database design, API specifications, infrastructure, and security considerations, all aligned with PAGCOR regulations and the product requirements defined in the PRD. The platform will feature a React-based frontend and a Java (Spring Boot) backend, deployed on a Platform as a Service (PaaS) environment. A key focus of this design is the implementation of a **Polymarket-style prediction market**, emphasizing verifiable settlement and comprehensive auditability over traditional RNG-based systems.

## 2. System Architecture

Foregate X Lucky Taya will adopt a microservices-based architecture, deployed within a multi-entity Software as a Service (SaaS) model. This approach ensures scalability, resilience, and independent development/deployment cycles for different functional areas.

### 2.1. High-Level Overview

The system comprises three primary layers:

1.  **Frontend Layer**: React applications serving the User Portal, Merchant Admin Portal, and Superadmin Backoffice Portal.
2.  **Backend Services Layer**: A collection of Java (Spring Boot) microservices handling business logic, data persistence, and external integrations.
3.  **Infrastructure Layer**: PaaS components providing managed services for compute, database, messaging, and other foundational elements.

Each merchant entity will operate within its isolated environment, accessible via a unique subdomain, managed by the Superadmin through the Backoffice Portal.

### 2.2. Microservices Breakdown

The backend will be decomposed into several independent microservices, communicating primarily via RESTful APIs and asynchronous messaging queues. Key microservices include:

*   **User Service**: Manages user registration, authentication, profile management, and responsible gaming settings.
*   **Market Service**: Handles the creation, management, and lifecycle of prediction markets.
*   **Trading Service**: Processes trades (buy/sell orders) for market outcome shares.
*   **Settlement Service**: Manages the entire settlement lifecycle, including sourcing outcome data from oracles, calculating payouts, and handling disputes.
*   **Payment Service**: Orchestrates fiat deposits and withdrawals, integrating with external payment gateways.
*   **KYC/AML Service**: Manages identity verification workflows and compliance checks.
*   **Admin Service**: Provides APIs for Superadmin and Merchant Admin portals, including configuration and reporting.
*   **Notification Service**: Handles email, SMS, and in-app notifications.
*   **Fraud Service**: Integrates with external fraud detection tools and manages fraud alerts.
*   **Audit Service**: A dedicated service responsible for generating, storing, and providing access to tamper-evident audit logs for all critical system events.

## 3. Technology Stack Implementation

### 3.1. Frontend (React)

*   **Framework**: React.js for building dynamic and responsive Single Page Applications (SPAs).
*   **State Management**: Redux or React Context API for predictable state management across complex UIs.
*   **Routing**: React Router for declarative navigation.
*   **UI Component Library**: Material-UI or Ant Design for consistent and aesthetically pleasing UI components, adhering to the Foregate aesthetic preference [9].
*   **Build Tool**: Webpack or Vite for bundling, transpilation, and optimization.
*   **Responsiveness**: Mobile-first responsive design principles will be applied to ensure optimal experience across devices [10].

### 3.2. Backend (Java)

*   **Framework**: Spring Boot for rapid development of robust, production-ready microservices.
*   **Language**: Java 17+.
*   **API Design**: RESTful APIs with JSON payloads for inter-service communication and frontend interaction. OpenAPI/Swagger for API documentation.
*   **Security**: Spring Security for authentication (JWT-based for stateless services) and authorization (Role-Based Access Control - RBAC) [13].
*   **Data Access**: Spring Data JPA with Hibernate for ORM, simplifying database interactions.
*   **Concurrency**: Leveraging Java's concurrency utilities and Spring's asynchronous capabilities for high-throughput operations.
*   **Testing**: JUnit, Mockito, and Spring Boot Test for comprehensive unit, integration, and end-to-end testing.

### 3.3. Database (MySQL)

*   **Primary Database**: MySQL will serve as the primary relational database for transactional data, ensuring ACID compliance and data integrity.
*   **Schema Design**: A detailed Entity-Relationship Diagram (ERD) will be developed, outlining tables for users, markets, trades, transactions, KYC records, and administrative configurations. Key tables will include:
    *   `users`: Stores user profiles, authentication details, and responsible gaming settings.
    *   `merchants`: Stores merchant-specific configurations and branding.
    *   `markets`: Stores details of prediction markets, including settlement source/oracle information.
    *   `trades`: Records individual trades made by users.
    *   `transactions`: Logs all financial operations (deposits, withdrawals, payouts).
    *   `kyc_records`: Stores KYC verification status and related documentation metadata.
    *   `audit_logs`: A dedicated table for storing immutable audit trail records.
*   **Migration**: Flyway or Liquibase for managing database schema evolution.

### 3.4. PaaS and Infrastructure

*   **Cloud Provider**: Leveraging a major cloud provider (e.g., AWS, GCP, Azure) for its PaaS offerings.
*   **Compute**: Managed container services (e.g., AWS ECS/EKS, Google Kubernetes Engine, Azure Kubernetes Service) for deploying Java microservices, enabling auto-scaling and high availability.
*   **Messaging Queue**: Apache Kafka or RabbitMQ for asynchronous communication between microservices, event streaming, and handling high-volume events (e.g., real-time market updates, trade processing).
*   **Caching**: Redis for distributed caching to reduce database load and improve response times for frequently accessed data.
*   **Load Balancing**: Managed load balancers to distribute incoming traffic across microservice instances.
*   **Monitoring & Logging**: Centralized logging (e.g., ELK Stack, Splunk, CloudWatch Logs) and monitoring (e.g., Prometheus, Grafana, CloudWatch Metrics) for system health, performance, and security auditing.
*   **CI/CD**: Automated CI/CD pipelines (e.g., Jenkins, GitLab CI/CD, GitHub Actions) for continuous integration, testing, and deployment.

### 3.5. Other Tools and Integrations

*   **Workflow Automation**: n8n will be integrated for automating internal operational workflows, such as reporting, alerts, data synchronization, and administrative tasks [14].
*   **Fraud Detection**: Integration with third-party fraud and risk scoring tools (e.g., SEON) via their APIs. The Fraud Service will act as an intermediary [2].
*   **KYC/AML Providers**: APIs from external KYC/AML service providers for identity verification and document processing.
*   **Payment Gateways**: Integration with PayMongo, Dragonpay, and Maya Business APIs for fiat transactions. The Payment Service will handle the orchestration and secure communication.

## 4. Module-Specific Technical Details

### 4.1. Prediction Market Modules

*   **Market Creation**: The Market Service will provide endpoints for creating new markets, including defining the settlement source/oracle (e.g., a specific API endpoint, a trusted news source).
*   **Trading**: The Trading Service will manage the orderbook and AMM logic, processing buy/sell orders and ensuring fair price discovery.
*   **Settlement Service**: This service is critical for compliance and will be designed with the following principles:
    *   **Oracle Integration**: The service will integrate with pre-defined settlement sources/oracles to fetch event outcomes. This may involve polling external APIs, scraping web pages, or manual input by authorized administrators for non-automatable events.
    *   **Payout Calculation**: The service will execute payout calculations based on transparent and verifiable formulas, including fee deductions and rounding rules. All calculation steps will be logged.
    *   **Dispute Mechanism**: A state machine will be implemented to manage the dispute lifecycle (e.g., `OPEN`, `DISPUTED`, `RESOLVED`). Disputed markets will have payouts paused until an administrator resolves the issue.
*   **Auditability**: The Audit Service will subscribe to events from the Market, Trading, and Settlement services to create an immutable audit trail. This includes:
    *   Market creation and modification events.
    *   All trades and their corresponding prices.
    *   Settlement data, including the raw data from the oracle and the final resolved outcome.
    *   Payout calculations and individual user payout amounts.
    *   Dispute creation, updates, and resolution.

### 4.2. Payment System

*   **Deposit Flow**: The Payment Service will expose an API endpoint for deposit initiation. It will securely communicate with selected payment gateways, handle redirects, process webhooks for transaction status updates, and update user balances. Transaction Risk Analysis (TRA) will be integrated with 3D Secure (3DS) for enhanced security [8].
*   **Withdrawal Flow**: The Payment Service will manage withdrawal requests, perform necessary validations (e.g., balance check, withdrawal limits, KYC status), and initiate payouts through payment gateway APIs. Manual review processes will be in place for high-value or suspicious withdrawals.
*   **Reconciliation**: Automated daily reconciliation processes will compare internal transaction records with payment gateway reports to ensure data consistency and detect discrepancies.
*   **Dispute Management**: The Admin Service will provide APIs for the Dispute Management Module, allowing administrators to track, investigate, and resolve chargebacks and disputes [3].

### 4.3. KYC/AML Implementation

*   **KYC Workflow**: The KYC/AML Service will orchestrate the KYC process, integrating with third-party identity verification providers. This includes capturing user ID documents, facial recognition data, and compliance questionnaires.
*   **Data Storage**: Sensitive KYC data will be stored securely, encrypted at rest, and access-controlled. Only necessary metadata and verification status will be directly accessible by other services.
*   **KYC Management UI**: The Admin Service will expose APIs for the KYC Management UI in the Admin Portal, displaying customer verification status, provider details, and compliance notes [2].
*   **Transaction Monitoring**: The KYC/AML Service will integrate with the Payment Service to monitor transactions for suspicious patterns, flagging potential AML violations for review.

## 5. Security Considerations

*   **Authentication & Authorization**: JWT-based authentication for API access. Spring Security will enforce RBAC across all backend services, ensuring that only authorized roles (Superadmin, Merchant Admin, User) can access specific resources and perform actions [13]. Dedicated admin portals will be separated from user-facing applications [11].
*   **Data Encryption**: All sensitive data (e.g., personal information, payment details) will be encrypted at rest using industry-standard algorithms. Data in transit will be secured using TLS 1.2+.
*   **Input Validation**: Strict input validation will be implemented at all API endpoints to prevent common vulnerabilities like SQL injection and XSS.
*   **API Security**: Rate limiting, IP whitelisting, and API key management (for merchant integrations) will be implemented to protect public APIs [5].
*   **Vulnerability Management**: Regular security audits, penetration testing, and static/dynamic code analysis will be conducted.
*   **Compliance**: Technical controls will be implemented to meet GLI-19 standards, with a focus on settlement integrity and auditability. The Audit Service will be a key component in demonstrating compliance.

## 6. Deployment Strategy

*   **Environments**: Development, Staging, and Production environments will be maintained.
*   **Containerization**: All microservices will be containerized using Docker.
*   **Orchestration**: Kubernetes (or equivalent managed service) will orchestrate container deployment, scaling, and management.
*   **CI/CD Pipeline**: Automated pipelines will build, test, and deploy code changes to respective environments upon successful code review and merge.
*   **Rollback**: Deployment strategies will include mechanisms for rapid rollback to previous stable versions in case of issues.

## 7. Testing Strategy

*   **Unit Tests**: Comprehensive unit tests for all Java backend services and React components.
*   **Integration Tests**: Tests to verify interactions between microservices and external integrations (databases, payment gateways, oracles).
*   **End-to-End Tests**: Automated E2E tests simulating user and admin workflows, including dispute resolution.
*   **Performance Tests**: Load and stress testing to ensure the platform can handle anticipated traffic.
*   **Security Tests**: Regular vulnerability scanning, penetration testing, and code reviews.
*   **Compliance Tests**: Specific tests to verify the correctness of payout calculations, the reliability of settlement processes, and the integrity of the audit trail.

## 8. Future Considerations

*   **Advanced Analytics**: Implementation of a dedicated data warehousing solution and business intelligence tools.
*   **AI/ML Integration**: Exploring AI/ML for enhanced fraud detection, personalized user experiences, or market prediction models.
*   **Multi-currency Support**: Expansion to support additional fiat currencies beyond PHP.
*   **Mobile App Development**: Native iOS/Android applications for an optimized mobile experience.

## 9. References

1.  [Foregate Project Acronym Clarification: BC = Betting](https://www.manus.im/knowledge/Foregate-Project-Acronym-Clarification-BC-Betting)
2.  [Payment Gateway Requirement: External Fraud Tool Integration and KYC/AML Compliance](https://www.manus.im/knowledge/Payment-Gateway-Requirement-External-Fraud-Tool-Integration-and-KYC-AML-Compliance)
3.  [Dispute (Chargeback) Management Module Requirement](https://www.manus.im/knowledge/Dispute-Chargeback-Management-Module-Requirement)
4.  [Multi-Entity SaaS Platform Architecture Preference](https://www.manus.im/knowledge/Multi-Entity-SaaS-Platform-Architecture-Preference)
5.  [Merchant Pricing Structure and Developer Module Requirements](https://www.manus.im/knowledge/Merchant-Pricing-Structure-and-Developer-Module-Requirements)
6.  [API Architecture Separation: Internal vs. External](https://www.manus.im/knowledge/API-Architecture-Separation-Internal-vs-External)
7.  [Payment Widget/Component for Merchant Integration](https://www.manus.im/knowledge/Payment-Widget-Component-for-Merchant-Integration)
8.  [European Payment Flow Requirement: Standalone 3DS with TRA](https://www.manus.im/knowledge/European-Payment-Flow-Requirement-Standalone-3DS-with-TRA)
9.  [Foregate Diagram Aesthetic Preference](https://www.manus.im/knowledge/Foregate-Diagram-Aesthetic-Preference)
10. [Mobile-Responsive Design for Web Applications](https://www.manus.im/knowledge/Mobile-Responsive-Design-for-Web-Applications)
11. [Dedicated Admin Portal Separation](https://www.manus.im/knowledge/Dedicated-Admin-Portal-Separation)
12. [E-commerce Admin Portal Role Management and Separation](https://www.manus.im/knowledge/E-commerce-Admin-Portal-Role-Management-and-Separation)
13. [Comprehensive Role-Based Access Control with Test Credentials](https://www.manus.im/knowledge/Comprehensive-Role-Based-Access-Control-with-Test-Credentials)
14. [n8n Inclusion in Product Requirements Document (PRD)](https://www.manus.im/knowledge/n8n-Inclusion-in-Product-Requirements-Document-PRD)
15. [Foregate PaaS BC Model Documentation Exclusion: Matching Engine](https://www.manus.im/knowledge/Foregate-PaaS-BC-Model-Documentation-Exclusion-Matching-Engine)
