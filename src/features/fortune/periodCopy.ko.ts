import type { FortunePeriod, PeriodTone } from './periodFortune';

type SegmentCopy = {
  title: (dateLabel: string) => string;
  summary: (dateLabel: string, score: string, tone: string) => string;
  experience: (dateLabel: string, score: string, tone: string) => string;
  use: (dateLabel: string, tone: string) => string;
  caution: (dateLabel: string, tone: string) => string;
};

export type PeriodCopy = {
  toneLabels: Record<PeriodTone, string>;
  ui: {
    kicker: Record<FortunePeriod, string>;
    description: Record<FortunePeriod, string>;
    overview: string;
    strategies: string;
    segments: Record<FortunePeriod, string>;
    quarters: string;
    opportunity: string;
    caution: string;
    chartSuffix: string;
  };
  headlines: Record<FortunePeriod, Record<PeriodTone, (label: string) => string>>;
  overview: {
    overall: (label: string, score: string, tone: string) => string;
    strongestCategory: (category: string, score: string) => string;
    softestCategory: (category: string, score: string) => string;
    risingWindow: (dateLabel: string, score: string) => string;
    cautionWindow: (dateLabel: string, score: string) => string;
    firstHalf: (score: string, tone: string) => string;
    secondHalf: (score: string, tone: string) => string;
    rhythm: (strongDate: string, softDate: string) => string;
    action: (category: string, strongDate: string) => string;
  };
  strategy: {
    intensity: (category: string, score: string, tone: string) => string;
    opportunity: (category: string, tone: string) => string;
    caution: (category: string, tone: string) => string;
    action: (category: string, tone: string) => string;
  };
  segment: Record<FortunePeriod, SegmentCopy>;
  quarter: {
    label: (quarter: number) => string;
    title: (quarterLabel: string) => string;
    summary: (quarterLabel: string, score: string, tone: string) => string;
    flow: (quarterLabel: string, score: string, tone: string) => string;
    focus: (quarterLabel: string, category: string) => string;
    turning: (quarterLabel: string, direction: 'up' | 'down' | 'even') => string;
    action: (quarterLabel: string, category: string, tone: string) => string;
  };
  window: {
    opportunity: (dateLabel: string, score: string) => string;
    caution: (dateLabel: string, score: string) => string;
  };
  evidence: (dateLabel: string, score: string) => string;
};

