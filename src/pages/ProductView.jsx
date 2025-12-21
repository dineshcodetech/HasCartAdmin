import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiCall } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function ProductView() {
    const { asin } = useParams()
    const [searchParams] = useSearchParams()
    const referralCode = searchParams.get('ref')
    const urlAgentId = searchParams.get('agentId') // Capture explicit agent ID from URL

    const [product, setProduct] = useState(null)
    const [agent, setAgent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAndTrack = async () => {
            try {
                setLoading(true)

                // 1. Fetch Agent Details if referral code exists
                let agentId = null;
                if (referralCode) {
                    try {
                        const agentRes = await apiCall(`/api/referral/validate/${referralCode}`)
                        if (agentRes.ok && agentRes.data?.data) {
                            setAgent(agentRes.data.data)
                            agentId = agentRes.data.data._id
                        }
                    } catch (agentErr) {
                        console.error('Agent validation failed:', agentErr)
                    }
                }

                // 2. Get product details from Amazon API via backend
                const res = await apiCall(`/api/products/${asin}`)

                if (res.ok && res.data?.data) {
                    const item = res.data.data
                    setProduct(item)

                    // 3. Track the click with the referral code and agent ID
                    try {
                        await apiCall('/api/analytics/track-click', {
                            method: 'POST',
                            body: JSON.stringify({
                                asin: item.ASIN,
                                productName: item.ItemInfo?.Title?.DisplayValue,
                                category: item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue || 'Uncategorized',
                                price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
                                imageUrl: item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL,
                                productUrl: item.DetailPageURL,
                                referralCode: referralCode || '',
                                agentId: agentId || urlAgentId // Use validated ID or direct URL ID
                            })
                        })
                    } catch (trackErr) {
                        console.error('Tracking failed but continuing:', trackErr)
                    }
                } else {
                    setError('Product not found or unavailable on Amazon.')
                }
            } catch (err) {
                setError('Failed to connect to Amazon services. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchAndTrack()
    }, [asin, referralCode])

    const handleContinue = () => {
        if (product?.DetailPageURL) {
            window.location.href = product.DetailPageURL
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8">
                <LoadingSpinner size="large" />
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">Syncing with Amazon Registry...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-black text-primary mb-2 uppercase tracking-tight">Access Denied.</h2>
                <p className="text-gray-400 text-sm max-w-xs mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20"
                >
                    Retry Connection
                </button>
            </div>
        )
    }

    const title = product.ItemInfo?.Title?.DisplayValue
    const imageUrl = product.Images?.Primary?.Large?.URL || product.Images?.Primary?.Medium?.URL
    const price = product.Offers?.Listings?.[0]?.Price?.DisplayAmount

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-gray-100 flex flex-col">
                {/* Product Image */}
                <div className="relative h-80 bg-white flex items-center justify-center p-12">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                    {agent && (
                        <div className="absolute top-6 right-6 bg-secondary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-secondary/30">
                            Trusted Agent Portfolio
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="p-10 pt-0 text-center">
                    {agent && (
                        <div className="mb-6 flex flex-col items-center">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Recommended By</span>
                            <span className="text-sm font-black text-secondary uppercase tracking-tight">{agent.name}</span>
                        </div>
                    )}

                    <h1 className="text-xl font-black text-primary mb-4 leading-tight">
                        {title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 mb-10">
                        <div className="h-[1px] bg-gray-100 flex-1" />
                        <span className="text-2xl font-black text-secondary">{price || 'View Price'}</span>
                        <div className="h-[1px] bg-gray-100 flex-1" />
                    </div>

                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.1em] mb-10 leading-relaxed px-4">
                        You are being redirected to Amazon to complete your purchase securely.
                        This referral helps your agent earn a small commission at no extra cost to you.
                    </p>

                    <button
                        onClick={handleContinue}
                        className="w-full py-5 bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-black/10 active:scale-95 group flex items-center justify-center gap-3"
                    >
                        View on Amazon
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <p className="mt-8 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                        Amazon Affiliate Integrated • ASIN: {asin}
                    </p>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                Powered by <span className="text-primary">HasCart</span>
            </p>
        </div>
    )
}

export default ProductView
