# Project Plan: Foregate X Lucky Taya

**Author**: Manus AI

**Date**: March 12, 2026

**Version**: 2.0

## 1. Executive Summary

This document outlines the comprehensive project plan for **Foregate X Lucky Taya**, an online gaming platform tailored for the Philippine market. The platform will operate as a **Polymarket-style prediction market**, where outcomes are determined by real-world events ("natural randomness") rather than a controllable Random Number Generator (RNG). The project will leverage a Platform as a Service (PaaS) backbone for robust backend operations, with a **Java backend** and a **React frontend**. Key features include verifiable settlement processes, fiat payment acceptance, and fiat payout capabilities, all designed with strict adherence to local regulations and a multi-entity SaaS architectural model. The compliance strategy will follow a structured 2-phase approach to ensure efficient lab certification.

## 2. Project Goals and Objectives

The primary goal is to establish a compliant, scalable, and user-friendly prediction market platform for the PHP market. Specific objectives include:

*   **Regulatory Compliance**: Achieve full compliance with PAGCOR regulations, with a focus on payout/settlement correctness, auditability, and responsible gaming, rather than traditional RNG certification.
*   **Market Customization**: Develop a responsive and intuitive frontend experience using React, optimized for the Philippine market.
*   **Robust Backend**: Implement a scalable and high-performance backend using Java (Spring Boot) on a PaaS infrastructure.
*   **Secure & Auditable Systems**: Integrate secure fiat payment systems and ensure all transactions and settlements are fully auditable and tamper-evident.
*   **Multi-Entity Architecture**: Design and implement a multi-tenant SaaS platform capable of supporting multiple independent merchant entities.

## 3. Core Features and Functionality

**Foregate X Lucky Taya** will incorporate the following core modules:

*   **Polymarket-Style Prediction Markets**: Users will trade on the outcomes of real-world events. The platform will support market creation, trading, and fee structures.
*   **Verifiable Settlement**: The platform will feature a robust and transparent settlement process. This includes:
    *   **Settlement Source/Oracle**: Clear identification and use of reliable external data sources to determine event outcomes.
    *   **Dispute Resolution**: A defined process for handling disputes and appeals regarding market settlements.
    *   **Payout Correctness**: Verifiable payout calculations, including rounding rules and fee deductions.
*   **User Management**: Comprehensive user registration, authentication, account management, and profile customization.
*   **Fiat Payment & Payouts**: Secure integration with local payment gateways for PHP deposits and withdrawals.
*   **Dispute Management Module**: A dedicated module to handle chargebacks and payment-related disputes [3].

## 4. Architectural Design: Multi-Entity SaaS Model

The platform will adopt a multi-entity Software as a Service (SaaS) architecture, enabling the support of multiple independent entities (merchants) with distinct operations while maintaining a centralized control system [4].

*   **Superadmin Backoffice Portal**: A central portal for a Superadmin role to configure global settings [4].
*   **Merchant Admin Portal**: A dedicated admin portal for each merchant, including a developer module for API key management and security rules [4] [5].
*   **User Portal**: A user-facing portal built with React for accessing prediction markets and managing accounts [4].
*   **Subdomain Isolation**: Each merchant entity will be accessible via a unique subdomain [4].
*   **API Architecture Separation**: The system will feature separate private and public API sets [6].

## 5. Technology Stack

*   **Frontend**: **React.js** for a modern, responsive user experience.
*   **Backend**: **Java (Spring Boot)** for robust, scalable microservices.
*   **Database**: **MySQL** for transactional data, with potential for NoSQL databases for specific use cases.
*   **PaaS**: Deployment on a major cloud provider (e.g., AWS, GCP, Azure).
*   **Payment Gateway Integration**: APIs from local providers (PayMongo, Dragonpay, Maya Business) [7].
*   **Security & Compliance Tools**: Integration with third-party services for fraud detection (e.g., SEON), KYC/AML, and 3DS with TRA [2] [8].

## 6. Compliance and Regulatory Strategy

Adherence to PAGCOR regulations is paramount. The compliance strategy will focus on the integrity of the financial and settlement aspects of the platform.

### 6.1. Compliance Focus

Given the "natural randomness" of the prediction markets, the compliance lab review will concentrate on:
*   **Payout/Settlement Correctness**: Verifying the accuracy of calculations, the reliability of the settlement source/oracle, and the handling of edge cases.
*   **Dispute Resolution**: Ensuring a fair and transparent process for resolving settlement disputes.
*   **Auditability**: The ability to provide complete, tamper-evident audit logs for all financial transactions and market settlements.

### 6.2. 2-Phase Compliance Approach

To streamline the certification process and minimize costs, a 2-phase approach is recommended:

*   **Phase 1: Readiness Assessment**: A fast-track review involving a detailed checklist, compilation of required documents (e.g., game rules, system architecture), and a Q&A session to assess readiness.
*   **Phase 2: Pre-Submission Check**: A thorough pre-check of the complete compliance and submission package before it is sent to the official testing lab. This helps to identify and rectify potential issues, avoiding costly and time-consuming rejections.

## 7. Project Scoping and Information Gathering

To properly scope the project and timeline, the following information is required from the client:

1.  **Operating Model**
    *   Will the platform be launched online (web/mobile), or will it operate within a licensed casino environment or under another specific gaming license?
    *   Which jurisdiction and regulator will govern the operation (e.g., PAGCOR in the Philippines)?

2.  **Game Overview** (1–2 pages)
    *   **Game Rules**: Detailed rules for market creation, trading mechanics, fee structures, and market closing conditions.
    *   **Settlement Process**: How are outcomes determined? Specify the settlement source/oracle, and the process for disputes and appeals.
    *   **Payout Mathematics**: Provide all formulas for calculating payouts, rounding rules, fee deductions, and any maximum exposure/liability limits.

3.  **System & Controls**
    *   **Fund Custody**: Where are user funds held (e.g., custody, escrow, treasury), and how are payouts executed?
    *   **Audit & Reporting**: What audit logs and reporting capabilities are in place? How is tamper evidence ensured?
    *   **Compliance Controls**: Detail the implementation of KYC/AML procedures and any geo-restriction mechanisms.

## 8. References

1.  [Foregate Project Acronym Clarification: BC = Betting](https://www.manus.im/knowledge/Foregate-Project-Acronym-Clarification-BC-Betting)
2.  [Payment Gateway Requirement: External Fraud Tool Integration and KYC/AML Compliance](https://www.manus.im/knowledge/Payment-Gateway-Requirement-External-Fraud-Tool-Integration-and-KYC-AML-Compliance)
3.  [Dispute (Chargeback) Management Module Requirement](https://www.manus.im/knowledge/Dispute-Chargeback-Management-Module-Requirement)
4.  [Multi-Entity SaaS Platform Architecture Preference](https://www.manus.im/knowledge/Multi-Entity-SaaS-Platform-Architecture-Preference)
5.  [Merchant Pricing Structure and Developer Module Requirements](https://www.manus.im/knowledge/Merchant-Pricing-Structure-and-Developer-Module-Requirements)
6.  [API Architecture Separation: Internal vs. External](https://www.manus.im/knowledge/API-Architecture-Separation-Internal-vs-External)
7.  [Payment Widget/Component for Merchant Integration](https://www.manus.im/knowledge/Payment-Widget-Component-for-Merchant-Integration)
8.  [European Payment Flow Requirement: Standalone 3DS with TRA](https://www.manus.im/knowledge/European-Payment-Flow-Requirement-Standalone-3DS-with-TRA)
