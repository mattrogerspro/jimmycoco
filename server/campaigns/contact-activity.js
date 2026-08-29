import { requireEmailAdmin } from '../_lib/email-auth.js'
import { allowMethods, json } from '../_lib/http.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

const CONTACT_COLUMNS = 'id,email,first_name,last_name,business_name,market,timezone,marketing_status,created_at,updated_at'
const ENROLLMENT_COLUMNS = 'id,campaign_id,status,next_step,enrolled_at,sequence_started_at,next_send_at,exited_at,exit_reason,owner,retry_count,created_at,updated_at'
const MESSAGE_COLUMNS = 'id,enrollment_id,step_key,step_number,source,classification,subject,status,error_message,queued_at,sent_at,delivered_at,first_opened_at,first_clicked_at,bounced_at,complained_at,failed_at,suppressed_at,created_at,updated_at'
const EVENT_COLUMNS = 'id,event_type,message_id,occurred_at,received_at'
const BUSINESS_EVENT_COLUMNS = 'id,event_type,enrollment_id,occurred_at,data,created_at'
const SUPPRESSION_COLUMNS = 'email,scope,reason,source,created_at'
const LIST_LIMIT = 500

export function safeContactId(value) {
  const candidate = String(value || '').trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate) ? candidate : ''
}

export function safeCampaignId(value) {
  return String(value || '').trim().slice(0, 120)
}

export function contactMessageSummary(messages = []) {
  const count = (field) => messages.filter((message) => Boolean(message[field])).length
  const lastActivity = messages
    .flatMap((message) => [message.first_clicked_at, message.first_opened_at, message.delivered_at, message.sent_at, message.queued_at])
    .filter(Boolean)
    .sort()
    .at(-1) || null
  return {
    total: messages.length,
    sent: count('sent_at'),
    delivered: count('delivered_at'),
    opened: count('first_opened_at'),
    clicked: count('first_clicked_at'),
    bounced: count('bounced_at'),
    complained: count('complained_at'),
    failed: count('failed_at'),
    suppressed: count('suppressed_at'),
    last_activity_at: lastActivity,
  }
}

export function contactListItem(contact, enrollments = []) {
  const currentEnrollment = enrollments.find((enrollment) => enrollment.status === 'active') || enrollments[0] || null
  return {
    id: contact.id,
    email: contact.email,
    first_name: contact.first_name,
    last_name: contact.last_name,
    business_name: contact.business_name,
    market: contact.market,
    marketing_status: contact.marketing_status,
    enrollment_status: currentEnrollment?.status || 'not_enrolled',
    next_step: currentEnrollment?.next_step || null,
    sequence_started_at: currentEnrollment?.sequence_started_at || null,
    next_send_at: currentEnrollment?.next_send_at || null,
    exit_reason: currentEnrollment?.exit_reason || null,
    updated_at: currentEnrollment?.updated_at || contact.updated_at,
  }
}

function groupEnrollments(enrollments = []) {
  return enrollments.reduce((grouped, enrollment) => {
    if (!grouped.has(enrollment.contact_id)) grouped.set(enrollment.contact_id, [])
    grouped.get(enrollment.contact_id).push(enrollment)
    return grouped
  }, new Map())
}

