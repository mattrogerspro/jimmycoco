function partsInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]))
}

function localPartsToUtc(parts, timeZone) {
  let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute || 0, parts.second || 0)
  for (let index = 0; index < 3; index += 1) {
    const seen = partsInZone(new Date(guess), timeZone)
    const seenAsUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute, seen.second)
    const wantedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute || 0, parts.second || 0)
    guess += wantedAsUtc - seenAsUtc
  }
  return new Date(guess)
}

export function campaignSendAt(enrolledAt, dayOffset, timeZone, localHour) {
  if (dayOffset === 0) return new Date(enrolledAt)
  const base = partsInZone(new Date(enrolledAt), timeZone)
  const nominal = new Date(Date.UTC(base.year, base.month - 1, base.day + dayOffset, localHour, 0, 0))
  return localPartsToUtc({
    year: nominal.getUTCFullYear(),
    month: nominal.getUTCMonth() + 1,
    day: nominal.getUTCDate(),
    hour: localHour,
    minute: 0,
    second: 0,
  }, timeZone)
}

export function sequenceStepSendAt(sequenceStartedAt, dayOffset, timeZone, localHour) {
  const anchor = new Date(sequenceStartedAt)
  if (dayOffset === 0) return anchor

  const preferredLocalSend = campaignSendAt(anchor, dayOffset, timeZone, localHour)
  const minimumElapsedSend = new Date(anchor.getTime() + dayOffset * 24 * 60 * 60 * 1000)
  return preferredLocalSend.getTime() >= minimumElapsedSend.getTime()
    ? preferredLocalSend
    : minimumElapsedSend
}

export function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
