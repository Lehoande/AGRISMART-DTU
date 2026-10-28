# AgriSmart MVP

Based on the uploaded AgriSmart proposal. Stack: React + Tailwind, Express/Node.js + JWT, MySQL, and Python FastAPI recommendations.

## Run
1. Create the database: `mysql -u root -p < database/schema.sql`
2. Backend: `cd backend && cp .env.example .env && npm install && npm run seed && npm run dev`
3. AI: `cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000`
4. Frontend: `cd frontend && npm install && npm run dev`

Requires Node 20+, Python 3.10+, MySQL 8+. Update backend/.env with your MySQL credentials and a strong JWT_SECRET.

Demo login after seeding: `admin@agrismart.local / Admin123!`; customer: `customer@agrismart.local / Customer123!`.

Implemented: product catalog/search/filter, JWT registration/login, cart, checkout/order tracking, reviews, admin product endpoints/stats, rule-based recommendation API, traceability codes and SQL schema. Checkout is a demo flow, not a real payment integration. This is an educational MVP and needs security review/testing before production.

The Figma file was not accessible during generation, so the frontend is based on the written proposal rather than a pixel-perfect copy of the Figma design.
