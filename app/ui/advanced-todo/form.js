"use client";

import { useCallback, useEffect, useState } from "react";
import Todo from "./todo";
import { createTodo, deleteCompletedTodos, deleteTodo, updateTodo } from "@/app/lib/actions";


export default function Form({ GetAllTodos }) {
    const [input, setInput] = useState("");
    const [error, setError] = useState(null);
    const [todos, setTodos] = useState(GetAllTodos || []);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [filterValue, setFilterValue] = useState('all');
    const [term, setTerm] = useState('');
    const [debounceTerm, setDebounceTerm] = useState('');

    async function handleSubmit(e) {

        e.preventDefault();
        const trimmedInput = input.trim();
        await createTodo(trimmedInput);
        if (trimmedInput.length > 0) {
            setTodos((prev) => [
                ...prev,
                { id: prev.length + 1, text: trimmedInput, completed: false }
            ]);
            setInput("");
            setError(null);
            localStorage.setItem()

        } else {
            setError("Please enter a valid task.");
        }
    }

    function handleChange(e) {
        setError(null)
        setInput(e.target.value);
    }

    function handleEditChange(e) {
        setEditText(e.target.value);
    }

    async function handleToggle(id) {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const newCompleted = !todo.completed;
        await updateTodo(id, null, newCompleted);

        setTodos((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        )
    }

    async function handleDelete(id) {
        await deleteTodo(id);
        const updatedTodos = todos?.filter((todo) => todo.id !== id);
        setTodos(updatedTodos);
    }

    function handleStartEdit(todo) {
        if (!editingId) {
            setEditingId(todo.id);
            setEditText(todo.text);
        }
    }

    function handleCancelEdit() {
        setEditingId(null);
        setEditText("");
    }

    async function handleEditSave() {
        await updateTodo(editingId, editText, null);
        setTodos((prev) => (
            prev.map((todo) =>
                todo.id === editingId ? { ...todo, text: editText } : todo
            )
        ))
        setEditingId(null);
        setEditText("")
    }

    function handleOnKeyDown(e) {
        if (e.key === 'Enter') {
            handleEditSave();
        } else if (e.key === 'Escape') {
            handleCancelEdit()
        }
    }

    const handleSearchAndFilter = useCallback(() => {
        let filtered = todos;

        switch (filterValue) {
            case 'active':
                filtered = todos?.filter((item) => !item.completed);
                break;
            case 'completed':
                filtered = todos?.filter((item) => item.completed);
                break;
            default:
                filtered = todos;
        }

        if (term) {
            filtered = filtered?.filter((todo) => todo?.text?.toLowerCase().includes(term?.toLowerCase()));
        }

        return filtered;

    }, [todos, debounceTerm, filterValue]);

    const displayedTodos = handleSearchAndFilter();

    async function handleClearCompleted() {
        await deleteCompletedTodos();
        let updatedTodos = todos?.filter((todo) => todo.completed === false);
        setTodos(updatedTodos)
    }

    useEffect(() => {
        let timer = setTimeout(() => {
            setDebounceTerm(term);
        }, 300);

        return () => clearTimeout(timer);
    }, [term]);



    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={handleChange}
                        placeholder="Add a new task..."
                        className={`border rounded-l-full p-3 w-xl ${error ? 'border-red-400' : 'border-gray-300'}`}
                    />

                    <button type="submit" className="rounded-r-full bg-blue-500 p-3 cursor-pointer">
                        ADD
                    </button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
            </form>
            <div className="flex justify-between w-full">
                <input
                    type="text"
                    placeholder="Search.."
                    value={term || ""}
                    onChange={(e) => setTerm(e.target.value)}
                    className="p-2 w-[25rem] bg-gray-50 shadow-md rounded-md"
                />
                <select
                    id="filter"
                    name="filter"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="p-2 bg-gray-50 shadow-md rounded-md"
                >
                    <option value='all'>All</option>
                    <option value='active'>Active</option>
                    <option value='completed'>Completed</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                {displayedTodos?.length > 0 ? (displayedTodos?.map((todo) => (
                    <div className="bg-gray-50" key={todo.id} >
                        <Todo
                            todo={todo}
                            handleToggle={() => handleToggle(todo.id)}
                            handleDelete={() => handleDelete(todo.id)}
                            isEditing={editingId === todo.id}
                            editText={editText}
                            handleEditChange={handleEditChange}
                            handleStartEdit={() => handleStartEdit(todo)}
                            handleEditSave={handleEditSave}
                            handleCancelEdit={handleCancelEdit}
                            handleOnKeyDown={handleOnKeyDown}
                        />
                    </div>
                ))
                ) : (
                    <p>No Tasks Found</p>
                )}
            </div>
            {todos?.some((todo) => todo.completed) &&
                < button
                    onClick={handleClearCompleted}
                    className="px-3 py-1.5 bg-gray-300 text-black rounded transition duration-200 text-sm cursor-pointer"
                >
                    Clear Completed
                </button >
            }
        </>
    )
};