import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('responds 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toMatchObject({ status: 'ok' });
  });
});
