import { useState } from 'react'
import { useIsSignedIn, useEvmAddress, useSendUserOperation } from '@coinbase/cdp-hooks'
import { buildRegisterSchemaCalldata, SCHEMA_REGISTRY, REVIEW_SCHEMA, REVIEW_SCHEMA_UID, EAS_NETWORK } from '../lib/eas'
import type { EvmAddress } from '@coinbase/cdp-core'

/**
 * One-time schema registration component.
 * Shows a button to register the review schema on Base via EAS SchemaRegistry.
 * Only visible when ?admin=true is in the URL.
 */
export default function RegisterSchema() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('admin') !== 'true') return null

  const { isSignedIn } = useIsSignedIn()
  const { evmAddress } = useEvmAddress()
  const { sendUserOperation } = useSendUserOperation()
  const [status, setStatus] = useState('')

  if (!isSignedIn) return null

  const handleRegister = async () => {
    try {
      setStatus('Registering schema...')
      const calldata = buildRegisterSchemaCalldata(REVIEW_SCHEMA)

      const result = await sendUserOperation({
        calls: [
          {
            to: SCHEMA_REGISTRY as EvmAddress,
            data: calldata as `0x${string}`,
          },
        ],
        network: EAS_NETWORK,
        evmSmartAccount: evmAddress as EvmAddress,
        useCdpPaymaster: true,
      })

      setStatus(`Schema registered! TX: ${result.userOperationHash}. UID: ${REVIEW_SCHEMA_UID}`)
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 70, right: 16, zIndex: 100,
      background: '#1a1a1a', color: '#fff', padding: 12, borderRadius: 8,
      fontSize: 12, maxWidth: 320,
    }}>
      <strong>Admin: Schema Registration</strong>
      <div style={{ marginTop: 4, color: '#999', wordBreak: 'break-all' }}>
        Schema: {REVIEW_SCHEMA}<br />
        Expected UID: {REVIEW_SCHEMA_UID}
      </div>
      <button onClick={handleRegister} style={{
        marginTop: 8, padding: '4px 8px', background: '#4285f4', color: '#fff',
        border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
      }}>
        Register Schema on Base
      </button>
      {status && <div style={{ marginTop: 4, color: '#9f9' }}>{status}</div>}
    </div>
  )
}
