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
    
    // History for undo (stores last 3 actions)
    const [history, setHistory] = useState([]);

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmedInput = input.trim();

        if (trimmedInput.length === 0) {
            setError("Please enter a valid task.");
            return;
        }

        try {
            await createTodo(trimmedInput);
            setTodos((prev) => [
                ...prev,
                { id: prev.length + 1, text: trimmedInput, completed: false }
            ]);
            setInput("");
            setError(null);
        } catch (err) {
            setError("Failed to create todo.");
        }
    }

    function handleChange(e) {
        setError(null);
        setInput(e.target.value);
    }

    function handleEditChange(e) {
        setEditText(e.target.value);
    }

    // Save action to history, keep max 3
    function pushToHistory(action) {
        setHistory((prev) => {
            const newHistory = [action, ...prev];
            return newHistory.slice(0, 3);
        });
    }

    async function handleToggle(id) {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const newCompleted = !todo.completed;

        // Save undo snapshot before change
        pushToHistory({ type: "TOGGLE", task: { ...todo } });

        try {
            await updateTodo(id, null, newCompleted);
            setTodos((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, completed: newCompleted } : item
                )
            );
        } catch {
            setError("Failed to update todo.");
        }
    }

    async function handleDelete(id) {
        const todoToDelete = todos.find(t => t.id === id);
        if (!todoToDelete) return;

        // Save undo snapshot before delete
        pushToHistory({ type: "DELETE", task: todoToDelete });

        try {
            await deleteTodo(id);
            setTodos((prev) => prev.filter((todo) => todo.id !== id));
        } catch {
            setError("Failed to delete todo.");
        }
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
        const todoToEdit = todos.find(t => t.id === editingId);
        if (!todoToEdit) return;

        // Save undo snapshot before edit
        pushToHistory({ type: "EDIT", task: { ...todoToEdit } });

        try {
            await updateTodo(editingId, editText, null);
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === editingId ? { ...todo, text: editText } : todo
                )
            );
            setEditingId(null);
            setEditText("");
        } catch {
            setError("Failed to update todo.");
        }
    }

    function handleOnKeyDown(e) {
        if (e.key === 'Enter') {
            handleEditSave();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
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
        try {
            await deleteCompletedTodos();
            setTodos((prev) => prev.filter((todo) => !todo.completed));
        } catch {
            setError("Failed to clear completed todos.");
        }
    }

    // Undo the last action
    async function handleUndo() {
        if (history.length === 0) return;

        const lastAction = history[0];
        setHistory((prev) => prev.slice(1)); // remove last action from history

        if (lastAction.type === "DELETE") {
            // Undo delete = re-add todo
            try {
                await createTodo(lastAction.task.text);
                setTodos((prev) => [...prev, lastAction.task]);
            } catch {
                setError("Failed to undo delete.");
            }
        } else if (lastAction.type === "TOGGLE") {
            // Undo toggle = revert completed status
            try {
                await updateTodo(lastAction.task.id, null, lastAction.task.completed);
                setTodos((prev) =>
                    prev.map((todo) =>
                        todo.id === lastAction.task.id ? { ...todo, completed: lastAction.task.completed } : todo
                    )
                );
            } catch {
                setError("Failed to undo toggle.");
            }
        } else if (lastAction.type === "EDIT") {
            // Undo edit = revert text
            try {
                await updateTodo(lastAction.task.id, lastAction.task.text, null);
                setTodos((prev) =>
                    prev.map((todo) =>
                        todo.id === lastAction.task.id ? { ...todo, text: lastAction.task.text } : todo
                    )
                );
            } catch {
                setError("Failed to undo edit.");
            }
        }
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

            {/* Undo Button */}
            <div className="my-3">
                <button
                    disabled={history.length === 0}
                    onClick={handleUndo}
                    className={`px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50`}
                >
                    Undo
                </button>
            </div>

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
                <button
                    onClick={handleClearCompleted}
                    className="px-3 py-1.5 bg-gray-300 text-black rounded transition duration-200 text-sm cursor-pointer"
                >
                    Clear Completed
                </button>
            }
        </>
    );
}