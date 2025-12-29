import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

const GET_DATA = gql`
  query GetData {
    data {
      id
      value
    }
  }
`;

const mocks = [
  {
    request: {
      query: GET_DATA,
    },
    result: {
      data: {
        data: [{ id: '1', value: 'Test Value' }],
      },
    },
  },
];

test('renders app and fetches data', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <App />
    </MockedProvider>
  );

  const element = await screen.findByText(/Test Value/i);
  expect(element).toBeInTheDocument();
});

import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('API Tests', () => {
  it('should fetch data from the API', async () => {
    const response = await request(app).get('/api/data');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('should handle errors gracefully', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../src/components/Login';

test('user can log in', async () => {
  render(<Login />);
  
  userEvent.type(screen.getByLabelText(/username/i), 'testuser');
  userEvent.type(screen.getByLabelText(/password/i), 'password123');
  userEvent.click(screen.getByRole('button', { name: /submit/i }));

  const successMessage = await screen.findByText(/login successful/i);
  expect(successMessage).toBeInTheDocument();
});

test('shows error on invalid login', async () => {
  render(<Login />);
  
  userEvent.type(screen.getByLabelText(/username/i), 'wronguser');
  userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
  userEvent.click(screen.getByRole('button', { name: /submit/i }));

  const errorMessage = await screen.findByText(/invalid credentials/i);
  expect(errorMessage).toBeInTheDocument();
});