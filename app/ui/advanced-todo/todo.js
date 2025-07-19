// ui/advanced-todo/todo.tsx
import { Trash2, Edit3, Check, X } from "lucide-react";

export default function Todo({ todo, handleToggle, handleDelete, isEditing, editText, handleOnKeyDown, handleEditChange, handleStartEdit, handleEditSave, handleCancelEdit }) {
    return (
        <div className={`group bg-white p-4 rounded-lg shadow-sm border-l-4 ${todo.completed ? 'border-green-500' : 'border-blue-500'} transition-colors`}>
            <div className="flex items-center gap-3">
                {/* Checkbox */}
                <button
                    onClick={handleToggle}
                    className={`flex-shrink-0 w-5 h-5 rounded border ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                >
                    {todo.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Todo Content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editText}
                                onChange={handleEditChange}
                                onKeyDown={handleOnKeyDown}
                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <button
                                onClick={handleEditSave}
                                className="text-green-600"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={handleStartEdit}
                            className={`cursor-text ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                        >
                            {todo.text}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!isEditing && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleStartEdit}
                            className="text-gray-400 hover:text-blue-600"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}