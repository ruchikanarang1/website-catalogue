# Public Customer Website

A customer-facing e-commerce website for companies using the Poonam Steel ERP system. This standalone React application provides product browsing, customer registration, and order placement capabilities.

## Features

- 🏢 **Multi-Tenant**: Single codebase serves multiple companies via domain detection
- 🛍️ **Product Catalogue**: Browse products without authentication
- 👤 **Customer Accounts**: Register, login, and manage profile
- 🛒 **Shopping Cart**: Add products and place orders
- 📱 **Responsive Design**: Mobile-first UI for all devices
- 🔒 **Secure**: Supabase authentication and Row Level Security

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account with database set up
- Company UUID from your Supabase database

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd public-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Configure domain detection (see [Domain Setup Guide](./DOMAIN_SETUP.md)):
   - Open `src/lib/domainDetection.js`
   - Replace `YOUR_COMPANY_UUID_HERE` with your company UUID
   - Add production domains as needed

6. Start development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:5173 in your browser

## Configuration

### Domain Detection

The application uses domain-based detection to identify which company's website is being accessed. See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for detailed configuration instructions.

### Database Setup

Run the database migrations in Supabase SQL Editor:
```bash
# Copy contents of database-migrations.sql and run in Supabase
```

This creates:
- `customer_profiles` table for customer accounts
- Modified `orders` table with customer fields
- RLS policies for secure data access

## Project Structure

```
public-website/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth, Cart)
│   ├── lib/            # Utilities and API clients
│   │   ├── supabase.js           # Supabase client
│   │   ├── domainDetection.js    # Domain-to-company mapping
│   │   └── validation.js         # Form validation
│   ├── pages/          # Page components
│   ├── App.jsx         # Root component with routing
│   └── main.jsx        # Application entry point
├── public/             # Static assets
├── .env.example        # Environment variables template
└── database-migrations.sql  # Database schema
```

## Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

### Hostinger Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder contents to your Hostinger hosting via FTP

3. Configure custom domain in Hostinger panel

4. Install SSL certificate (available in Hostinger panel)

5. Ensure `.htaccess` is present for SPA routing (included in build)

See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for multi-domain configuration.

## Technology Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **Styling**: CSS-in-JS (inline styles)

## Documentation

- [Domain Setup Guide](./DOMAIN_SETUP.md) - Configure domain detection
- [Database Migrations](./database-migrations.sql) - Database schema

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Supabase connection in `.env`
3. Ensure database migrations are applied
4. Review [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for configuration help

## License

Private - Internal use only
