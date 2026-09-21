import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SerperProvider } from './server/providers/serperProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const serperProvider = new SerperProvider();

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      serperConfigured: Boolean(process.env.SERPER_API_KEY?.trim()),
    });
  });

  // Serper Places Search Endpoint
  app.post('/api/leads/search-serper', async (req, res) => {
    try {
      const { category, city, country, countryCode, limit } = req.body || {};

      if (!category || !city || !country) {
        return res.status(400).json({
          success: false,
          totalFound: 0,
          results: [],
          isConfigured: Boolean(process.env.SERPER_API_KEY?.trim()),
          error: 'Category, City, and Country are all required search fields.',
        });
      }

      const response = await serperProvider.searchLeads({
        category: String(category),
        city: String(city),
        country: String(country),
        countryCode: countryCode ? String(countryCode) : undefined,
        limit: limit ? Number(limit) : 25,
      });

      return res.json(response);
    } catch (err: any) {
      console.error('Serper search endpoint error:', err);
      return res.status(500).json({
        success: false,
        totalFound: 0,
        results: [],
        isConfigured: Boolean(process.env.SERPER_API_KEY?.trim()),
        error: `Internal server error during search: ${err?.message || 'Unknown error'}`,
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jigaway server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
