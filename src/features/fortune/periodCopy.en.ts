import type { PeriodCopy } from './periodCopy.ko';

export const PERIOD_COPY_EN = {
  toneLabels: {
    flow: 'a clearly supportive flow',
    steady: 'a flow that rewards calibration',
    care: 'a flow that calls for a slower pace',
  },
  ui: {
    kicker: { month: 'MONTHLY FLOW', year: 'YEARLY FLOW' },
    description: {
      month: 'Five samples across the month connect its shifts in strength with practical timing.',
      year: 'Twelve monthly samples connect the year’s quarterly turns with its broader rhythm.',
    },
    overview: 'Flow overview',
    strategies: 'Strategies by area',
    segments: { month: 'Five windows in detail', year: 'Twelve months in detail' },
    quarters: 'Quarterly flow',
    opportunity: 'Opportunity window',
    caution: 'Caution window',
    chartSuffix: 'flow line chart',
  },
  headlines: {
    month: {
      flow: (label) => `${label} is a month for turning broader possibility into a concrete choice.`,
      steady: (label) => `${label} is a month for moving steadily while respecting each change in pace.`,
      care: (label) => `${label} is a month for protecting the foundation and preparing the next move.`,
    },
    year: {
      flow: (label) => `${label} is a year for connecting wider possibility with practical results.`,
      steady: (label) => `${label} is a year for growing the foundation by adjusting pace with each season.`,
      care: (label) => `${label} is a year for placing restoration and maintenance ahead of forced expansion.`,
    },
  },
  overview: {
    overall: (label, score, tone) => `${label} has an overall score of ${score}, placing the period in ${tone}.`,
    strongestCategory: (category, score) => `${category} is the clearest area of strength at ${score}, making it a useful place for a prepared choice.`,
    softestCategory: (category, score) => `${category} needs the most attentive handling at ${score}, so leave room and add a deliberate review step.`,
    risingWindow: (dateLabel, score) => `${dateLabel} is the rising window at ${score}, making it a useful time to consider an important proposal or beginning.`,
    cautionWindow: (dateLabel, score) => `${dateLabel} is the caution window at ${score}, so build extra room into the schedule and spending.`,
    firstHalf: (score, tone) => `The first-half average is ${score}, indicating ${tone} and a matching pace for the opening months.`,
    secondHalf: (score, tone) => `The second-half average is ${score}, indicating ${tone} and a matching way to allocate remaining resources.`,
    rhythm: (strongDate, softDate) => `Put forward motion near ${strongDate} and review near ${softDate} so the schedule reflects the period’s changing strength.`,
    action: (category, strongDate) => `Choose one postponed step related to ${category} and take its first action around ${strongDate}.`,
  },
  strategy: {
    intensity: (category, score, tone) => `${category} currently scores ${score}, which corresponds to ${tone}.`,
    opportunity: (category, tone) => `In ${category}, use ${tone} to clarify the priority of a choice you have already prepared.`,
    caution: (category, tone) => `When ${tone} is noticeable in ${category}, avoid declaring the outcome and review the conditions and other people’s responses.`,
    action: (category, tone) => `Reduce the next ${category} action to one step and give it a deadline that fits ${tone}.`,
  },
  segment: {
    month: {
      title: (dateLabel) => `Flow around ${dateLabel}`,
      summary: (dateLabel, score, tone) => `The ${dateLabel} sample scores ${score} and shows ${tone}.`,
      experience: (dateLabel, score, tone) => `Around ${dateLabel}, the ${score}-point ${tone} may be noticeable in everyday pacing.`,
      use: (dateLabel, tone) => `On ${dateLabel}, match the size and order of important work to ${tone}.`,
      caution: (dateLabel, tone) => `Do not treat the ${dateLabel} ${tone} as a guaranteed outcome; compare it with real conditions and your actual capacity.`,
    },
    year: {
      title: (dateLabel) => `Monthly flow for ${dateLabel}`,
      summary: (dateLabel, score, tone) => `The ${dateLabel} sample scores ${score} and shows ${tone}.`,
      experience: (dateLabel, score, tone) => `The theme for ${dateLabel} is translating its ${score}-point ${tone} into everyday priorities.`,
      use: (dateLabel, tone) => `For ${dateLabel}, place the month’s central goal and its breathing room in a plan that fits ${tone}.`,
      caution: (dateLabel, tone) => `Do not assume the ${dateLabel} ${tone} will persist; compare it with the next sample and with changes in real life.`,
    },
  },
  quarter: {
    label: (quarter) => `Q${quarter}`,
    title: (quarterLabel) => `${quarterLabel} larger flow`,
    summary: (quarterLabel, score, tone) => `${quarterLabel} averages ${score} and shows ${tone}.`,
    flow: (quarterLabel, score, tone) => `${quarterLabel} can be summarized as ${tone} with an average score of ${score}.`,
    focus: (quarterLabel, category) => `In ${quarterLabel}, use the year’s strongest area, ${category}, while continuing to check balance across the other areas.`,
    turning: (quarterLabel, direction) => `${quarterLabel} shows ${direction === 'up' ? 'strength building toward the end of the quarter' : direction === 'down' ? 'a need to reduce pace toward the end of the quarter' : 'a similar level of strength across the quarter'} as its turning signal.`,
    action: (quarterLabel, category, tone) => `In ${quarterLabel}, choose one next step in ${category} and mark a review date that fits ${tone}.`,
  },
  window: {
    opportunity: (dateLabel, score) => `${dateLabel} · ${score} — a useful window for beginnings, proposals, and important meetings.`,
    caution: (dateLabel, score) => `${dateLabel} · ${score} — a window for reducing overwork, impulse spending, and rushed conclusions.`,
  },
  evidence: (dateLabel, score) => `${dateLabel} · flow score ${score}`,
} satisfies PeriodCopy;
