'use server';

import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function getAllTodos() {
    return await sql`SELECT * FROM todos ORDER BY created_at DESC;`;
}