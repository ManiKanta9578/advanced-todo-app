// app/page.tsx
import { getAllTodos } from "../lib/data";
import Form from "../ui/advanced-todo/form";

export default async function Home() {
  const GetAllTodos = await getAllTodos();

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Advanced Todo App</h1>
        <Form GetAllTodos={GetAllTodos} />
      </div>
    </main>
  );
}