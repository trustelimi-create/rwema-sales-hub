# Rwema Sales Hub

Build a real, production-ready PWA called Rwema, developed by Chanel.

Do NOT use TanStack. Do NOT use fake/demo data. Use React + Vite + TypeScript + Tailwind + Supabase.

Core purpose

The system has only 2 users:

Employee — records today's sales.

Boss — views sales and reports.

Both users must use the same UI/design, but with different permissions.

Only 3 sales categories

New SIM Card

SIM Swap

Movies & Songs

Do not add other business features.

Calculations

Employee = 40%

Boss = 60%

New SIM:

Gross = Quantity × Price

Net = Gross − Airtime

Employee = Net × 40%

Boss = Net × 60%

SIM Swap and Movies/Songs:

Gross = Quantity × Price

Employee = Gross × 40%

Boss = Gross × 60%

For Movies & Songs, the field must be called “Price”, not “Price per item”.

Employee

Employee can:

Add sales

Add today's records only

View today's sales

View today's earnings

View Daily Report

View Weekly Report

Employee cannot:

Add previous/future records

See Monthly/Yearly reports

Change the 40/60 percentages

Access Boss functions

Boss

Boss can:

View all sales

View Daily Report

View Weekly Report

View Monthly Report

View Yearly Report

View total revenue

View Airtime

View Employee 40%

View Boss 60%

Boss does not need to add sales.

Database

Use one real Supabase transactions table.

Every transaction must automatically update:

Dashboard

Sales

Daily Report

Weekly Report

Monthly Report

Yearly Report

Employee earnings

Boss earnings

Category totals

There must be one source of truth so numbers never differ between pages.

Use Supabase Authentication, PostgreSQL, RLS, and Realtime.

PWA & Design

Create a real installable PWA with:

App name: Rwema

Logo: R

Red brand color

Glassmorphism

Dark/Light mode

Mobile-first responsive UI

Service Worker

Web Manifest

PWA icons

Splash screen

Large “Install Rwema” button

Use professional Lucide icons, not emojis.

Navigation

Employee:

Dashboard | Sales | Reports | More

Boss:

Dashboard | Sales | Reports | More

Keep the UI simple and fast.

Important

Do not create fake statistics or transactions.

Start with an empty database.

Every button and form must actually work.

The final workflow should be:

Employee: Login → Add today's sale → Save → Earnings/Reports update automatically.

Boss: Login → View sales → View reports.

Make the entire application secure, accurate, responsive, and production-ready.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f407571-0f97-4efa-a6f1-425967eba1eb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
