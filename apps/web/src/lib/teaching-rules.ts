import { buildTeachingSignals, type TeachingDashboardInput, type TeachingSignals } from "./teaching-signals";

export type TeachingTopic =
  | "income_vs_cash"
  | "budget_boundary"
  | "fixed_cost_pressure"
  | "emergency_buffer"
  | "insurance_protection"
  | "risk_resilience"
  | "debt_ratio_dsr"
  | "minimum_payment_trap"
  | "good_vs_bad_debt"
  | "impulse_spending"
  | "quality_vs_growth_spending"
  | "car_home_cashflow"
  | "family_lifecycle_cost"
  | "asset_allocation"
  | "financial_freedom";

export type TeacherBriefing = {
  topic: TeachingTopic;
  topicLabel: string;
  headline: string;
  summary: string;
  priority: "high" | "medium" | "low";
  topicTags: string[];
  lessonGoal: string;
  recommendedRounds: string[];
  recommendedMacroEvents: string[];
  teacherFocus: string[];
  evidence: Array<{ label: string; value: string }>;
  compareSuggestions: string[];
  teacherQuestions: string[];
  followUpActions: string[];
};

type TopicScore = {
  topic: TeachingTopic;
  score: number;
  priority: TeacherBriefing["priority"];
};

type TopicPlan = {
  label: string;
  lessonGoal: string;
  recommendedRounds: string[];
  recommendedMacroEvents: string[];
  teacherFocus: string[];
};

