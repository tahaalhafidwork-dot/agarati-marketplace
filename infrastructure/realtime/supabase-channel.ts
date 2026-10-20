import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"

export const MESSAGE_TABLE = "Message"
export const PROPERTY_REQUEST_MESSAGE_TABLE = "PropertyRequestMessage"

function freshChannel(client: SupabaseClient, prefix: string): RealtimeChannel {
  // Unique topic every time — reusing a subscribed channel name makes
  // `.on("postgres_changes")` throw after `subscribe()`.
  return client.channel(`${prefix}:${crypto.randomUUID()}`)
}

function bindPostgresChange(
  channel: RealtimeChannel,
  opts: {
    table: string
    filter: string
    onPayload: () => void
    onError: () => void
  }
): RealtimeChannel {
  return channel
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: opts.table,
        filter: opts.filter,
      },
      opts.onPayload
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        opts.onError()
      }
    })
}

/**
 * Subscribe to inbox-relevant message changes for a user.
 * Returns unsubscribe. On channel error, calls onError once.
 */
export function subscribeUserMessageInbox(
  client: SupabaseClient,
  userId: string,
  handlers: {
    onChange: () => void
    onError?: () => void
  }
): () => void {
  let errored = false
  const bump = () => handlers.onChange()
  const fail = () => {
    if (errored) return
    errored = true
    handlers.onError?.()
  }

  // One filter per channel — never chain `.on()` after `.subscribe()`.
  const channels: RealtimeChannel[] = [
    bindPostgresChange(freshChannel(client, `inbox-msg-to`), {
      table: MESSAGE_TABLE,
      filter: `toId=eq.${userId}`,
      onPayload: bump,
      onError: fail,
    }),
    bindPostgresChange(freshChannel(client, `inbox-msg-from`), {
      table: MESSAGE_TABLE,
      filter: `fromId=eq.${userId}`,
      onPayload: bump,
      onError: fail,
    }),
    bindPostgresChange(freshChannel(client, `inbox-req-to`), {
      table: PROPERTY_REQUEST_MESSAGE_TABLE,
      filter: `toId=eq.${userId}`,
      onPayload: bump,
      onError: fail,
    }),
    bindPostgresChange(freshChannel(client, `inbox-req-from`), {
      table: PROPERTY_REQUEST_MESSAGE_TABLE,
      filter: `fromId=eq.${userId}`,
      onPayload: bump,
      onError: fail,
    }),
  ]

  return () => {
    for (const ch of channels) {
      void client.removeChannel(ch)
    }
  }
}

export function subscribeListingThread(
  client: SupabaseClient,
  listingId: string,
  handlers: { onChange: () => void; onError?: () => void }
): () => void {
  let errored = false
  const fail = () => {
    if (errored) return
    errored = true
    handlers.onError?.()
  }

  const ch = bindPostgresChange(freshChannel(client, `thread-listing`), {
    table: MESSAGE_TABLE,
    filter: `listingId=eq.${listingId}`,
    onPayload: () => handlers.onChange(),
    onError: fail,
  })

  return () => {
    void client.removeChannel(ch)
  }
}

export function subscribeRequestThread(
  client: SupabaseClient,
  requestId: string,
  handlers: { onChange: () => void; onError?: () => void }
): () => void {
  let errored = false
  const fail = () => {
    if (errored) return
    errored = true
    handlers.onError?.()
  }

  const ch = bindPostgresChange(freshChannel(client, `thread-request`), {
    table: PROPERTY_REQUEST_MESSAGE_TABLE,
    filter: `requestId=eq.${requestId}`,
    onPayload: () => handlers.onChange(),
    onError: fail,
  })

  return () => {
    void client.removeChannel(ch)
  }
}
