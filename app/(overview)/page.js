import { getAllTodos } from "../lib/data";
import Form from "../ui/advanced-todo/form";

export default async function Home() {
  const GetAllTodos = await getAllTodos();

  return (
    <div className="justify-items-center min-h-screen p-20">
      <h1>Advanced-Todo-App</h1>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Form GetAllTodos={GetAllTodos} />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
