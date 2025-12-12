/**
 * Categories Page Component
 * Displays category management interface with table, forms, and CRUD operations
 */
import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import { AMAZON_SEARCH_INDEX } from '../constants'

function Categories() {
    const {
        categories,
        loading,
        error,
        refetch,
        createCategory,
        updateCategory,
        deleteCategory
    } = useCategories()

    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amazonSearchIndex: 'All',
        searchQuery: '',
        percentage: '',
        status: 'active',
    })
    const [operationLoading, setOperationLoading] = useState(false)
    const [operationError, setOperationError] = useState('')
    const [operationSuccess, setOperationSuccess] = useState('')

    // Clear messages after timeout
    useEffect(() => {
        if (operationSuccess) {
            const timer = setTimeout(() => setOperationSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [operationSuccess])

    useEffect(() => {
        if (operationError) {
            const timer = setTimeout(() => setOperationError(''), 5000)
            return () => clearTimeout(timer)
        }
    }, [operationError])

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            amazonSearchIndex: 'All',
            searchQuery: '',
            percentage: '',
            status: 'active',
        })
        setEditingCategory(null)
        setShowForm(false)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setOperationLoading(true)
        setOperationError('')
        setOperationSuccess('')

        const categoryData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            amazonSearchIndex: formData.amazonSearchIndex,
            searchQuery: formData.searchQuery.trim(),
            percentage: parseFloat(formData.percentage),
            status: formData.status,
        }

        let result
        if (editingCategory) {
            result = await updateCategory(editingCategory._id, categoryData)
        } else {
            result = await createCategory(categoryData)
        }

        setOperationLoading(false)

        if (result.success) {
            setOperationSuccess(editingCategory ? 'Category updated successfully' : 'Category created successfully')
            resetForm()
        } else {
            setOperationError(result.error)
        }
    }

    const handleEdit = (category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || '',
            amazonSearchIndex: category.amazonSearchIndex || 'All',
            searchQuery: category.searchQuery || '',
            percentage: category.percentage.toString(),
            status: category.status,
        })
        setShowForm(true)
    }

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return

        setOperationLoading(true)
        setOperationError('')

        const result = await deleteCategory(categoryId)

        setOperationLoading(false)

        if (result.success) {
            setOperationSuccess('Category deleted successfully')
        } else {
            setOperationError(result.error)
        }
    }

    const handleToggleStatus = async (category) => {
        const newStatus = category.status === 'active' ? 'inactive' : 'active'
        setOperationLoading(true)
        setOperationError('')

        const result = await updateCategory(category._id, { status: newStatus })

        setOperationLoading(false)

        if (result.success) {
            setOperationSuccess(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
        } else {
            setOperationError(result.error)
        }
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-light tracking-wide text-black mb-2">
                            Categories.
                        </h1>
                        <p className="text-xs text-gray-400 tracking-widest uppercase">
                            Category Management
                        </p>
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                        <button
                            onClick={() => {
                                resetForm()
                                setShowForm(!showForm)
                            }}
                            className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-black hover:opacity-70"
                        >
                            {showForm ? 'Cancel' : 'Add Category'}
                        </button>
                        <button
                            onClick={refetch}
                            disabled={loading || operationLoading}
                            className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-black hover:opacity-70 disabled:opacity-40"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {(error || operationError) && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-sm text-black">{operationError || error}</p>
                </div>
            )}

            {operationSuccess && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-sm text-black">✓ {operationSuccess}</p>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
                    <h2 className="text-xl font-light tracking-wide text-black mb-6">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter category name"
                                    required
                                    className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                                    Percentage (%) *
                                </label>
                                <input
                                    type="number"
                                    name="percentage"
                                    value={formData.percentage}
                                    onChange={handleInputChange}
                                    placeholder="Enter percentage (0-100)"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description (optional)"
                                    className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-black font-medium tracking-wide outline-none focus:border-black cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                                    Amazon Category (SearchIndex)
                                </label>
                                <select
                                    name="amazonSearchIndex"
                                    value={formData.amazonSearchIndex}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-black font-medium tracking-wide outline-none focus:border-black cursor-pointer"
                                >
                                    {Object.entries(AMAZON_SEARCH_INDEX).map(([key, value]) => (
                                        <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                                    Search Query (for Amazon API)
                                </label>
                                <input
                                    type="text"
                                    name="searchQuery"
                                    value={formData.searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="e.g., minimalist home decor"
                                    className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-black hover:bg-black hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={operationLoading}
                                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase bg-black text-white hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {operationLoading ? '...' : (editingCategory ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Table */}
            <div className="flex flex-col gap-8">
                <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-xl font-light tracking-wide text-black mb-6">
                        All Categories ({categories.length})
                    </h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-black text-sm tracking-wide">Loading...</div>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Percentage</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr
                                            key={category._id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-black font-medium">
                                                {category.name}
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 text-sm max-w-xs truncate" title={category.description}>
                                                {category.description || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-black font-bold">
                                                {category.percentage}%
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(category)}
                                                    disabled={operationLoading}
                                                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border transition-colors ${category.status === 'active'
                                                        ? 'bg-black text-white border-black hover:bg-white hover:text-black'
                                                        : 'bg-white text-gray-400 border-gray-300 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {category.status}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        disabled={operationLoading}
                                                        className="px-3 py-1 text-xs font-bold tracking-wide uppercase border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        disabled={operationLoading}
                                                        className="px-3 py-1 text-xs font-bold tracking-wide uppercase border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-12 text-gray-400 italic">No categories found. Click "Add Category" to create one.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Categories
