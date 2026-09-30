import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, X } from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/index.php').replace(/\/+$/, '')

export default function CustomerAuth({ mode, csrfToken, initialMessage = '', onClose, onModeChange, onAuthenticated }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(initialMessage)
  const [busy, setBusy] = useState(false)
  const isSignUp = mode === 'sign-up'

  useEffect(() => {
    setError(initialMessage)
    setValues({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
    setShowPassword(false)
  }, [initialMessage, mode])

  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    setError('')
    if (isSignUp && values.name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (values.password.length < 12) {
      setError('Use a password with at least 12 characters.')
      return
    }
    if (isSignUp && values.password !== values.confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    if (!csrfToken) {
      setError('We could not establish a secure connection. Please close this window and try again.')
      return
    }

    setBusy(true)
    try {
      const response = await fetch(`${API}/customers/${isSignUp ? 'register' : 'login'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(isSignUp
          ? { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), password: values.password }
          : { email: values.email.trim(), password: values.password }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'We could not complete your request. Please try again.')
      if (!result.data?.customer?.id || !result.data?.customer?.name) throw new Error('The server response was incomplete. Please try again.')
      onAuthenticated(result.data.customer, result.data.csrfToken)
    } catch (requestError) {
      setError(requestError.message || 'We could not complete your request. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div className="customer-auth-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <motion.section className="customer-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: .24 }}>
        <div className="customer-auth-art" aria-hidden="true">
          <a className="brand" href="#home" onClick={onClose}><span className="brand-mark">S</span><span className="brand-name">Srinidhi <em>Constructions</em></span></a>
          <p>Thoughtful spaces<br />begin with a conversation.</p>
          <span className="customer-auth-art-caption">Architecture · Design · Construction</span>
        </div>
        <div className="customer-auth-form-panel">
          <button className="customer-auth-close" type="button" onClick={onClose} aria-label="Close sign in dialog"><X size={19} /></button>
          <p className="eyebrow"><span /> Customer account</p>
          <h2 id="customer-auth-title">{isSignUp ? 'Create your account.' : 'Welcome back.'}</h2>
          <p className="customer-auth-intro">{isSignUp ? 'Keep your project conversations close, from the first idea onward.' : 'Sign in to return to your conversations with Srinidhi.'}</p>
          <form className="customer-auth-form" onSubmit={submit} noValidate>
            {isSignUp && <label>Full name<input name="name" autoComplete="name" required maxLength="120" value={values.name} onChange={update} placeholder="Your full name" /></label>}
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="190" value={values.email} onChange={update} placeholder="you@example.com" /></label>
            {isSignUp && <label>Phone number <span>Optional</span><input name="phone" type="tel" autoComplete="tel" maxLength="30" value={values.phone} onChange={update} placeholder="+91" /></label>}
            <label>Password<div className="customer-password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength="12" maxLength="72" value={values.password} onChange={update} placeholder={isSignUp ? 'At least 12 characters' : 'Your password'} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
            {isSignUp && <label>Confirm password<input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required maxLength="72" value={values.confirmPassword} onChange={update} placeholder="Enter your password again" /></label>}
            {error && <p className="customer-auth-error" role="alert">{error}</p>}
            <button className="button button-bronze customer-auth-submit" type="submit" disabled={busy}>{busy ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create account' : 'Sign in')} {!busy && <ArrowRight size={15} />}</button>
          </form>
          <p className="customer-auth-switch">{isSignUp ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={() => { setError(''); onModeChange(isSignUp ? 'sign-in' : 'sign-up') }}>{isSignUp ? 'Sign in' : 'Sign up'}</button></p>
          <p className="customer-auth-footnote">Your account is separate from the studio administration portal.</p>
        </div>
      </motion.section>
    </motion.div>
  )
}