// Teaching topic plans keep course-design metadata separate from runtime scoring.
const topicPlans: Record<TeachingTopic, TopicPlan> = {
  income_vs_cash: {
    label: "为什么有收入还会没钱",
    lessonGoal: "让学生先建立‘收入不等于可支配现金’的现金流意识。",
    recommendedRounds: ["第 1-2 回合", "适合作为开课引导"],
    recommendedMacroEvents: ["事件 2：居住成本上升", "事件 8：生活成本上涨", "事件 16：能源价格跳升", "事件 21：汇率走弱抬高输入成本"],
    teacherFocus: ["工资流入", "必要支出", "可支配余额", "现金先于净资产暴露问题"]
  },
  budget_boundary: {
    label: "预算边界：必要支出和可选支出",
    lessonGoal: "教学生做预算优先级排序，先保基本盘，再谈舒适度。",
    recommendedRounds: ["第 2-3 回合", "适合在学生第一次出现明显消费分化时讲"],
    recommendedMacroEvents: ["事件 6：消费者信心转弱", "事件 23：零售补贴刺激短期消费", "事件 25：旅游平台价格战"],
    teacherFocus: ["必要支出 vs 可选支出", "预算边界", "延迟满足", "冲动消费的累积效应"]
  },
  fixed_cost_pressure: {
    label: "固定成本为什么最危险",
    lessonGoal: "让学生明白固定成本比一次性支出更容易锁死未来选择。",
    recommendedRounds: ["第 3-5 回合", "适合在房车或家庭负担抬头后讲"],
    recommendedMacroEvents: ["事件 2：居住成本上升", "事件 30：首套房按揭放松", "事件 35：通勤铁路扩容"],
    teacherFocus: ["月供", "房车维护费", "固定支出锁定", "预算弹性下降"]
  },
  emergency_buffer: {
    label: "应急金为什么优先",
    lessonGoal: "建立‘流动性优先于投资’的意识。",
    recommendedRounds: ["第 2-4 回合", "适合在学生开始出现现金吃紧时讲"],
    recommendedMacroEvents: ["事件 8：生活成本上涨", "事件 18：信贷标准收紧", "事件 19：公共卫生事件提升保障意识"],
    teacherFocus: ["应急金月数", "流动性", "缓冲时间", "为什么先留现金"]
  },
  insurance_protection: {
    label: "保障为什么不是多余支出",
    lessonGoal: "理解医疗、意外、网络安全保障的功能是防大亏而不是赚钱。",
    recommendedRounds: ["第 4-6 回合", "适合在风险事件命中较多时讲"],
    recommendedMacroEvents: ["事件 9：医疗改革降低常规诊疗成本", "事件 19：公共卫生事件", "事件 28：反诈宣传强化", "事件 39：社区健康补贴"],
    teacherFocus: ["低概率大损失", "保险不是投资", "安全准备", "没准备时如何被迫借款"]
  },
  risk_resilience: {
    label: "风险管理的核心是承受力",
    lessonGoal: "把理财从预测收益转到提升系统韧性。",
    recommendedRounds: ["第 5-7 回合", "适合在同类冲击下结果明显分化时讲"],
    recommendedMacroEvents: ["事件 4：平台裁员压低增长预期", "事件 8：生活成本上涨", "事件 19：公共卫生事件"],
    teacherFocus: ["承受力", "风险缓冲", "保护命中 / 放大命中", "为什么同样风险后果不同"]
  },
  debt_ratio_dsr: {
    label: "负债率、DSR 和最低还款怎么看",
    lessonGoal: "教学生读懂债务压力指标，不再只凭感觉判断风险。",
    recommendedRounds: ["第 6-8 回合", "适合在借款和还款都开始抬头后讲"],
    recommendedMacroEvents: ["事件 6：消费转弱", "事件 18：年轻借款人信贷收紧", "事件 38：自由职业报税压力"],
    teacherFocus: ["负债率", "DSR", "最低还款", "债务不是只看欠多少"]
  },
  minimum_payment_trap: {
    label: "最低还款陷阱",
    lessonGoal: "让学生理解‘现在不痛’可能换来‘长期更痛’。",
    recommendedRounds: ["第 7-9 回合", "适合在最低还款进入主要驱动后讲"],
    recommendedMacroEvents: ["事件 18：信贷标准收紧", "事件 38：现金纪律和报税压力"],
    teacherFocus: ["最低还款的麻痹性", "利息滚动", "未来现金流被侵蚀", "现在没爆雷不代表安全"]
  },
  good_vs_bad_debt: {
    label: "好债务、坏债务与借款边界",
    lessonGoal: "让学生学会判断借款用途和还款边界。",
    recommendedRounds: ["第 8-10 回合", "适合衔接成长投入和消费型借款讨论"],
    recommendedMacroEvents: ["事件 12：制造业升级带动技能岗位", "事件 15：青年技能补贴扩大", "事件 18：信贷收紧"],
    teacherFocus: ["生产性借款", "消费性借款", "借款边界", "还款能力匹配"]
  },
  impulse_spending: {
    label: "冲动消费、面子消费、情绪消费",
    lessonGoal: "帮助学生识别消费背后的心理机制。",
    recommendedRounds: ["第 5-8 回合", "适合在社交或消费事件后讲"],
    recommendedMacroEvents: ["事件 23：零售补贴刺激消费", "事件 25：旅游价格战", "事件 31：高端消费情绪降温"],
    teacherFocus: ["情绪触发", "面子消费", "冷静期", "消费行为和财务后果"]
  },
  quality_vs_growth_spending: {
    label: "生活品质消费和成长投入的区别",
    lessonGoal: "区分‘享受型消费’和‘成长型投入’。",
    recommendedRounds: ["第 8-10 回合", "适合在学生开始出现明显自我投资分化时讲"],
    recommendedMacroEvents: ["事件 12：技能岗位需求上升", "事件 15：技能补贴", "事件 17：远程办公工具需求", "事件 20：教育内容更受推荐"],
    teacherFocus: ["体验消费", "学习投入", "人力资本", "未来回报"]
  },
  car_home_cashflow: {
    label: "买车买房前先看现金流",
    lessonGoal: "建立房车决策前的现金流视角。",
    recommendedRounds: ["第 9-11 回合", "适合在购置房车后立刻讲"],
    recommendedMacroEvents: ["事件 2：居住成本上升", "事件 16：能源价格跳升", "事件 30：首套房按揭放松", "事件 35：通勤条件改善"],
    teacherFocus: ["首付只是开始", "月供和维护费", "持有成本", "资产名义价值 vs 现金流压力"]
  },
  family_lifecycle_cost: {
    label: "婚恋与家庭责任如何改写预算",
    lessonGoal: "理解人生阶段变化对财务结构的影响。",
    recommendedRounds: ["第 10-12 回合", "适合在订婚、结婚、家庭支持支出出现后讲"],
    recommendedMacroEvents: ["事件 5：社交与人情机会增加", "事件 13：假日旅游带动社交消费", "事件 24：养老话题升温，衔接家庭责任"],
    teacherFocus: ["订婚/结婚", "家庭支持", "持续性义务", "家庭阶段和预算结构"]
  },
  asset_allocation: {
    label: "资产配置与分散投资",
    lessonGoal: "建立资产分工意识，理解分散不是保守而是控制单点失误。",
    recommendedRounds: ["第 11-13 回合", "适合在投资结果明显分化时讲"],
    recommendedMacroEvents: ["事件 1：AI 热潮风险偏好上升", "事件 3：债券资产回暖", "事件 7：虚拟币投机升温", "事件 11：AI 硬件回调", "事件 32：债基重新受关注"],
    teacherFocus: ["现金类", "稳健类", "权益类", "高风险类", "分散不是保守，是控制单点失误"]
  },
  financial_freedom: {
    label: "长期规划与财富自由",
    lessonGoal: "把前面所有内容收束到长期结构和财富自由度上。",
    recommendedRounds: ["第 13-15 回合", "适合作为课程总结或阶段复盘"],
    recommendedMacroEvents: ["事件 24：养老话题升温", "事件 40：养老讲座强化复利意识", "事件 15：技能补贴", "事件 20：教育内容曝光"],
    teacherFocus: ["财富自由度", "长期结构", "现金流纪律", "固定成本", "资产配置", "长期准备"]
  }
};

