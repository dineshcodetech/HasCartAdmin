import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiCall } from '../services/api'
import { ROUTES } from '../constants'

function ForgotPassword() {
    const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleSendOTP = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('Please enter your email address')
            return
        }

        setLoading(true)
        setError('')
        try {
            const response = await apiCall('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            })

            if (response.ok && response.data?.success) {
                setSuccess('Verification code sent to your email.')
                setStep(2)
            } else {
                setError(response.data?.message || 'Failed to send verification code.')
            }
        } catch (err) {
            setError('Connection error. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (!otp || !newPassword || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')
        try {
            const response = await apiCall('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ otp, password: newPassword }),
            })

            if (response.ok && response.data?.success) {
                setSuccess('Password reset successful. Redirecting to login...')
                setTimeout(() => {
                    navigate(ROUTES.LOGIN)
                }, 3000)
            } else {
                setError(response.data?.message || 'Failed to reset password.')
            }
        } catch (err) {
            setError('Connection error. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <img src="/logo.png" alt="HasCart Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-primary mb-2 uppercase">
                        Reset Password
                    </h1>
                    <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">
                        {step === 1
                            ? 'Enter email to receive OTP'
                            : 'Enter OTP and new password'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100 italic">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-100 font-medium">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                className="w-full border-b border-gray-200 py-3 text-base text-primary font-medium tracking-wide outline-none focus:border-secondary transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoCapitalize="none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary py-5 mt-8 text-white text-sm font-bold tracking-[0.15em] uppercase hover:opacity-90 shadow-xl shadow-primary/20 transition-all rounded-lg"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="6-DIGIT OTP"
                                className="w-full border-b border-gray-200 py-3 text-base text-primary font-medium tracking-wide outline-none focus:border-secondary transition-colors"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="NEW PASSWORD"
                                className="w-full border-b border-gray-200 py-3 text-base text-primary font-medium tracking-wide outline-none focus:border-secondary transition-colors"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="CONFIRM NEW PASSWORD"
                                className="w-full border-b border-gray-200 py-3 text-base text-primary font-medium tracking-wide outline-none focus:border-secondary transition-colors"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary py-5 mt-8 text-white text-sm font-bold tracking-[0.15em] uppercase hover:opacity-90 shadow-xl shadow-primary/20 transition-all rounded-lg"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-gray-400 text-xs uppercase tracking-widest hover:text-primary transition-colors"
                            >
                                Change Email?
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-8">
                    <Link to={ROUTES.LOGIN} className="text-secondary text-xs font-bold tracking-widest uppercase border-b border-secondary pb-1">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
