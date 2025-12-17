import postgres, { type Sql } from 'postgres';
import postgresConfig from '../ley.config.js';
import { setEnvironmentVariables } from '../util/config';

setEnvironmentVariables();

declare namespace globalThis {
  let postgresSqlClient: Sql;
}

function connectOneTimeToDatabase() {
  if (!('postgresSqlClient' in globalThis)) {
    globalThis.postgresSqlClient = postgres(postgresConfig);
  }
  return globalThis.postgresSqlClient;
}

export const sql = connectOneTimeToDatabase();

/* import postgres, { type Sql } from 'postgres';


declare global {
  var sql: Sql | undefined;
}

export const sql =
  global.sql ??
  (global.sql = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
  })); */
