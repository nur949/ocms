import { login } from '../src/modules/auth/auth.controller';
import { Request, Response } from 'express';

async function testLogin() {
  const req = {
    body: {
      email: 'admin@ocms.com',
      password: 'admin123'
    }
  } as Request;

  const res = {
    status: (code: number) => {
      console.log('Status:', code);
      return res;
    },
    json: (data: any) => {
      console.log('JSON:', JSON.stringify(data, null, 2));
      return res;
    }
  } as Response;

  try {
    await login(req, res);
  } catch (error) {
    console.error('Login error in test:', error);
  }
}

testLogin();
