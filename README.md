# Project Setup

Follow these steps to get the project up and running:

### 1. Install Dependencies

```bash
npm install
```

This will install all necessary dependencies for the project.

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add the following environment variable, replacing `<databaseurl>` with your actual database URL:

```
DATABASE_URL = "<databaseurl>"
```

### 3. Pull Database from NeonTech

```bash
npx prisma db pull
```

This command pulls the current database schema from NeonTech using Prisma.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This will generate the Prisma client based on the schema pulled from the database.

### 5. Run the Application

```bash
npm run dev
```

Starts the development server for the web application.

---

# Committing Code

This project uses **Husky** for linting code before commits (it's like a spell-check for your code). Sometimes, even if your code runs fine, you might encounter linting errors.

If you're having trouble committing due to these lint checks, you can bypass the linting with:

```bash
git commit --no-verify -m "<message>"
```

---

# Working with Data

The CRUD (Create, Read, Update, Delete) functions are available under:

```
@/app/api/crudFunctions
```

Each table in the database has its own set of CRUD functions. Choose the appropriate ones based on your needs.

If you need help with a specific function or have any questions, feel free to reach out. Additionally, when using these functions, keep in mind whether you're working in a **server component** or a **client component**.

(For guidance on this, you might need to ask ChatGPT—I'm still learning too!)