export const teachingTopicOptions = (Object.entries(topicPlans) as Array<[TeachingTopic, TopicPlan]>).map(([value, plan]) => ({
  value,
  label: plan.label
}));

const validTeachingTopics = new Set<TeachingTopic>(Object.keys(topicPlans) as TeachingTopic[]);

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function compareSuggestion(input: TeachingDashboardInput, fallback: string) {
  const ranking = input.ranking ?? [];
  if (ranking.length >= 2) {
    const topStudent = ranking[0];
    const bottomStudent = ranking[ranking.length - 1];
    return `可对比 ${topStudent.displayName} 和 ${bottomStudent.displayName}：同班同轮下，为什么结果会拉开。`;
  }

  return fallback;
}

function driverSummary(signals: TeachingSignals) {
  return signals.topDriverKeys.slice(0, 3).join(" / ") || "等待结算后生成";
}

function riskSummary(signals: TeachingSignals) {
  return signals.topRiskTags.slice(0, 3).join(" / ") || "等待结算后生成";
}

function diceSummary(signals: TeachingSignals) {
  return signals.topDiceCategories.slice(0, 2).join(" / ") || "等待结算后生成";
}

function buildBriefing(
  topic: TeachingTopic,
  options: Omit<TeacherBriefing, "topic" | "topicLabel" | "lessonGoal" | "recommendedRounds" | "recommendedMacroEvents" | "teacherFocus">
): TeacherBriefing {
  const plan = topicPlans[topic];
  return {
    topic,
    topicLabel: plan.label,
    lessonGoal: plan.lessonGoal,
    recommendedRounds: plan.recommendedRounds,
    recommendedMacroEvents: plan.recommendedMacroEvents,
    teacherFocus: plan.teacherFocus,
    ...options
  };
}

function buildIncomeVsCashBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("income_vs_cash", {
    headline: "本轮主讲：收入不等于可支配现金",
    summary: "真正决定学生能不能继续配置和抗风险的，不是工资本身，而是扣掉必要支出后还剩多少现金。",
    priority: "high",
    topicTags: ["现金流", "预算", "支出边界"],
    evidence: [
      { label: "已提交人数", value: `${signals.submittedCount} / ${signals.studentCount}` },
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "平均应急金月数", value: `${signals.avgEmergencyMonths.toFixed(1)} 月` },
      { label: "平均净资产", value: currency(signals.avgNetWorth) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比收入接近但现金结余完全不同的两位学生。"),
      "重点找一位消费偏高的学生，再对比一位预算更克制的学生。"
    ],
    teacherQuestions: [
      "为什么工资差不多，最后能动用的钱却差很多？",
      "哪些支出是必须花的，哪些其实可以延后？",
      "如果下一轮发生突发事件，谁更容易先撑不住？"
    ],
    followUpActions: ["先带学生看现金流，再看净资产。", "让学生把必要支出和可选支出分开讨论。"]
  });
}

function buildBudgetBoundaryBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("budget_boundary", {
    headline: "本轮主讲：预算先保基本盘，再考虑舒适度",
    summary: "不是所有支出都同等重要。预算的核心不是一味压缩，而是先守住必要支出，再决定哪些品质消费值得保留。",
    priority: "medium",
    topicTags: ["必要支出", "可选支出", "预算优先级"],
    evidence: [
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "高频风险标签", value: riskSummary(signals) },
      { label: "平均净资产", value: currency(signals.avgNetWorth) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比高消费型和相对克制型学生。"),
      "挑一位把预算放在体验消费上的学生，再对比把预算放在安全垫上的学生。"
    ],
    teacherQuestions: [
      "如果预算只够保留三项支出，你会留下什么？",
      "为什么看似不贵的可选支出，累积起来会很伤？",
      "什么支出现在舒服，但会压缩未来选择？"
    ],
    followUpActions: ["带学生练习必要支出和可选支出的分类。", "强调预算不是拒绝快乐，而是安排顺序。"]
  });
}

function buildFixedCostBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("fixed_cost_pressure", {
    headline: "本轮主讲：固定成本一旦锁住，压力会长期存在",
    summary: "一次性消费只会疼一下，固定成本会持续占用未来现金流，慢慢挤掉应急金、投资和生活弹性。",
    priority: "high",
    topicTags: ["固定成本", "预算弹性", "现金流锁定"],
    evidence: [
      { label: "固定成本锁定人数", value: `${signals.fixedCostLockedCount} 人` },
      { label: "有车人数", value: `${signals.vehiclesOwned} 人` },
      { label: "有房人数", value: `${signals.homesOwned} 人` },
      { label: "家庭阶段变化", value: `订婚 ${signals.engagedCount} / 已婚 ${signals.marriedCount}` }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比收入接近但固定成本完全不同的学生。"),
      "优先讲买完资产后预算变紧的学生。"
    ],
    teacherQuestions: [
      "为什么同样收入，有人还有余钱，有人已经很紧？",
      "什么支出最容易在决策时被低估？",
      "固定成本变高后，最先被牺牲的通常是什么？"
    ],
    followUpActions: ["提醒学生先看持有成本，再看首付或购买动作。", "让学生估算固定成本占收入的比例。"]
  });
}

function buildEmergencyBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("emergency_buffer", {
    headline: "本轮主讲：应急金是在给自己买时间",
    summary: "应急金的价值不在于收益，而在于突发事件来时，你不用立刻靠借款和被动抛售来补洞。",
    priority: "high",
    topicTags: ["应急金", "流动性", "安全垫"],
    evidence: [
      { label: "平均应急金月数", value: `${signals.avgEmergencyMonths.toFixed(1)} 月` },
      { label: "保护命中 / 放大命中", value: `${signals.supportiveHits} / ${signals.amplifiedHits}` },
      { label: "相关事件主题", value: diceSummary(signals) },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比有应急金和没有应急金的学生。"),
      "重点挑一位遭遇冲击但仍能稳住现金流的学生。"
    ],
    teacherQuestions: [
      "为什么应急金收益不高，却必须先准备？",
      "如果没有现金缓冲，学生会被迫做什么？",
      "应急金解决的是‘赚不赚’，还是‘活不活’的问题？"
    ],
    followUpActions: ["让学生把应急金和投资目标分开。", "强调流动性先于收益率。"]
  });
}

function buildInsuranceBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("insurance_protection", {
    headline: "本轮主讲：保障不是为了增值，而是为了防止大亏",
    summary: "医疗、意外、网络安全这些准备平时不显眼，但一旦出事，它们决定了学生是‘疼一下’还是‘被击穿’。",
    priority: "medium",
    topicTags: ["保障", "保险", "低概率大损失"],
    evidence: [
      { label: "保护命中 / 放大命中", value: `${signals.supportiveHits} / ${signals.amplifiedHits}` },
      { label: "相关骰子主题", value: diceSummary(signals) },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比做了保障准备和没做准备的学生。"),
      "优先点名同样遇事但损失轻重不同的学生。"
    ],
    teacherQuestions: [
      "为什么最不想花的钱，往往最关键？",
      "保险和应急金分别解决什么问题？",
      "没有保障时，学生通常会用什么方式填坑？"
    ],
    followUpActions: ["提醒学生保障类支出不是为了回本。", "把保障放在风险管理而不是投资收益框架里讲。"]
  });
}

function buildResilienceBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("risk_resilience", {
    headline: "本轮主讲：风险管理不是预测风险，而是提高承受力",
    summary: "同样的风险冲击打在不同学生身上，后果完全不同。差异来自准备、结构和流动性，而不是运气本身。",
    priority: "medium",
    topicTags: ["承受力", "缓冲", "风险系统"],
    evidence: [
      { label: "保护命中 / 放大命中", value: `${signals.supportiveHits} / ${signals.amplifiedHits}` },
      { label: "高频风险标签", value: riskSummary(signals) },
      { label: "相关事件主题", value: diceSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比同样遇事但结果完全不同的学生。"),
      "挑一位做了充分准备的学生，再对比一位结构更脆弱的学生。"
    ],
    teacherQuestions: [
      "理财是避免所有风险，还是让自己扛得住风险？",
      "什么样的准备最能提高承受力？",
      "风险来之前看起来都差不多，为什么来之后差很大？"
    ],
    followUpActions: ["把课堂注意力从‘猜事件’转到‘建结构’。", "提醒学生建立现金、保障和纪律三个缓冲层。"]
  });
}

function buildDebtRatioBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("debt_ratio_dsr", {
    headline: "本轮主讲：借多少不是关键，还得动才是关键",
    summary: "债务风险不只看‘欠多少’，更要看最低还款和 DSR 有没有开始吃掉未来现金流。",
    priority: "high",
    topicTags: ["负债率", "DSR", "最低还款"],
    evidence: [
      { label: "平均 DSR", value: `${(signals.avgDsr * 100).toFixed(1)}%` },
      { label: "高频风险标签", value: riskSummary(signals) },
      { label: "主要驱动", value: driverSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比净资产接近但 DSR 明显不同的学生。"),
      "挑一位欠得不算多却已经很吃力的学生来讲。"
    ],
    teacherQuestions: [
      "欠得多和压力大，是一回事吗？",
      "为什么有的人负债不高，但已经很危险？",
      "你现在的收入，扛得住多少固定还款？"
    ],
    followUpActions: ["先解释 DSR 再讲情绪感受。", "让学生区分债务规模和债务压力。"]
  });
}

function buildMinimumPaymentBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("minimum_payment_trap", {
    headline: "本轮主讲：最低还款是最容易被低估的财务陷阱",
    summary: "最低还款会降低短期痛感，却会持续吞噬未来现金流。现在没爆雷，不代表结构是安全的。",
    priority: "high",
    topicTags: ["最低还款", "利息滚动", "债务陷阱"],
    evidence: [
      { label: "平均 DSR", value: `${(signals.avgDsr * 100).toFixed(1)}%` },
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比只维持最低还款和主动压缩消费还债的学生。"),
      "优先挑一位表面没违约但现金流持续被吃掉的学生。"
    ],
    teacherQuestions: [
      "为什么现在没爆雷，不代表未来没风险？",
      "最低还款为什么会锁死未来选择权？",
      "如果收入暂时不变，最先应该调整什么？"
    ],
    followUpActions: ["提醒学生关注最低还款是否已变成固定支出。", "把利息和未来收入占用一起讲。"]
  });
}

function buildDebtBoundaryBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("good_vs_bad_debt", {
    headline: "本轮主讲：借钱不是重点，借来做什么才是重点",
    summary: "借款本身不是绝对坏事，关键是用途、边界和还款能力是否匹配。",
    priority: "medium",
    topicTags: ["借款边界", "好债务", "坏债务"],
    evidence: [
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "平均 DSR", value: `${(signals.avgDsr * 100).toFixed(1)}%` },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比为成长投入借钱和为冲动消费借钱的学生。"),
      "挑一位借款后结构更稳的学生，再对比一位只是延后问题的学生。"
    ],
    teacherQuestions: [
      "什么样的借钱是在给未来加杠杆？",
      "什么样的借钱只是拖延问题？",
      "你怎么判断这笔钱值不值得借？"
    ],
    followUpActions: ["把借款用途和未来回报一起讲。", "提醒学生借款能力不等于还款能力。"]
  });
}

function buildImpulseSpendingBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("impulse_spending", {
    headline: "本轮主讲：很多财务问题，根子是行为问题",
    summary: "很多消费问题不是不会算账，而是没管住情绪。面子、冲动和情绪释放，往往会挤掉真正重要的预算。",
    priority: "medium",
    topicTags: ["冲动消费", "面子消费", "情绪消费"],
    evidence: [
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "骰子主题", value: diceSummary(signals) },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比高消费但回报不明显的学生和更克制的学生。"),
      "挑一位受社交或体验消费影响明显的学生来讲。"
    ],
    teacherQuestions: [
      "你买的是商品，还是情绪安慰？",
      "什么消费是为了今天开心，什么是为了未来更好？",
      "你有没有给自己设置冷静期？"
    ],
    followUpActions: ["提醒学生用冷静期对抗冲动决策。", "把消费行为和长期结果联系起来。"]
  });
}

function buildQualityGrowthBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("quality_vs_growth_spending", {
    headline: "本轮主讲：有些支出不是消费，而是在买未来",
    summary: "课程、设备、保障、储备等投入，和纯享乐消费并不属于同一种钱。关键是看它是否在增强未来能力和稳定性。",
    priority: "medium",
    topicTags: ["生活品质", "成长投入", "人力资本"],
    evidence: [
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "平均分", value: signals.avgScore.toFixed(1) },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比享乐型投入高和成长型投入高的学生。"),
      "优先找一位做了学习或准备投入的学生来讲。"
    ],
    teacherQuestions: [
      "哪些花钱是在买未来？",
      "什么钱看似是支出，其实是在投资自己？",
      "预算有限时，你先保生活品质还是先保成长能力？"
    ],
    followUpActions: ["把消费、保障、成长、投资四类资金用途拆开讲。", "提醒学生观察回报周期的不同。"]
  });
}

function buildCarHomeBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("car_home_cashflow", {
    headline: "本轮主讲：购置不是结束，而是长期支出的开始",
    summary: "房车在报表上可能是资产，在现金流上却可能先变成压力。首付只是开始，月供和维护费才是长期考验。",
    priority: "high",
    topicTags: ["房车", "持有成本", "现金流"],
    evidence: [
      { label: "有车人数", value: `${signals.vehiclesOwned} 人` },
      { label: "有房人数", value: `${signals.homesOwned} 人` },
      { label: "固定成本锁定人数", value: `${signals.fixedCostLockedCount} 人` }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比购置后现金流变紧和保持流动性的学生。"),
      "重点讲一位买了资产但预算弹性明显下降的学生。"
    ],
    teacherQuestions: [
      "买得起首付，等于养得起吗？",
      "为什么资产增加了，现金流反而更差？",
      "房车什么时候先表现为资产，什么时候先表现为负担？"
    ],
    followUpActions: ["提醒学生先算月供和维护费，再决定购置。", "把持有成本放到预算表里讲清楚。"]
  });
}

function buildFamilyLifecycleBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("family_lifecycle_cost", {
    headline: "本轮主讲：家庭责任会重写你的预算结构",
    summary: "订婚、结婚、家庭支持支出不是一次性的热闹，而是会持续改写预算结构和可投资空间。",
    priority: "medium",
    topicTags: ["家庭阶段", "长期义务", "预算重构"],
    evidence: [
      { label: "订婚 / 已婚", value: `${signals.engagedCount} / ${signals.marriedCount}` },
      { label: "固定成本锁定人数", value: `${signals.fixedCostLockedCount} 人` },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比单身和进入家庭阶段的学生。"),
      "挑一位收入不低但家庭责任明显抬升的学生来讲。"
    ],
    teacherQuestions: [
      "为什么人生阶段变化会影响投资能力？",
      "家庭责任最容易在哪些地方被低估？",
      "你做预算时，会不会把家庭义务单独列出来？"
    ],
    followUpActions: ["提醒学生把家庭支持支出显性化。", "把人生阶段变化放回现金流和固定成本去讲。"]
  });
}

function buildAllocationBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("asset_allocation", {
    headline: "本轮主讲：资产不是越多越好，结构对了才有意义",
    summary: "资产配置不是猜最赚钱的，而是安排不同资产的职责：安全、缓冲、增长和少量试错。",
    priority: "medium",
    topicTags: ["资产配置", "分散", "波动"],
    evidence: [
      { label: "高风险暴露人数", value: `${signals.highRiskExposureCount} 人` },
      { label: "主要驱动", value: driverSummary(signals) },
      { label: "高频风险标签", value: riskSummary(signals) }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比集中押注和分散配置的学生。"),
      "找一位全现金型和一位高波动型学生做结构对比。"
    ],
    teacherQuestions: [
      "为什么不能只买自己最看好的资产？",
      "现金在资产配置里到底有没有价值？",
      "你的配置能不能承受下一轮反向波动？"
    ],
    followUpActions: ["把现金类、稳健类、权益类、高风险类的职责拆开讲。", "提醒学生看结构，不只看一轮收益。"]
  });
}

function buildFreedomBriefing(input: TeachingDashboardInput, signals: TeachingSignals) {
  return buildBriefing("financial_freedom", {
    headline: "本轮主讲：财富自由是结构结果，不是运气结果",
    summary: "财富自由不是突然暴富，而是让必要支出越来越不依赖单一工资。它来自现金流纪律、债务控制、配置结构和长期准备。",
    priority: "low",
    topicTags: ["长期规划", "财富自由", "结构思维"],
    evidence: [
      { label: "平均分", value: signals.avgScore.toFixed(1) },
      { label: "平均净资产", value: currency(signals.avgNetWorth) },
      { label: "平均应急金月数", value: `${signals.avgEmergencyMonths.toFixed(1)} 月` }
    ],
    compareSuggestions: [
      compareSuggestion(input, "对比高波动高运气型和结构更稳的学生。"),
      "适合挑一位短期结果亮眼但结构脆弱的学生做提醒。"
    ],
    teacherQuestions: [
      "如果没有下一次好运，你现在的结构能不能活下去？",
      "什么叫用系统赚钱，而不是靠运气赚钱？",
      "你现在最该补的，是收益、纪律、保障，还是流动性？"
    ],
    followUpActions: ["把课程前面讲过的现金流、债务、保障、配置重新串起来。", "引导学生用长期结构视角复盘自己。"]
  });
}

const topicBuilders: Record<TeachingTopic, (input: TeachingDashboardInput, signals: TeachingSignals) => TeacherBriefing> = {
  income_vs_cash: buildIncomeVsCashBriefing,
  budget_boundary: buildBudgetBoundaryBriefing,
  fixed_cost_pressure: buildFixedCostBriefing,
  emergency_buffer: buildEmergencyBriefing,
  insurance_protection: buildInsuranceBriefing,
  risk_resilience: buildResilienceBriefing,
  debt_ratio_dsr: buildDebtRatioBriefing,
  minimum_payment_trap: buildMinimumPaymentBriefing,
  good_vs_bad_debt: buildDebtBoundaryBriefing,
  impulse_spending: buildImpulseSpendingBriefing,
  quality_vs_growth_spending: buildQualityGrowthBriefing,
  car_home_cashflow: buildCarHomeBriefing,
  family_lifecycle_cost: buildFamilyLifecycleBriefing,
  asset_allocation: buildAllocationBriefing,
  financial_freedom: buildFreedomBriefing
};

