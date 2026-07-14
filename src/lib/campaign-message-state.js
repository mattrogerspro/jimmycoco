export function resolveCampaignMessageState({
  campaignMode,
  index,
  messageAlias,
  output,
  supplementalOutputs = [],
  registryCampaign,
}) {
  const primarySteps = registryCampaign?.steps || []
  const supplementalSteps = registryCampaign?.triggeredSteps || []
  const allSteps = [...primarySteps, ...supplementalSteps]
  const matchedStep = messageAlias
    ? allSteps.find((step) => step.templateAlias === messageAlias)
    : null
  const appendedSupplementalStep = index >= primarySteps.length
    ? supplementalSteps[index - primarySteps.length]
    : null
  const registryStep = matchedStep || primarySteps[index] || appendedSupplementalStep
  const matchesSupplementalAlias = Boolean(
    messageAlias && supplementalSteps.some((step) => step.templateAlias === messageAlias),
  )
  const isSupplemental = supplementalOutputs.includes(output)
    || matchesSupplementalAlias
    || Boolean(appendedSupplementalStep)

  return {
    registryStep,
    isSupplemental,
    isTriggered: campaignMode === 'event' || Boolean(registryStep?.trigger) || isSupplemental,
  }
}
