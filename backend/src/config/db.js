import mongoose from 'mongoose';
import 'dotenv/config';


class MongoConnection {
  constructor(dbUrl) {
    this.dbUrl = dbUrl;
    this.connection = mongoose.connection;
    this._setupEventListeners();
  }

  async connect() {
    try {
      await mongoose.connect(this.dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
  }

  _setupEventListeners() {
    this.connection.on('connected', () => {
      console.log('Mongoose default connection open');
    });

    this.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    this.connection.on('disconnected', () => {
      console.warn('Mongoose default connection disconnected');
    });

    // handle process termination cleanly
    process.on('SIGINT', async () => {
      await this.connection.close();
      console.log('Mongoose connection closed due to app termination');
      process.exit(0);
    });
  }

  isAlive() {
    // check if connection is still alive
    return this.connection.readyState === 1;
  }
}

const DB_URL = process.env.NODE_ENV === 'production'
  ? process.env.PROD_DB_URI
  : process.env.DEV_DB_URI;

const dbClient = new MongoConnection(DB_URL);

export default dbClient;
