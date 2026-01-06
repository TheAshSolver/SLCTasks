# Clubs Council Web Frontend Project

This is a Next.js application for managing club activities, events, and members for the Clubs Council at IIIT Hyderabad. This also serves as the frontend for the Life Website of IIIT Hyderabad.\
The project uses a modern tech stack, including GraphQL, Material-UI, and MDX for documentation.

## Root Directory Structure

```
.
├── public/         # Static assets and public resources
├── src/            # Application source code
├── dev.Dockerfile  # Development Docker configuration
├── Dockerfile      # Production Docker configuration
├── next.config.js  # Next.js configuration
└── package.json    # Project dependencies and scripts
```

## Core Directories

### Public (`/public`)

Contains static assets and resources:

- Institution and organization logos
- Carousel images for the homepage
- XML sitemaps for SEO
- Open Graph images for social media sharing

### Source (`/src`)

Main application code organized into several key directories:

#### App (`/app`)

Next.js app router pages and layouts:

- Main layout and error handling (`layout.jsx`, `error.jsx`)
- Public pages (clubs, events, gallery)
- Management interfaces (`/manage`)
- User profiles and authentication
- Documentation system
- Calendar and scheduling interfaces

#### Actions (`/actions`)

Server-side actions using Next.js Server Actions pattern:

- Club management (create, edit, delete)
- Event handling (creation, updates, reporting)
- Member management (approvals, rejections)
- File operations with secure signed URLs
- User data management
- Holiday scheduling

#### Components (`/components`)

Reusable React components:

- UI components (ActionPalette, ConfirmDialog, Toast)
- Feature-specific components for clubs, events, and members
- Theme customization (`ThemeRegistry`)
- Layout components (Footer, Layout)
- File handling (FileUpload, ImageModal)
- Custom SVG components and logos

#### Configuration and Utility Directories & Files

- `acl/`: Access control and route protection
- `constants/`: Application-wide constants
- `contexts/`: React contexts for state management
- `gql/`: GraphQL queries and mutations
- `utils/`: Helper functions for formatting, auth, and file handling
- `middleware.js`: Custom Next.js middleware

## Key Features

1. **Authentication & Authorization**
   - Role-based access control
   - Protected routes and actions
   - User profile management

1. **Club Management**
   - Club creation and editing
   - Member management
   - Social media integration
   - Logo and banner handling

1. **Event System**
   - Event creation and scheduling
   - Approval workflows
   - Budget tracking
   - Report generation
   - Calendar integration

1. **Members Management**
   - Member profiles
   - Managing members for clubs & bodies
   - Member approval flow

1. **Document Management**
   - MDX-based documentation
   - File upload and storage
   - Secure URL signing

1. **UI/UX Features**
   - Responsive design
   - Dark/light mode support
   - Image carousel
   - Loading states
   - Toast notifications

## Development Stack

- **Framework**: Next.js with App Router
- **API**: GraphQL with server actions
- **UI**: Material-UI with custom theme
- **Content**: MDX for documentation
- **Styling**: Emotion for CSS-in-JS
- **Docker**: Development and production configurations

## File Organization Patterns

- Feature-based organization
- Server actions for API operations
- Component co-location with related features
- Consistent file naming (`page.jsx`, `server_action.jsx`)
- Separation of UI components and server logic

## Getting Started

We use Docker to run the frontend but this is just the frontend microservice.

This should usually be run with the services as a whole; refer to the [`setup repo`](https://github.com/Clubs-Council-IIITH/setup) for running this locally.

## Notes

- The project uses Node.js module linking for optimized dependency management.
- Includes SEO optimization with sitemaps and metadata.
- Supports both development and production Docker environments.
- Uses modern React patterns, including Server Components and Actions.
