// src/server.ts

import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 5000;

// Middleware example (optional)
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
