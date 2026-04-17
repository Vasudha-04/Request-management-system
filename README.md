Request Management System:

A full-stack web application built with Next.js that implements a structured workflow for managing requests. The system features Role-Based Access Control and a Finite State Machine to enforce strict status transitions.

Features:

Role Switching: Toggle between Creator and Reviewer roles to test different permissions.

State Machine Logic: Requests follow a strict path: Draft → Submitted → Approved/Rejected.

Backend Validation: All inputs are validated using Zod and TypeScript to ensure data integrity.

Responsive UI: Built with Tailwind CSS for a clean, modern experience.

Tech Stack:
Framework: Next.js 

Language: TypeScript

Validation: Zod

Styling: CSS

Storage: In-memory (Server-side variable)

Workflow:

The system enforces the following state transitions:

Current Status            Allowed Next Status             Required Role
Draft                     Submitted, Cancelled            Creator 
Submitted                 Approved, Rejected, Cancelled   Reviewer (Approve/Reject), Creator (Cancel)
Approved                  (End State)                     N/A
Rejected                  (End State)                     N/A
Cancelled                 (End State)                     N/A

Final structure should look like:

<img width="1040" height="780" alt="WhatsApp Image 2026-04-17 at 6 35 59 PM" src="https://github.com/user-attachments/assets/7fe58b3c-bdd6-4314-86d7-142455ac1c94" />


