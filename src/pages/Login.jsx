import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ role }) {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const correctPin = role === 'president' ? '5678' : '1234'

  const handleLogin = () => {
    if (pin === correctPin) {
      localStorage.setItem('userRole', role)
      navigate('/dashboard')
    } else {
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 400)
    }
  }

  return (
    <div className="pin-wrap">
      <div className="pin-box">
        <div className="pin-title">{role === 'president' ? 'President' : 'Treasurer'} Access</div>
        <input
          className={`pin-input ${shake ? 'shake' : ''}`}
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          maxLength={4}
          placeholder="••••"
          autoFocus
        />
        <button className="pin-submit" onClick={handleLogin}>Enter</button>
      </div>
    </div>
  )
}
