import { useMemo, useRef } from 'react'

function OtpCodeInput({
  label,
  value,
  onChange,
  disabled = false,
  length = 6,
  idPrefix = 'otp'
}) {
  const inputsRef = useRef([])

  const digits = useMemo(() => {
    const normalized = (value || '').replace(/\D/g, '').slice(0, length)
    return Array.from({ length }, (_, index) => normalized[index] || '')
  }, [value, length])

  function setFocus(index) {
    const target = inputsRef.current[index]
    if (target) {
      target.focus()
      target.select()
    }
  }

  function updateAt(index, digit) {
    const next = [...digits]
    next[index] = digit
    onChange(next.join(''))
  }

  function handleChange(index, event) {
    const nextDigit = event.target.value.replace(/\D/g, '').slice(-1)
    updateAt(index, nextDigit)

    if (nextDigit && index < length - 1) {
      setFocus(index + 1)
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      updateAt(index - 1, '')
      setFocus(index - 1)
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      setFocus(index - 1)
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      setFocus(index + 1)
    }
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) {
      return
    }

    const next = Array.from({ length }, (_, index) => pasted[index] || '')
    onChange(next.join(''))
    setFocus(Math.min(pasted.length, length - 1))
  }

  return (
    <fieldset className="otp-fieldset" disabled={disabled}>
      <legend>{label}</legend>
      <div className="otp-grid" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={`${idPrefix}-${index}`}
            ref={(node) => {
              inputsRef.current[index] = node
            }}
            id={`${idPrefix}-${index}`}
            className="otp-slot"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`${label} digito ${index + 1}`}
          />
        ))}
      </div>
    </fieldset>
  )
}

export default OtpCodeInput
