import { AuthButton as CDPAuthButton, SignOutButton } from '@coinbase/cdp-react'
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks'

export default function AuthButton() {
  const { isSignedIn } = useIsSignedIn()
  const { evmAddress } = useEvmAddress()

  if (isSignedIn) {
    const shortAddr = evmAddress
      ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
      : ''

    return (
      <div className="auth-signed-in">
        <span className="auth-address" title={evmAddress || ''}>
          {shortAddr}
        </span>
        <SignOutButton className="auth-signout-btn" />
      </div>
    )
  }

  return (
    <CDPAuthButton className="auth-signin-btn" />
  )
}
