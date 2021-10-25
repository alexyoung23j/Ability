import { config } from 'dotenv';

// TODO kedar: I think we can use .env.local instead of the .env file, and pass in the path as a param
config();

export const API_KEY = process.env.REACT_APP_API_KEY as string;
export const AUTH_DOMAIN = process.env.REACT_APP_AUTH_DOMAIN as string;
export const DATABASE_URL = process.env.REACT_APP_DATABASE_URL as string;
export const PROJECT_ID = process.env.REACT_APP_PROJECT_ID as string;
export const STORAGE_BUCKET = process.env.REACT_APP_STORAGE_BUCKET as string;
export const MESSAGING_SENDER_ID = process.env
  .REACT_APP_MESSAGING_SENDER_ID as string;
export const MEASUREMENT_ID = process.env.REACT_APP_MEASUREMENT_ID as string;
export const GCAL_CLIENT_ID = process.env.GCAL_CLIENT_ID as string;