function selectCurrentEnrollments(enrollments = []) {
  const current = new Map()
  for (const enrollment of enrollments) {
    if (!current.has(enrollment.contact_id)) current.set(enrollment.contact_id, enrollment)
  }
  return current
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['GET']) || !requireEmailAdmin(request, response)) return
  if (!isSupabaseConfigured()) return json(response, 503, { configured: false, error: 'contact_activity_not_configured' })

  const campaignId = safeCampaignId(request.query.campaign_id)
  const selectedContactId = safeContactId(request.query.contact_id)
  if (!campaignId) return json(response, 400, { error: 'campaign_id_required' })

  try {
    const supabase = getSupabase()
    const enrollmentRows = assertSupabase(await supabase
      .from('email_enrollments')
      .select(`contact_id,${ENROLLMENT_COLUMNS}`)
      .eq('campaign_id', campaignId)
      .order('updated_at', { ascending: false })
      .limit(LIST_LIMIT), 'load campaign contact enrolments') || []

    const currentEnrollments = selectCurrentEnrollments(enrollmentRows)
    const contactIds = [...currentEnrollments.keys()]
    const contacts = contactIds.length
      ? assertSupabase(await supabase
        .from('email_contacts')
        .select(CONTACT_COLUMNS)
        .in('id', contactIds), 'load campaign contacts') || []
      : []
    const contactsById = new Map(contacts.map((contact) => [contact.id, contact]))
    const enrollmentGroups = groupEnrollments(enrollmentRows)
    const contactList = [...currentEnrollments.values()]
      .map((enrollment) => contactsById.get(enrollment.contact_id))
      .filter(Boolean)
      .map((contact) => contactListItem(contact, enrollmentGroups.get(contact.id)))
      .sort((left, right) => `${left.business_name || ''} ${left.email}`.localeCompare(`${right.business_name || ''} ${right.email}`))

    const resolvedContactId = selectedContactId && contactsById.has(selectedContactId)
      ? selectedContactId
      : contactList[0]?.id || ''
    if (!resolvedContactId) {
      return json(response, 200, {
        configured: true,
        campaign_id: campaignId,
        contacts: [],
        selected_contact: null,
        refreshed_at: new Date().toISOString(),
      })
    }

    const contact = contactsById.get(resolvedContactId)
    const enrollments = enrollmentGroups.get(resolvedContactId) || []
    const [messages, businessEvents, suppressions] = await Promise.all([
      supabase.from('email_messages')
        .select(MESSAGE_COLUMNS)
        .eq('campaign_id', campaignId)
        .eq('contact_id', resolvedContactId)
        .order('step_number', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase.from('email_business_events')
        .select(BUSINESS_EVENT_COLUMNS)
        .eq('campaign_id', campaignId)
        .eq('contact_id', resolvedContactId)
        .order('occurred_at', { ascending: false }),
      supabase.from('email_suppressions')
        .select(SUPPRESSION_COLUMNS)
        .eq('email', contact.email)
        .order('created_at', { ascending: false }),
    ])

    const messageRows = assertSupabase(messages, 'load contact email messages') || []
    const messageIds = messageRows.map((message) => message.id)
    const eventRows = messageIds.length
      ? assertSupabase(await supabase
        .from('email_events')
        .select(EVENT_COLUMNS)
        .in('message_id', messageIds)
        .order('occurred_at', { ascending: false }), 'load contact email events') || []
      : []
    const businessEventRows = assertSupabase(businessEvents, 'load contact business events') || []
    const suppressionRows = assertSupabase(suppressions, 'load contact suppressions') || []
    const eventTypesByMessageId = eventRows.reduce((grouped, event) => {
      if (!grouped[event.message_id]) grouped[event.message_id] = []
      grouped[event.message_id].push({ event_type: event.event_type, occurred_at: event.occurred_at })
      return grouped
    }, {})

    return json(response, 200, {
      configured: true,
      campaign_id: campaignId,
      contacts: contactList,
      selected_contact: {
        ...contact,
        enrollments,
        messages: messageRows.map((message) => ({ ...message, events: eventTypesByMessageId[message.id] || [] })),
        message_summary: contactMessageSummary(messageRows),
        business_events: businessEventRows,
        suppressions: suppressionRows,
      },
      refreshed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Contact activity failed', { error: error instanceof Error ? error.message : String(error) })
    return json(response, 500, { configured: true, error: 'contact_activity_query_failed' })
  }
}

export { CONTACT_COLUMNS, ENROLLMENT_COLUMNS, MESSAGE_COLUMNS, EVENT_COLUMNS, BUSINESS_EVENT_COLUMNS, SUPPRESSION_COLUMNS }
