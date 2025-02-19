# HR Portal Implementation Report

## 1. Initial Setup and Authentication [COMPLETED]

- [x] Basic Next.js project setup
- [x] Configure Supabase project
- [x] Set up Google OAuth
- [x] Implement basic authentication flow
- [x] Create protected routes

## 2. Database Schema and Models [COMPLETED]

- [x] Design and implement Users table
- [x] Design and implement Timesheets table
- [x] Design and implement Time Off Requests table
- [x] Design and implement Clients table
- [x] Design and implement Projects table

## 3. Core Features - Phase 1 [COMPLETED]

- [x] Create basic layout and navigation
- [x] Implement user profile management
- [x] Build timesheet management
  - [x] Create client management (admin only)
    - [x] Client list view
    - [x] Add/edit client form
    - [x] Client deletion with safeguards
    - [x] Client archiving functionality
  - [x] Create project management (admin only)
    - [x] Project list view
    - [x] Add/edit project form with client selection
    - [x] Project deletion with safeguards
    - [x] Project archiving functionality
  - [x] Build timesheet interface
    - [x] Weekly view with day columns
    - [x] Project selection dropdown
    - [x] Hours input for each day
    - [x] Weekly navigation
    - [x] Total hours calculation
    - [x] Draft and submit functionality
    - [x] Empty timesheet submission
    - [x] Status indicators
- [x] Create time-off request interface
  - [x] Request form with type, dates, and description
  - [x] Draft and submit functionality
  - [x] List view with status indicators
  - [x] Edit draft requests

## 4. Admin Features - Phase 2 [COMPLETED]

- [x] Implement user & role management
  - [x] List users with their roles
  - [x] Invite new users by email
  - [x] Change user roles with confirmation
  - [ ] TODO: Implement email notifications for invites
- [x] Build client/project management interface
- [ ] Create reporting views
- [x] Admin approval pages
  - [x] Time off requests management
    - [x] List all requests with statusz
    - [x] Approve/reject functionality
    - [x] Filter by status
  - [x] Timesheet approvals
    - [x] List all timesheets with status
    - [x] Approve/reject functionality
    - [x] Filter by status
- [x] Time sheets current week button

## 5. Last part - Phase 3

- [x] Fix file errors
- [x] Create admin dashboard
- [x] Implement data filtering and search
- [x] Add data visualization
- [ ] TODO: Cookie error - it has to do soemthing with nextjs 15 ... async cookies ... etc
- [ ] TODO: Server log error fixes - solved but its the same things, async API routes ... etc
- [x] Time sheets page dropdown make more readable
- [x] Think about if a time sheet can be rejected after it was approved ??? -> can, if it was a mistake, sounds reasonable
- [x] Error handling!!!
  - [x] Add more error handling
  - [x] Error Pages
    - [x] 404 page (not-found.tsx) - Handles missing routes and notFound() calls
    - [x] 500 page (error.tsx) - Global error boundary for uncaught errors
    - [x] Generic error page for critical errors - Custom error handling with codes
  - [x] Type Safety Improvements
    - [x] Fix remaining 'any' types in props
    - [x] Add proper error typing in catch blocks
    - [x] Add proper typing for API responses
  - [x] Error Recovery
    - [x] Add retry mechanisms for failed API calls
    - [x] Add proper error boundaries
    - [x] Add fallback UI states
  - [x] Validation
    - [x] Add date range validation for time-off
    - [x] Add hours validation for timesheets
    - [x] Add form validation improvements
- [ ] SQL files into 1 single file
  - [x] Add a single migration file
  - [ ] TODO: Test the new migration file, if the database is working as expected
- [O] Implement export functionality -> not implemented, we wont need this
- [O] Add email notifications

## 6. Enhancement and Polish - Phase 4

- [x] Fix admin dashboard
- [x] Add time frame to admin dashboard
- [ ] Performance optimization
  - [x] server side rendering
  - [x] performance optimizations
  - [x] Add load masks
    - [x] Check timesheet page
    - [x] Check profile page
    - [x] Check users page
    - [x] Check projects page
    - [x] Check clients page
    - [x] Check timesheet approval page
    - [x] Check time off approval page
    - [x] Check time off page
    - [x] Check admin dashboard
- [x] draft timesheet page should reflet the real status of the timesheet

## 7. Testing & deployment

- [x] Move to supabase/ssr -> might solve the cookie error -> NO IT DOES NOT SOLVE IT
- [ ] Ensure that all the pages are working as expected
- [ ] Write unit tests for each components
- [ ] Write integration tests for each pages
- [ ] Write end to end tests for each pages
- [ ] Documentation
- [ ] Production deployment