export const PERIOD_COPY_KO: PeriodCopy = {
  toneLabels: {
    flow: '힘이 선명한 흐름',
    steady: '균형을 다듬는 흐름',
    care: '속도를 낮출 흐름',
  },
  ui: {
    kicker: { month: 'MONTHLY FLOW', year: 'YEARLY FLOW' },
    description: {
      month: '한 달의 다섯 표본을 연결해 강약과 행동 타이밍을 읽었습니다.',
      year: '열두 달의 표본을 연결해 분기별 전환과 연간 리듬을 읽었습니다.',
    },
    overview: '흐름 개요',
    strategies: '분야별 전략',
    segments: { month: '다섯 구간 해설', year: '열두 달 해설' },
    quarters: '분기별 큰 흐름',
    opportunity: '기회 구간',
    caution: '주의 구간',
    chartSuffix: '흐름 선 그래프',
  },
  headlines: {
    month: {
      flow: (label) => `${label}, 확장의 흐름을 구체적인 선택으로 옮길 달입니다.`,
      steady: (label) => `${label}, 강약을 살피며 꾸준히 전진할 달입니다.`,
      care: (label) => `${label}, 기반을 지키며 다음 흐름을 준비할 달입니다.`,
    },
    year: {
      flow: (label) => `${label}, 넓어진 가능성을 현실적인 성과로 연결할 해입니다.`,
      steady: (label) => `${label}, 계절마다 속도를 조절하며 기반을 키울 해입니다.`,
      care: (label) => `${label}, 무리한 확장보다 회복과 정비를 우선할 해입니다.`,
    },
  },
  overview: {
    overall: (label, score, tone) => `${label}의 전체 점수는 ${score}점으로 ${tone}에 놓여 있습니다.`,
    strongestCategory: (category, score) => `가장 힘이 또렷한 분야는 ${category} ${score}점이므로 준비한 선택을 먼저 배치하기 좋습니다.`,
    softestCategory: (category, score) => `상대적으로 세심한 관리가 필요한 분야는 ${category} ${score}점이므로 여유와 확인 절차를 확보하세요.`,
    risingWindow: (dateLabel, score) => `상승 구간은 ${dateLabel}의 ${score}점 흐름으로 중요한 제안이나 시작을 검토하기 좋습니다.`,
    cautionWindow: (dateLabel, score) => `주의 구간은 ${dateLabel}의 ${score}점 흐름으로 일정과 지출에 완충 시간을 두는 편이 좋습니다.`,
    firstHalf: (score, tone) => `상반기 평균은 ${score}점으로 ${tone}을 보이므로 초반의 속도를 그에 맞춰 조절하세요.`,
    secondHalf: (score, tone) => `하반기 평균은 ${score}점으로 ${tone}을 보이므로 남은 자원을 그 리듬에 맞춰 배분하세요.`,
    rhythm: (strongDate, softDate) => `${strongDate}에는 전진하고 ${softDate}에는 점검하는 식으로 강약을 일정에 반영하세요.`,
    action: (category, strongDate) => `${category}와 관련해 미뤄 둔 한 가지를 정하고 ${strongDate} 전후에 첫 단계를 실행하세요.`,
  },
  strategy: {
    intensity: (category, score, tone) => `${category}의 현재 강도는 ${score}점으로 ${tone}에 해당합니다.`,
    opportunity: (category, tone) => `${category}에서는 ${tone}을 활용해 이미 준비한 선택의 우선순위를 분명히 할 수 있습니다.`,
    caution: (category, tone) => `${category}에서 ${tone}이 느껴질수록 결과를 단정하지 말고 조건과 상대의 반응을 다시 확인하세요.`,
    action: (category, tone) => `${category}와 관련된 다음 행동을 한 단계로 줄이고 ${tone}에 맞는 기한을 정하세요.`,
  },
  segment: {
    month: {
      title: (dateLabel) => `${dateLabel} 전후 흐름`,
      summary: (dateLabel, score, tone) => `${dateLabel} 표본은 ${score}점으로 ${tone}을 보여 줍니다.`,
      experience: (dateLabel, score, tone) => `${dateLabel} 전후에는 ${score}점의 ${tone}이 일상에서 체감될 수 있습니다.`,
      use: (dateLabel, tone) => `${dateLabel}에는 ${tone}에 맞춰 중요한 일의 크기와 순서를 조절하세요.`,
      caution: (dateLabel, tone) => `${dateLabel}의 ${tone}만으로 결과를 단정하지 말고 실제 상황과 컨디션을 함께 살피세요.`,
    },
    year: {
      title: (dateLabel) => `${dateLabel}의 월간 흐름`,
      summary: (dateLabel, score, tone) => `${dateLabel} 표본은 ${score}점으로 ${tone}을 보여 줍니다.`,
      experience: (dateLabel, score, tone) => `${dateLabel}의 주제는 ${score}점의 ${tone}을 생활 속 우선순위로 번역하는 일입니다.`,
      use: (dateLabel, tone) => `${dateLabel}에는 ${tone}에 맞춰 한 달의 핵심 목표와 여유 시간을 함께 배치하세요.`,
      caution: (dateLabel, tone) => `${dateLabel}의 ${tone}이 지속된다고 가정하지 말고 다음 달 표본과 실제 변화를 함께 확인하세요.`,
    },
  },
  quarter: {
    label: (quarter) => `${quarter}분기`,
    title: (quarterLabel) => `${quarterLabel} 큰 흐름`,
    summary: (quarterLabel, score, tone) => `${quarterLabel} 평균은 ${score}점으로 ${tone}을 보여 줍니다.`,
    flow: (quarterLabel, score, tone) => `${quarterLabel}의 큰 흐름은 평균 ${score}점의 ${tone}으로 요약할 수 있습니다.`,
    focus: (quarterLabel, category) => `${quarterLabel}에는 연간 강점인 ${category}를 우선 활용하되 다른 분야의 균형도 함께 확인하세요.`,
    turning: (quarterLabel, direction) => `${quarterLabel}의 전환 신호는 ${direction === 'up' ? '분기 말로 갈수록 힘이 오르는 모습' : direction === 'down' ? '분기 말로 갈수록 속도를 낮출 필요' : '분기 안에서 비슷한 강도가 이어지는 모습'}입니다.`,
    action: (quarterLabel, category, tone) => `${quarterLabel}에는 ${category}의 다음 단계를 하나 정하고 ${tone}에 맞는 검토 시점을 달력에 남기세요.`,
  },
  window: {
    opportunity: (dateLabel, score) => `${dateLabel} · ${score}점 — 시작, 제안, 중요한 만남을 배치하기 좋은 구간입니다.`,
    caution: (dateLabel, score) => `${dateLabel} · ${score}점 — 과로, 충동 지출, 성급한 결론을 줄일 구간입니다.`,
  },
  evidence: (dateLabel, score) => `${dateLabel} · 흐름 점수 ${score}점`,
};
