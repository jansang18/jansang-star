import type { DailyFortuneCopy } from './copy.ko';

export const DAILY_FORTUNE_COPY_EN: DailyFortuneCopy = {
  headlines: {
    high: 'A day to let your own light remain visible',
    medium: 'A day when patient attention clarifies the way forward',
    low: 'A day to slow down and protect your inner rhythm',
  },
  colors: ['Bone ivory', 'Champagne gold', 'Deep cobalt', 'Copper', 'Sage', 'Smoke blue', 'Pearl gray'],
  advice: {
    high: 'Give the invitation that genuinely interests you a second, attentive look.',
    medium: 'Before an important decision, pause for ten slow breaths.',
    low: 'Let rest and emotional room come before a rushed answer today.',
  },
  evidence: {
    withAspect: (categoryLabel, signal) => `The clearest signal for ${categoryLabel.toLowerCase()} today is ${signal}.`,
    neutral: (categoryLabel) => `For ${categoryLabel.toLowerCase()}, major influences are comparatively even, so this reading rests on the day's broader rhythm.`,
    neutralSignal: 'Major influences are comparatively even',
  },
  overall: {
    summaries: {
      high: [
        'Your choices gain traction today, and beginning one postponed task can give the rest of the day a natural sequence.',
        'Nearby opportunities are easier to recognize today, so let your confidence be visible and take one considered step first.',
      ],
      medium: [
        'A useful choice becomes clearer when you look once more before reaching a conclusion.',
        'Small acts of order matter more than dramatic change today, so give your full attention to one manageable priority.',
      ],
      low: [
        'Your feelings and circumstances may move at different speeds today, making it wiser to protect energy than force an important decision.',
        'An unexpected variable is not proof that you chose badly, and slowing down is a practical form of progress today.',
      ],
    },
    experience: {
      high: 'Your internal reference point may feel clearer than usual, making it easier to bring personal values into small decisions.',
      medium: 'Confidence and hesitation may alternate, yet a deliberate sequence can make the day’s rhythm feel steadier.',
      low: 'You may rush ahead emotionally or postpone a choice, but neither response needs to be treated as a verdict about the day.',
    },
    morning: {
      high: 'In the morning, name the most important objective in one sentence and tell the relevant person what you intend to do.',
      medium: 'In the morning, reduce competing options by organizing your schedule and priorities before adding anything new.',
      low: 'In the morning, reserve time for recovery and keep no more than three essential tasks in view.',
    },
    afternoon: {
      high: 'In the afternoon, turn your chosen direction into one finished artifact so momentum becomes concrete progress.',
      medium: 'In the afternoon, act on one checked decision and record the result so the next choice has useful evidence.',
      low: 'In the afternoon, organize what is already underway and leave enough margin to absorb an unexpected change.',
    },
    caution: {
      high: 'When confidence is plentiful, check another person’s pace and the practical constraints before assuming the result will last.',
      medium: 'Avoid vague commitments and impulsive conclusions, and leave a short written record of anything important.',
      low: 'A conclusion reached while depleted can become unnecessarily absolute, so a major decision may benefit from another day.',
    },
    action: {
      high: 'Finish the single most important task first, then share the result with someone whose judgment you trust.',
      medium: 'Write three priorities in order and complete the first one before you rearrange the list.',
      low: 'Reduce the task list to three items or fewer and place recovery time on the schedule as a real commitment.',
    },
  },
  focused: {
    love: {
      summaries: {
        high: ['Honest expression can warm a relationship today, and a thoughtful first word may invite a deeper answer than expected.', 'Affection and familiarity can grow without much force today when you let sincerity replace performance.'],
        medium: ['Listen for the feeling beneath the words and use unhurried attention to find a more comfortable emotional temperature.', 'Small consideration matters most in familiar relationships today, so notice something you appreciate and express it clearly.'],
        low: ['Emotions may become sensitive quickly today, so let your response settle before continuing an important conversation.', 'Do not interpret another person’s silence as a negative conclusion when respecting some space can protect the relationship today.'],
      },
      opportunity: { high: 'Naming affection or appreciation specifically can create room for both people to align their expectations without pressure.', medium: 'One sincere question followed by patient listening may reveal something new even in a familiar relationship.', low: 'Time alone to sort feelings from facts can prepare a calmer and more accurate conversation.' },
      caution: { high: 'Do not turn a pleasant atmosphere into a promise too quickly; respect the pace shown by the other person’s actions.', medium: 'Guessing at an unspoken intention or pressing for an answer can enlarge a small misunderstanding, so ask for clarification.', low: 'Do not expand one sensitive reaction into a conclusion about the entire relationship; return to the conversation after emotions settle.' },
      action: { high: 'Recall one moment of appreciation and express it in a short, direct message today.', medium: 'Let the other person finish, then confirm what you understood in a single sentence.', low: 'Name the feeling in three words and reread any immediate reply before sending it.' },
    },
    money: {
      summaries: {
        high: ['Practical judgment is easier to access today, making this a useful time to review a long-considered purchase or budget adjustment.', 'Small savings and well-chosen tradeoffs can produce satisfaction while helping you rearrange resources you already have.'],
        medium: ['Look at the flow of spending as closely as income because closing a small leak can restore a useful sense of control.', 'Check every condition and look at the numbers directly before accepting a new offer.'],
        low: ['Avoid impulsive spending and optimistic financial promises because protecting what you have is a constructive choice today.', 'Do not ask emotion to settle a financial question, and gather the relevant information before making a large decision.'],
      },
      opportunity: { high: 'Comparing the budget with the actual need may reveal a more efficient way to allocate existing resources.', medium: 'Reviewing recurring charges and fixed expenses can create room for next month without requiring a dramatic decision.', low: 'Pausing new spending and checking available funds against scheduled costs can reduce uncertainty.' },
      caution: { high: 'Even an attractive offer deserves a review of fees and exit terms before you treat a financial benefit as certain.', medium: 'Do not let mood or presentation decide a purchase; compare price, usefulness, and likely frequency of use.', low: 'Do not make a large purchase or investment in a rush to recover a loss, and consult a qualified professional when appropriate.' },
      action: { high: 'Compare the price, usefulness, and alternatives for one long-considered expense in a simple table.', medium: 'Sort the past week’s spending into three groups and choose one recurring cost to reduce.', low: 'List scheduled payments and essential expenses before deciding how much is actually available.' },
    },
    career: {
      summaries: {
        high: ['Focus and expression support each other today, so make your strongest evidence visible in an important proposal or presentation.', 'Work you organize proactively may be easier for others to recognize when clear priorities improve both pace and quality.'],
        medium: ['Strengthen work already in progress before opening a new track because reliable fundamentals build trust today.', 'In collaboration, sharing the process matters as much as the conclusion, so offer a brief progress update before others need to ask.'],
        low: ['Schedules and expectations may not align easily today, so narrow the promise and handle the essential work first.', 'Organize the facts before challenging authority or a difficult request so a clear record can protect the conversation from unnecessary heat.'],
      },
      opportunity: { high: 'Presenting a prepared idea with its central evidence can clarify both your role and the next step.', medium: 'A concise progress update and a specific request for support may reveal how to unblock collaboration.', low: 'Renegotiating scope and deadline conditions can reduce excess responsibility and restore focus to the necessary result.' },
      caution: { high: 'Do not skip a colleague’s information or a review step in the rush to perform; confirm decision authority first.', medium: 'Do not interpret an ambiguous request alone; put the completion standard and deadline into clear language.', low: 'Pressure and fatigue are not proof of inadequate ability, so keep difficult conversations centered on facts and records.' },
      action: { high: 'Spend twenty-five uninterrupted minutes completing a first draft of the work with the greatest practical impact.', medium: 'Share one line each on the current state, next action, and support needed for an active task.', low: 'Choose the one deadline that must hold and request an adjustment to the rest of the schedule.' },
    },
    health: {
      summaries: {
        high: ['Your physical rhythm may feel steady today, and gentle movement with regular hydration can help preserve that comfortable baseline.', 'Restorative habits may be easier to resume when a walk or unforced stretch gives the body a welcome change of pace.'],
        medium: ['Concentration can make physical cues easy to miss, so release the shoulders and take a slower breath once an hour.', 'Regular meals and sleep matter more than an ambitious workout today, and a modest routine is enough.'],
        low: ['Fatigue may feel more noticeable today, making a reduced schedule and protected sleep a sensible response.', 'Tension may be easier to feel in the body today, so consider less caffeine and a few minutes of unhurried breathing.'],
      },
      opportunity: { high: 'Connecting comfortable movement with regular meals can help you maintain steadier energy without forcing performance.', medium: 'Scheduling brief pauses and water breaks can make physical cues easier to notice during concentrated work.', low: 'Lowering the day’s intensity and reserving recovery time can create room to observe how you actually feel.' },
      caution: { high: 'Feeling capable is not a reason to change exercise intensity or sleep abruptly; stay within a familiar, safe range.', medium: 'Do not push every sign of fatigue aside through willpower; check basic conditions such as food, water, posture, and rest.', low: 'Do not use a fortune reading to judge persistent or concerning symptoms; seek appropriate medical care when needed.' },
      action: { high: 'Move at a comfortable pace for twenty minutes and compare how your body feels before and after.', medium: 'Once each hour, stand and move the shoulders and neck gently through a comfortable range.', low: 'Remove one nonessential demand and reserve a quiet period that supports sleep.' },
    },
  },
};