## 8. Enhancement and Polish - Phase 5

- [ ] Review DB schema
- [ ] Recreate DB schema in another database
- [ ] Remove DB functions
- [ ] Configure email service
  - [ ] Set up Gmail SMTP
    - [ ] Enable 2-Step Verification
    - [ ] Generate App Password
    - [ ] Configure Supabase SMTP settings
  - [ ] Configure Supabase email templates
  - [ ] Update redirect URLs for production
- [ ] Review and improve role management
- [ ] Add workspace to the registration / invitation (so we can take it to market)
- [ ] Add cash flow page
  - [ ] Add a cash flow page
  - [ ] We can create an expenses part
  - [ ] Payroll part
  - [ ] Sent invoices part (and mark them ready when it is done
  - [ ] Monthly bank account report
  - [ ] Received invoices part
  - [!] We can create a place where we can upload the files
  - [!] We can create an accountant role, so we don't have to send the things to them regularly, as they would just see it, but us as well
  - [!] We can start market it through our accountant, if they like it, they will recommend us
  - [!] Multiple currencies
- [ ] Add "billing" to see when did we sent and invoice for how much and where
  - [ ] Add billing page, where you can filter for a time frame and project and see all teh past invoices and the uninvoiced worked hours
  - [ ] Add a button to create an invoice
  - [ ] The invoice will be sent manually, but we can hook up with szamlazz.hu, so we can create it automatically as well
  - [!] We can store the invoices with all the docuemnts, so we wnt need to upload it, as it was generated and got back right away.
- [ ] Add a documents part, where we can upload documents and employees can download them
  - [ ] Add a documents page
  - [ ] Employee can upload documents, and we can see them in the documents page
  - [ ] Admin can upload a document for a specific user
  - [ ] Employee can upload documents for Admin, so we can see it in the documents page
  - [ ] 2 pages uploaded/downloadable documents for employees and admins
- [ ] Notifications center - alerts, etc.

## 9. Testing and Deployment

- [ ] Improve UI/UX
- [ ] Reorganaising the code
  - [ ] remove unused dependencies from each file
  - [ ] remove unused packages
  - [ ] Move all the components to the components folder
  - [ ] Move all the types to the types folder
  - [ ] Move all the utils to the utils folder
  - [ ] Move all the hooks to the hooks folder
  - [ ] Move all the services to the services folder
  - [ ] Move all the pages to the pages folder
- [ ] Revisit error handling

- [ ] Add stripe integration for payments
- [ ] Add a knowledge base
- [ ] Add a calendar
- [ ] Add a time tracker

- [ ] Security audit

---

\***\*\*\*\*\***\*\*\***\*\*\*\*\*** BUGS \***\*\*\*\*\***\*\*\***\*\*\*\*\***

// TODO: Redirect to error page
// return NextResponse.redirect(new URL("/error?code=auth", request.url));

---

Feature 1: Invoice Generation for Projects
Overview
Create an admin interface to generate invoices based on timesheet data. For each selected project and a given custom timeframe (via two date pickers), the system will aggregate the total hours worked per employee (from the timesheets table) and allow the admin to create an invoice. When an invoice is generated, the corresponding timesheet entries will be “locked” (marked as invoiced) so they aren’t counted again. Additionally, there will be an invoice history view for each project/client.

Key Requirements
Data Source & Aggregation:

The system will use existing timesheet data, where daily hours per project are already stored.
A custom SQL query (or equivalent ORM call) will sum up the hours for each employee on a given project within the chosen timeframe.
Hours that have already been invoiced should be excluded.
Timeframe Selection:

Admin can choose a custom timeframe using two date pickers (start date and end date).
Validation must ensure that the start date precedes the end date.
Invoice Creation:

On clicking “Create Invoice,” the system will:
Aggregate the hours per employee.
Create an invoice record (storing at least the project ID, invoice creation date, employee-wise hours, and possibly a flag or a date field in the timesheet entries indicating they’ve been invoiced).
Mark the invoiced timesheet entries so they are excluded from future invoices.
Some timesheet entries (e.g. for internal projects) might be non-billable; these should be handled accordingly (e.g., via a flag in the timesheet record).
Invoice History:

An admin page where invoices can be searched or filtered by project and client.
Each invoice entry shows details such as date, total hours billed (per employee), and any other relevant metadata.
Flexibility for Future Changes:

Although hours are the default unit for now, design the data model and UI so it can later be adapted to other units (e.g., days or weekly summaries) if needed.
Task List for Feature 1
Data Modeling & Database Changes:

Review the current timesheets table.
Add a new column (or related table) to record the invoice creation date or invoice ID for invoiced entries.
If needed, add a flag (or a separate status column) to mark non-billable vs. billable entries.
Backend / API:

Develop an API endpoint (or server action) to fetch timesheet data for a selected project within a given timeframe.
Write a query to aggregate hours per employee (excluding invoiced hours) for the given project and timeframe.
Develop an API endpoint (or server action) for creating an invoice:
Validate the selected timeframe.
Aggregate hours.
Insert a new invoice record in an “invoices” table (or update timesheet records with an invoice marker).
Develop an API endpoint to fetch invoice history by project/client.
Frontend (Admin Page):

Design a UI for selecting a project from a list.
Add two date pickers to choose the timeframe.
Display the aggregated hours per employee in a table or list.
Add a “Create Invoice” button.
On click, trigger the API to create an invoice and provide feedback (success or error).
Create a separate invoice history page with search/filter options.
Validation & Testing:

Validate date inputs (start date < end date).
Ensure that invoiced timesheets are excluded in subsequent queries.
Test with various projects and timeframes.
Feature 2: Document Management System for Employees and Admins
Overview
Implement a document storage and management system where both admins and employees can upload and download documents. The system will support two “views”: one for employees to see their own received documents and their own uploads, and one for admins to view a list of employees and then the documents associated with each employee. Documents can be files such as payslips, contracts, or other HR-related files. Files are uploaded to Supabase Storage and are limited to 5 MB in size.

Key Requirements
Document Metadata & Storage:

Store each document’s metadata in the database (e.g., document ID, file name, uploader ID, recipient ID, upload date, document status [new, read/seen, archived]).
File uploads should be limited to 5 MB.
Files will be stored in Supabase Storage. Download functionality should allow direct download from the web app (no extra URL generation required initially).
User Roles & Access Control:

Employees:
View a list of documents "received for them" (uploaded by admin for them) and a separate list of documents they’ve uploaded.
They can download documents.
They can upload new documents.
Admins:
Can view a directory (list) of all employees.
On selecting an employee, admin can see two lists: documents uploaded for that employee and documents the employee has uploaded.
Admin can upload documents for any employee.
Admin has access to all documents across the system.
User Interface & Workflow:

Employee UI:
A simple dashboard that shows two sections: “Documents for Me” and “My Uploads.”
A button to upload a new document.
Admin UI:
A directory view of employees.
On selecting an employee, display two sections similar to the employee view.
Document details (like file name, upload date, and status) should be clearly visible.
Document Lifecycle:

Each document will have a status (e.g., new, read/seen, archived).
Basic actions: upload a new document, download a document, and (optionally) mark as read/archived.
Future enhancement: Add email notifications (for new uploads) and possibly an approval process.
Task List for Feature 2
Database Changes:

Create a new table (e.g., documents) with columns for:

- Document ID (primary key)
- File name
- File URL or reference to Supabase Storage
- Uploader ID
- Recipient ID
- Upload date/time
- Document status (enum: new, read/seen, archived)
- Optional: document type if needed in the future
  Supabase Storage Integration:

Configure Supabase Storage for file uploads (limit file size to 5 MB).
Create API endpoints or use server actions to handle file uploads and downloads.
Ensure that file uploads store the file and then create a corresponding record in the documents table.
Frontend for Employee UI:

Create a dashboard page for employees that displays:
A list of documents received for them.
A list of documents they have uploaded.
A button/form to upload new documents.
Implement file upload functionality (with file selection, upload progress, and error handling).
Implement file download functionality (triggering a direct download).
Frontend for Admin UI:

Create an employee directory page for the admin.
When an employee is selected, display a dashboard similar to the employee UI:
List documents uploaded for that employee.
List documents the employee has uploaded.
Provide an option for the admin to upload a document for the selected employee.
Include navigation between employees and clear labeling of which list is “sent” vs. “received.”
Access Control & Security:

Ensure that queries for documents enforce access rights (e.g., employees can only see documents where their ID matches the recipient or uploader).
Validate file types and size on upload.
Test that an admin can access documents for any employee while an employee’s view is restricted to their own.
Validation & Testing:

Validate that file uploads do not exceed 5 MB.
Verify that file downloads work correctly.
Ensure that status changes (e.g., marking as read/archived) are saved properly.
Test the UI on both employee and admin flows with sample documents.
