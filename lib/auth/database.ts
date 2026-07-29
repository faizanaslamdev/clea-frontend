import { Pool } from 'pg';
import { readAuthEnv } from './env';

let pool: Pool | undefined;

export function getAuthDatabasePool(): Pool {
  if (!pool) {
    const { databaseUrl } = readAuthEnv();
    pool = new Pool({
      connectionString: databaseUrl,
      ssl:
        process.env.DB_SSL === 'false'
          ? false
          : { rejectUnauthorized: false },
      max: 5,
    });
  }

  return pool;
}
