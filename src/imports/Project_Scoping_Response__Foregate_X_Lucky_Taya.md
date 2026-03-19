# Project Scoping Response: Foregate X Lucky Taya

**Author**: Manus AI

**Date**: March 12, 2026

**Version**: 1.0

## 1. Introduction

This document provides a comprehensive response to the client's scoping questions for the **Foregate X Lucky Taya** project, leveraging all available information from the Project Plan, Product Requirements Document (PRD), and Technical Design Document (TDD). The aim is to clarify the operational model, game mechanics, and system controls in detail, particularly concerning regulatory compliance and technical implementation.

## 2. Operating Model

### 2.1. Operational Environment

The **Foregate X Lucky Taya** platform is designed to be an **online gaming platform**, primarily accessible via **web and mobile applications** [Project Plan v2.0]. It is not intended to operate within a physical licensed casino environment. The platform will function as a multi-entity Software as a Service (SaaS) model, supporting multiple independent merchant entities, each with its own dedicated user and admin portals [Project Plan v2.0, PRD v2.0].

### 2.2. Jurisdiction and Regulator

The operation of **Foregate X Lucky Taya** will be governed by the **Philippine Amusement and Gaming Corporation (PAGCOR)** in the Philippines. The entire project, from design to implementation, is being developed with strict adherence to PAGCOR's regulatory framework, including Electronic Gaming Licensing, GLI-19 standards, Responsible Gaming Code of Practice, and comprehensive KYC/AML regulations [Project Plan v2.0, PRD v2.0].

## 3. Game Overview

### 3.1. Game Rules (Polymarket-style Prediction Market)

**Foregate X Lucky Taya** will implement a **Polymarket-style prediction market** where users trade on the outcomes of real-world events, relying on "natural randomness" rather than an internal Random Number Generator (RNG) [Project Plan v2.0, PRD v2.0].

*   **Market Creation**: Authorized users (e.g., merchants, creators) will define new prediction markets. This includes specifying the market title, description, event details, specific outcomes for prediction, market opening and closing conditions, and applicable trading fees [PRD v2.0].
*   **Trading**: Users will place bets/trades on market outcomes through an interactive interface. The platform will support both Automated Market Maker (AMM) algorithms for liquidity provision and an Orderbook for real-time display and execution of buy/sell orders for outcome shares [PRD v2.0].
*   **Fees**: Platform fees and settlement fees will be deducted from payouts. The exact fee structure will be defined during market creation [PRD v2.0].
*   **Closing Conditions**: Markets will close based on the occurrence and verifiable outcome of the real-world event they are predicting [PRD v2.0].

### 3.2. Outcome Determination (Settlement Source/Oracle, Disputes, Appeals)

*   **Outcome Determination**: Market outcomes will be determined by utilizing **verifiable external data sources or designated oracles**. The Market Service will provide endpoints for creating new markets, including defining the settlement source/oracle (e.g., a specific API endpoint, a trusted news source, or manual input by authorized administrators for non-automatable events) [PRD v2.0, TDD v2.0].
*   **Dispute Resolution**: A clear mechanism will be in place for users to submit disputes regarding market outcomes. The Settlement Service will implement a state machine to manage the dispute lifecycle (e.g., `OPEN`, `DISPUTED`, `RESOLVED`). Disputed markets will have payouts paused until an administrator resolves the issue through a defined process of review and appeal [PRD v2.0, TDD v2.0].

### 3.3. Payout Mathematics

*   **Formulas and Rounding Rules**: Payouts will be calculated automatically based on market rules, odds, user stakes, and predefined formulas. The system will incorporate specific rounding rules to ensure consistency and fairness. All calculation steps will be logged for auditability [PRD v2.0, TDD v2.0].
*   **Fee Deductions**: Platform fees and settlement fees will be automatically deducted from the gross payout amount before distribution to the user [PRD v2.0].
*   **Max Exposure**: Mechanisms for managing maximum exposure or liability will be part of the market configuration, allowing merchants to define limits to mitigate financial risk [PRD v2.0].

## 4. System & Controls

### 4.1. Fund Custody and Payout Execution

*   **Fund Custody**: User funds (fiat currency) will be managed by the **Payment Service**, which integrates with local payment gateways. While the exact custody model (e.g., direct holding by payment gateway, platform treasury with segregated accounts) will be finalized with the chosen payment partners, the system will ensure secure handling and compliance with financial regulations [Project Plan v2.0, PRD v2.0].
*   **Payout Execution**: Payouts (withdrawals) are initiated through payment gateway APIs after necessary validations, including sufficient balance, adherence to withdrawal limits, and completion of KYC status. Manual review processes will be in place for high-value or suspicious withdrawals [TDD v2.0]. Automated daily reconciliation processes will compare internal transaction records with payment gateway reports to ensure data consistency [TDD v2.0].

### 4.2. Audit Logs, Reporting, and Tamper Evidence

*   **Audit Logs**: The platform will feature comprehensive, tamper-evident audit logs for all critical system events, financial transactions, and market settlements. A dedicated **Audit Service** will subscribe to events from the Market, Trading, and Settlement services to create an immutable audit trail. This includes logging market creation/modification, all trades, settlement data (including raw oracle data and resolved outcomes), payout calculations, and dispute management activities [TDD v2.0].
*   **Reporting**: Centralized logging and monitoring solutions (e.g., ELK Stack, Splunk, CloudWatch Logs) will be implemented for system health, performance, and security auditing. The Admin Service will provide APIs for Superadmin and Merchant Admin portals, including configuration and reporting functionalities [TDD v2.0].
*   **Tamper Evidence**: Technical measures will be implemented to ensure the integrity and tamper-evidence of audit logs, which is crucial for regulatory oversight and lab review [TDD v2.0].

### 4.3. KYC/AML and Geo-Restrictions

*   **KYC/AML**: Comprehensive Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures will be implemented. The **KYC/AML Service** will orchestrate the KYC process, integrating with third-party identity verification providers for capturing user ID documents, facial recognition data, and compliance questionnaires. Sensitive KYC data will be stored securely, encrypted at rest, and access-controlled. A dedicated **KYC Management UI** will be available in the Admin Portal to display customer verification status, provider details, and compliance notes. The KYC/AML Service will also integrate with the Payment Service to monitor transactions for suspicious patterns, flagging potential AML violations for review [PRD v2.0, TDD v2.0].
*   **Geo-Restrictions**: Geo-restriction mechanisms (e.g., IP blocking, country-specific access controls) will be implemented as applicable to the platform's operating model and the target Philippine jurisdiction to ensure compliance with local regulations [Project Plan v2.0].

## 5. Conclusion

This response provides a detailed overview of the **Foregate X Lucky Taya** project's operational and technical aspects as they pertain to the client's scoping questions. The platform is designed to be fully compliant with PAGCOR regulations, with a strong emphasis on the integrity and auditability of its Polymarket-style prediction market mechanics and financial controls. This information forms the basis for further discussions and detailed planning with the client and regulatory bodies.
