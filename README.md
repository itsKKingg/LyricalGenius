This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Python Backend Setup

The Pinterest bridge requires a Python Flask backend. To run it:

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the Python backend server:
```bash
python api/index.py
```

The backend will run on port 8000 at http://localhost:8000

### Prerequisites

- Install `pinterest-dl` for Pinterest media extraction:
```bash
pip install pinterest-dl
```

You can start editing the page by modifying `app/page.tsx`. The app auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) - your feedback and contributions are welcome!

## Deploy on Vercel

Check out the [Next.js deployment documentation](https://nextjs.org/docs) for more details.
