import { useEffect, useRef } from 'react'
import { createConsumer } from '@rails/actioncable'

export function useActionCable(channelName: string, onReceived: (data: any) => void) {
  const consumerRef = useRef<any>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // Create consumer
    consumerRef.current = createConsumer()
    
    // Subscribe to channel
    subscriptionRef.current = consumerRef.current.subscriptions.create(
      { channel: channelName },
      {
        received: onReceived,
        connected: () => {
          console.log(`Connected to ${channelName}`)
        },
        disconnected: () => {
          console.log(`Disconnected from ${channelName}`)
        }
      }
    )

    return () => {
      // Cleanup
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      if (consumerRef.current) {
        consumerRef.current.disconnect()
      }
    }
  }, [channelName, onReceived])

  return {
    consumer: consumerRef.current,
    subscription: subscriptionRef.current
  }
}