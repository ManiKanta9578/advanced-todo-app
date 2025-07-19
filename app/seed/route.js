'use server';

import postgres from "postgres";


const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function createTodosTable() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `;

        console.log("✅ Table 'todos' created (or already exists)");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating 'todos' table:", error);
        process.exit(1);
    }
}

export async function GET() {
    try {
      await sql.begin(() => [
        createTodosTable(),
      ]);
  
      return Response.json({ message: 'Database seeded successfully' });
    } catch (error) {
      return Response.json({ error }, { status: 500 });
    }
  }