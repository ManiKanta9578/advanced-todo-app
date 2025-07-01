'use server';

import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function createTodo(text) {
    const now = new Date();

    try {
        const result = await sql`
      INSERT INTO todos (text, completed, created_at, updated_at)
      VALUES (${text}, ${false}, ${now}, ${now})
      RETURNING *;
    `;
        console.log("Todo Created")
        return result[0]; // Return the created todo
    } catch (error) {
        console.error("Error creating todo:", error);
        throw error;
    }
}


export async function updateTodo(id, text, completed) {
    const now = new Date();

    try {
        const result = await sql`
            UPDATE todos
            SET text = COALESCE(${text}, text),
                completed = COALESCE(${completed}, completed),
                updated_at = ${now}
            WHERE id = ${id}
            RETURNING *;
        `;
        console.log(`Todo ${id} updated successfully`);
        return result[0];
    } catch (error) {
        console.error("Error updating todo:", error);
        throw error;
    }
}


export async function deleteTodo(id) {
    try {
        await sql`DELETE FROM todos WHERE id = ${id}`
        console.log(`ID:${id} Deleted sucessfully`);
    } catch (error) {
        console.error("Error deleting todo:", error);
        throw error;
    }
}

export async function deleteCompletedTodos(){
    try{
        const result = await sql`
        DELETE FROM todos 
        WHERE completed = true 
        RETURNING *;`
        
        return result[0];        
    }catch (error){
        console.error("Error deleting completed todo:", error);
        throw error;
    }
}