function scoreTopics(signals: TeachingSignals): TopicScore[] {
  const scores: TopicScore[] = [
    {
      topic: "income_vs_cash",
      score: (signals.hasCashflowPressure ? 80 : 25) + (signals.avgEmergencyMonths < 1 ? 10 : 0),
      priority: "high"
    },
    {
      topic: "budget_boundary",
      score: (signals.topDriverKeys.some((item) => ["可选消费", "consume"].includes(item)) ? 75 : 30) + (signals.hasCashflowPressure ? 10 : 0),
      priority: "medium"
    },
    {
      topic: "fixed_cost_pressure",
      score: (signals.hasFixedCostPressure ? 78 : 24) + signals.fixedCostLockedCount * 2,
      priority: "high"
    },
    {
      topic: "emergency_buffer",
      score: (signals.hasEmergencyPressure ? 82 : 28) + (signals.amplifiedHits > 0 ? 8 : 0),
      priority: "high"
    },
    {
      topic: "insurance_protection",
      score: (signals.hasProtectionGap ? 74 : 26) + (signals.amplifiedHits > signals.supportiveHits ? 8 : 0),
      priority: "medium"
    },
    {
      topic: "risk_resilience",
      score: (signals.hasProtectionGap ? 70 : 24) + (signals.hasEmergencyPressure ? 8 : 0) + (signals.hasAllocationPressure ? 6 : 0),
      priority: "medium"
    },
    {
      topic: "debt_ratio_dsr",
      score: (signals.hasDebtPressure ? 84 : 26) + (signals.avgDsr >= 0.25 ? 10 : 0),
      priority: "high"
    },
    {
      topic: "minimum_payment_trap",
      score: (signals.topDriverKeys.some((item) => ["最低还款", "minDebtPay"].includes(item)) ? 86 : 22) + (signals.hasDebtPressure ? 8 : 0),
      priority: "high"
    },
    {
      topic: "good_vs_bad_debt",
      score: (signals.hasDebtPressure ? 68 : 24) + (signals.hasCashflowPressure ? 6 : 0),
      priority: "medium"
    },
    {
      topic: "impulse_spending",
      score: (signals.topDriverKeys.some((item) => ["可选消费", "consume"].includes(item)) ? 72 : 24) + (signals.topDiceCategories.some((item) => ["社交与人情", "消费决策", "social", "consume"].includes(item)) ? 8 : 0),
      priority: "medium"
    },
    {
      topic: "quality_vs_growth_spending",
      score: 34 + (signals.avgScore > 0 ? 4 : 0),
      priority: "medium"
    },
    {
      topic: "car_home_cashflow",
      score: (signals.vehiclesOwned + signals.homesOwned > 0 ? 80 : 20) + signals.fixedCostLockedCount * 2,
      priority: "high"
    },
    {
      topic: "family_lifecycle_cost",
      score: (signals.engagedCount + signals.marriedCount > 0 ? 76 : 20) + (signals.hasFixedCostPressure ? 8 : 0),
      priority: "medium"
    },
    {
      topic: "asset_allocation",
      score: (signals.hasAllocationPressure ? 78 : 26) + signals.highRiskExposureCount * 2,
      priority: "medium"
    },
    {
      topic: "financial_freedom",
      score: 30 + (signals.avgScore > 0 ? 6 : 0) + (signals.hasDebtPressure ? 2 : 0),
      priority: "low"
    }
  ];

  return scores.sort((left, right) => right.score - left.score);
}

export function buildTeacherBriefing(
  input: TeachingDashboardInput,
  options?: {
    preferredTopic?: TeachingTopic | null;
  }
): TeacherBriefing {
  const signals = buildTeachingSignals(input);
  const preferredTopic = options?.preferredTopic ?? null;
  const normalizedPreferredTopic =
    preferredTopic && validTeachingTopics.has(preferredTopic) ? preferredTopic : null;
  const topic = normalizedPreferredTopic ?? scoreTopics(signals)[0]?.topic ?? "financial_freedom";
  return topicBuilders[topic](input, signals);
}
