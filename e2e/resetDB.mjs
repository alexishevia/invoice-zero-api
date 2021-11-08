import massive from "massive";

const { DB_NAME, DATABASE_URL } = process.env;

export default async function resetDB() {
  const db = await massive(DATABASE_URL);
  await db.query("DROP DATABASE IF EXISTS test");
  await db.query(`CREATE DATABASE test TEMPLATE ${DB_NAME}`);
}
