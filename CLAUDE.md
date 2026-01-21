# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 21 application for employee management (LF10 learning project) that uses OIDC authentication via Authentik and integrates with a Java Spring Boot backend. The project uses standalone components (no NgModules) and follows Angular's modern architecture patterns.

## Development Commands

### Start Backend Services
```bash
docker compose up
```
This starts:
- PostgreSQL database for employees (port 5432)
- Employee Management Backend API (port 8089)
- PostgreSQL for Authentik (internal)
- Redis for Authentik (internal)
- Authentik server (port 9000 - admin UI, port 9443 - HTTPS)
- Authentik worker (background tasks)

### Stop Backend Services
```bash
docker compose down
```

### Reset PostgreSQL Database
If you encounter database issues:
```bash
docker compose down
docker volume rm docker_employee_postgres_data
docker compose up
```

### Angular Development
```bash
npm start              # Start dev server on http://localhost:4200
npm run build          # Production build
npm run watch          # Development build with watch mode
npm test               # Run Jasmine/Karma tests
ng generate component <name>   # Generate new component
ng generate service <name>     # Generate new service
ng generate guard <name>       # Generate new guard
```

### Access Points
- Angular App: http://localhost:4200
- Employee Backend API: http://localhost:8089
- Backend Swagger UI: http://localhost:8089/swagger
- Authentik Admin: http://localhost:9000 (login: a@b.com / secret)

## Architecture

### Authentication Flow (OIDC with Authentik)

The app uses OAuth2/OIDC with Authorization Code Flow:

1. **AuthService** (`src/app/auth.service.ts`): Core authentication logic
   - Configures OIDC client with `angular-oauth2-oidc` library
   - Issuer: `http://localhost:9000/application/o/employee_api/`
   - Client ID: `employee_api_client`
   - **Critical Authentik quirk**: Discovery document endpoints come as arrays, must be normalized to strings (lines 37-56)
   - Must use `strictDiscoveryDocumentValidation: false` for Authentik compatibility

2. **authGuard** (`src/app/auth.guard.ts`): Route protection
   - Functional guard using `CanActivateFn`
   - Redirects to `/login` if no valid token
   - Protects `/employees` route

3. **CallbackComponent** (`src/app/callback/callback.component.ts`): OAuth callback handler
   - Processes the authorization code returned from Authentik
   - Redirects to `/employees` on success, `/` on failure

4. **Login Flow**:
   - User clicks login → AuthService.login() → redirects to Authentik
   - User authenticates at Authentik
   - Authentik redirects to `/callback` with authorization code
   - CallbackComponent exchanges code for tokens
   - User redirected to `/employees`

### Application Structure

- **Standalone Components**: All components use `standalone: true`, no NgModules
- **Routing**: Configured in `src/app/app.routes.ts`
  - `/` and `/login` → LoginComponent
  - `/callback` → CallbackComponent (OAuth callback)
  - `/employees` → EmployeeListComponent (protected by authGuard)

- **App Configuration**: `src/app/app.config.ts`
  - Provides routing, HTTP client, and OAuth client
  - Uses `provideHttpClient(withInterceptorsFromDi())` for interceptor support
  - Uses `provideOAuthClient()` from angular-oauth2-oidc

### Backend Integration

- **Employee Model**: `src/app/model/Employee.ts`
  - Interface with id, firstName, lastName, street, postcode, city, phone, skillSet
  - skillSet is `bigint[] | null`

- **API Communication**:
  - Base URL: `http://localhost:8089/employees`
  - All requests require Bearer token in Authorization header
  - Token obtained via `AuthService.getAccessToken()`
  - See `EmployeeListComponent` for example (lines 25-32)

- **Proxy Configuration**: `src/proxy.conf.json`
  - Maps `/backend/*` to `http://localhost:8089/`
  - Currently not used in components (direct localhost:8089 calls instead)

### Testing

- **Framework**: Jasmine + Karma
- **Config**: Angular CLI handles test configuration via `angular.json`
- **Spec Files**: All `.spec.ts` files use Jasmine syntax
- **Run Tests**: `npm test`

## Important Implementation Notes

### When Working with Authentication

1. **Always wait for configuration**: AuthService uses `configurePromise` to ensure discovery document is loaded before operations
2. **Endpoint normalization is critical**: Authentik returns arrays for endpoints - the code manually converts them to strings
3. **Token management**: Use `AuthService.getAccessToken()` for API calls, never access OAuthService directly from components
4. **No HTTP vs HTTPS**: Dev environment uses `requireHttps: false`

### When Adding New Protected Routes

1. Add route to `app.routes.ts` with `canActivate: [authGuard]`
2. Ensure components inject `AuthService` if they need to access tokens
3. Add Bearer token to all HTTP requests to backend

### When Working with the Backend API

1. Backend requires valid Bearer token from Authentik
2. Backend is Spring Boot with JPA/Hibernate
3. Swagger docs available at http://localhost:8089/swagger
4. Employee entity has auto-generated ID

### Authentik Setup (First Time)

After starting Docker containers, you must set password for test user "john":
1. Open http://localhost:9000
2. Login with a@b.com / secret
3. Navigate to Directory → Users
4. Click user "john"
5. Set password (e.g., "test123")

Then you can login to the Angular app with john/<password>.

## Known Issues

Check the "Bugs" section in README.md for current issues.

## File Import Path Corrections

- Employee model was moved to `src/app/model/Employee.ts` but some files still import from `src/app/Employee`
- When you see import errors for Employee, use: `import { Employee } from '../model/Employee'` or adjust relative path accordingly
