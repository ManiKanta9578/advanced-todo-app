export default function Todo({ todo, handleToggle, handleDelete, isEditing, editText, handleOnKeyDown, handleEditChange, handleStartEdit, handleEditSave, handleCancelEdit }) {
    return (
        <>
            <div className="flex items-center justify-between w-[39rem] p-4 bg-gray-50 shadow-md rounded-md">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={handleToggle}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={isEditing ? editText : todo.text}
                        readOnly={!isEditing}
                        onChange={handleEditChange}
                        onBlur={handleEditSave}
                        onClick={handleStartEdit}
                        onKeyDown={handleOnKeyDown}
                        className={`bg-transparent border-none focus:outline-none text-lg w-[25rem]
                            ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}
                    />
                </div>

                <div className="flex gap-2">
                    {!isEditing &&
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1.5 bg-gray-300 text-black rounded hover:bg-red-500 hover:text-white transition duration-200 text-sm cursor-pointer">
                            Delete
                        </button>
                    }

                </div>
            </div>
        </>
    )
};