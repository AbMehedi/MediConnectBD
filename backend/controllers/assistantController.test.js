const request = require('supertest');
const express = require('express');
const sequelize = require('../config/db');
const assistantRoutes = require('../routes/assistantRoutes');

const app = express();
app.use(express.json());
app.use('/api/assistants', assistantRoutes);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('Assistant API', () => {
  it('should create test data', async () => {
    const res = await request(app)
      .post('/api/assistants/test-data')
      .send();
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Random test users and profiles created successfully');
  });
});

afterAll(async () => {
  await sequelize.close();
});
