/**
 * Categories Page Component
 * Displays category management interface with table, forms, and CRUD operations
 */
import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import { AMAZON_SEARCH_INDEX, API_ENDPOINTS } from '../constants'
import { apiCall } from '../services/api'

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
        searchQueries: [''],
        percentage: '',
        status: 'active',
        selectedProducts: [],
    })
    const [previewProducts, setPreviewProducts] = useState([])
    const [previewLoading, setPreviewLoading] = useState(false)
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
            searchQueries: [''],
            percentage: '',
            status: 'active',
            selectedProducts: [],
        })
        setPreviewProducts([])
        setEditingCategory(null)
        setShowForm(false)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleQueryChange = (index, value) => {
        const newQueries = [...formData.searchQueries]
        newQueries[index] = value
        setFormData(prev => ({ ...prev, searchQueries: newQueries }))
    }

    const addQueryField = () => {
        setFormData(prev => ({ ...prev, searchQueries: [...prev.searchQueries, ''] }))
    }

    const removeQueryField = (index) => {
        if (formData.searchQueries.length === 1) return
        const newQueries = formData.searchQueries.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, searchQueries: newQueries }))
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
            searchQueries: formData.searchQueries.filter(q => q.trim() !== ''),
            percentage: parseFloat(formData.percentage),
            status: formData.status,
            selectedProducts: formData.selectedProducts,
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
            searchQueries: (category.searchQueries && category.searchQueries.length > 0)
                ? category.searchQueries
                : [category.searchQuery || ''],
            percentage: category.percentage.toString(),
            status: category.status,
            selectedProducts: category.selectedProducts || [],
        })
        setShowForm(true)
        setPreviewProducts([])
    }

    const handlePreviewSearch = async () => {
        const activeQueries = formData.searchQueries.filter(q => q.trim() !== '')
        if (activeQueries.length === 0) {
            setOperationError('Please enter at least one search query first')
            return
        }

        setPreviewLoading(true)
        setOperationError('')

        try {
            let allItems = []

            // Search for each query and combine
            for (const query of activeQueries) {
                const queryParams = new URLSearchParams({
                    search: query.trim(),
                    searchIndex: formData.amazonSearchIndex,
                    limit: '10'
                })

                const searchResponse = await apiCall(`${API_ENDPOINTS.ADMIN_PRODUCTS}?${queryParams}`)

                if (searchResponse.ok && searchResponse.data.success) {
                    allItems = [...allItems, ...searchResponse.data.data]
                }
            }

            // Deduplicate by ASIN
            const uniqueItems = Array.from(new Map(allItems.map(item => [item.ASIN, item])).values())

            if (uniqueItems.length === 0) {
                setOperationError('No products found for these queries')
            } else {
                setPreviewProducts(uniqueItems)
            }
        } catch (err) {
            setOperationError(err.message || 'Error searching for products')
        } finally {
            setPreviewLoading(false)
        }
    }

    const toggleProductSelection = (asin) => {
        setFormData(prev => {
            const currentSelected = prev.selectedProducts || []
            const isSelected = currentSelected.includes(asin)

            return {
                ...prev,
                selectedProducts: isSelected
                    ? currentSelected.filter(id => id !== asin)
                    : [...currentSelected, asin]
            }
        })
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
        <div className="p-8 min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold tracking-wide text-primary mb-2">
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
                            className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-primary text-primary hover:opacity-70"
                        >
                            {showForm ? 'Cancel' : 'Add Category'}
                        </button>
                        <button
                            onClick={refetch}
                            disabled={loading || operationLoading}
                            className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-primary text-primary hover:opacity-70 disabled:opacity-40"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {(error || operationError) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-700 font-bold">{operationError || error}</p>
                </div>
            )}

            {operationSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-secondary/30 rounded-lg">
                    <p className="text-sm text-secondary font-bold">✓ {operationSuccess}</p>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
                    <h2 className="text-xl font-bold tracking-wide text-primary mb-6">
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
                                    className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary bg-transparent"
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
                                    className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary bg-transparent"
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
                                    className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary bg-transparent"
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
                                    className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-primary font-medium tracking-wide outline-none focus:border-primary cursor-pointer"
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
                                    className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-primary font-medium tracking-wide outline-none focus:border-primary cursor-pointer"
                                >
                                    {Object.entries(AMAZON_SEARCH_INDEX).map(([key, value]) => (
                                        <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs uppercase tracking-wider text-gray-400 mb-4 block">
                                    Search Queries (India Marketplace)
                                </label>
                                <div className="space-y-4">
                                    {formData.searchQueries.map((query, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => handleQueryChange(index, e.target.value)}
                                                placeholder={`Search keyword ${index + 1}`}
                                                className="flex-1 border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary bg-transparent"
                                            />
                                            {formData.searchQueries.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQueryField(index)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    title="Remove Query"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2">
                                        <button
                                            type="button"
                                            onClick={addQueryField}
                                            className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:opacity-70 transition-opacity"
                                        >
                                            + Add Keyword
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePreviewSearch}
                                            disabled={previewLoading}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${previewLoading
                                                    ? 'bg-gray-100 text-gray-400'
                                                    : 'bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                                                }`}
                                        >
                                            {previewLoading ? 'Searching...' : 'Preview All & Deduplicate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Selection Preview */}
                        {(previewProducts.length > 0 || formData.selectedProducts.length > 0) && (
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">
                                    Curation: Select Products to Feature ({formData.selectedProducts.length} selected)
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {(previewProducts.length > 0 ? previewProducts : []).map((product) => {
                                        const isSelected = formData.selectedProducts.includes(product.ASIN)
                                        return (
                                            <div
                                                key={product.ASIN}
                                                onClick={() => toggleProductSelection(product.ASIN)}
                                                className={`relative cursor-pointer group rounded-lg border transition-all overflow-hidden ${isSelected ? 'border-secondary ring-2 ring-secondary/20' : 'border-gray-100 hover:border-primary/30'
                                                    }`}
                                            >
                                                <div className="aspect-square bg-white p-2">
                                                    <img
                                                        src={product.Images?.Primary?.Large?.URL || 'https://via.placeholder.com/150'}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="p-2 bg-white border-t border-gray-50">
                                                    <p className="text-[9px] font-bold text-primary truncate">{product.ItemInfo?.Title?.DisplayValue}</p>
                                                    <p className="text-[8px] text-gray-400 mt-1">{product.ASIN}</p>
                                                </div>

                                                {/* Selection Overlay */}
                                                {isSelected && (
                                                    <div className="absolute top-1 right-1 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                                        <span className="text-[10px] font-bold">✓</span>
                                                    </div>
                                                )}
                                                {!isSelected && (
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="bg-white/90 text-primary text-[8px] font-bold px-2 py-1 rounded-full border border-primary/20 uppercase tracking-widest">Pin</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                {previewProducts.length === 0 && formData.selectedProducts.length > 0 && (
                                    <p className="text-xs text-gray-400 italic">Click Search Preview to see more products or save to keep current selection.</p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-8">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={operationLoading}
                                className="px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase bg-secondary text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-md transition-all"
                            >
                                {operationLoading ? '...' : (editingCategory ? 'Update Category' : 'Create Category')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Table */}
            <div className="flex flex-col gap-8">
                <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-xl font-bold tracking-wide text-primary mb-6">
                        All Categories ({categories.length})
                    </h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-primary text-sm tracking-wide font-bold animate-pulse">Loading...</div>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Description</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Percentage</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Curation</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr
                                                key={category._id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 text-primary font-bold">
                                                    {category.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600 text-sm max-w-xs truncate" title={category.description}>
                                                    {category.description || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-primary font-bold">
                                                    {category.percentage}%
                                                </td>
                                                <td className="px-4 py-4 text-primary">
                                                    <span className="text-[10px] font-bold bg-primary/5 px-2 py-1 rounded">
                                                        {category.selectedProducts?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() => handleToggleStatus(category)}
                                                        disabled={operationLoading}
                                                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border transition-colors ${category.status === 'active'
                                                            ? 'bg-secondary text-white border-secondary hover:bg-white hover:text-secondary'
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
                                                            className="px-3 py-1 text-xs font-bold tracking-wide uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category._id)}
                                                            disabled={operationLoading}
                                                            className="px-3 py-1 text-xs font-bold tracking-wide uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40"
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
