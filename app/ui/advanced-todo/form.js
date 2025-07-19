"use client";

import { useCallback, useEffect, useState } from "react";
import Todo from "./todo";
import { createTodo, deleteCompletedTodos, deleteTodo, updateTodo } from "@/app/lib/actions";
import { Search, Plus, Undo, Filter } from "lucide-react";

export default function Form({ GetAllTodos }) {
    const [input, setInput] = useState("");
    const [error, setError] = useState(null);
    const [todos, setTodos] = useState(GetAllTodos || [
        { id: 1, text: "Welcome to your modern todo app!", completed: false },
        { id: 2, text: "Click on a task to edit it", completed: false },
        { id: 3, text: "Check this completed task", completed: true }
    ]);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [filterValue, setFilterValue] = useState('all');
    const [term, setTerm] = useState('');
    const [debounceTerm, setDebounceTerm] = useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);


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
            const newTodo = await createTodo(trimmedInput);
            setTodos((prev) => [
                { id: Date.now(), text: trimmedInput, completed: false },
                ...prev
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

        if (debounceTerm) {
            filtered = filtered?.filter((todo) => todo?.text?.toLowerCase().includes(debounceTerm?.toLowerCase()));
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
                setTodos((prev) => [lastAction.task, ...prev]);
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

    const completedCount = todos.filter(todo => todo.completed).length;
    const activeCount = todos.filter(todo => !todo.completed).length;

    return (
        <div className="space-y-6">
            {/* Add Todo Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={handleChange}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="font-bold">{todos.length}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="font-bold text-blue-600">{activeCount}</div>
                    <div className="text-sm text-gray-500">Active</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="font-bold text-green-600">{completedCount}</div>
                    <div className="text-sm text-gray-500">Done</div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Mobile Filters Button */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="sm:hidden flex items-center gap-2 w-full px-4 py-2 bg-gray-100 rounded-lg"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>

                    <button
                        disabled={history.length === 0}
                        onClick={handleUndo}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 justify-center disabled:opacity-50"
                    >
                        <Undo className="w-4 h-4" />
                        <span>Undo</span>
                    </button>
                </div>

                {/* Filters - Desktop */}
                <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} sm:block space-y-2 sm:space-y-0 sm:flex sm:gap-2`}>
                    <button
                        onClick={() => setFilterValue('all')}
                        className={`w-full sm:w-auto px-4 py-2 rounded-lg ${filterValue === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterValue('active')}
                        className={`w-full sm:w-auto px-4 py-2 rounded-lg ${filterValue === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilterValue('completed')}
                        className={`w-full sm:w-auto px-4 py-2 rounded-lg ${filterValue === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Todo List */}
            <div className="space-y-2">
                {displayedTodos?.length > 0 ? (
                    displayedTodos.map((todo) => (
                        <Todo
                            key={todo.id}
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
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>{term ? 'No tasks match your search' : 'No tasks yet'}</p>
                    </div>
                )}
            </div>

            {/* Clear Completed */}
            {completedCount > 0 && (
                <button
                    onClick={handleClearCompleted}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Clear Completed ({completedCount})
                </button>
            )}
        </div>
    );
}
