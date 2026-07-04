import type { AttachmentPlan } from './attachment-plan'
import { escapeMarkdown } from './markdown-escape'

export function renderAttachments(plans: AttachmentPlan[]): string[] {
  return plans.map((plan) => `- [${escapeMarkdown(plan.name)}](media/${plan.fileName})`)
}
