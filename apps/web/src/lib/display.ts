const roleLabels: Record<string, string> = {
  R1: "基础岗",
  R2: "服务岗",
  R3: "销售岗",
  R4: "技术岗",
  R5: "运营岗",
  R6: "白领岗",
  R7: "高收入岗"
};

const roundStatusLabels: Record<string, string> = {
  draft: "待开放",
  open: "开放中",
  locked: "已锁定",
  settled: "已结算",
  finished: "已完成",
  archived: "已归档",
  closed: "已关闭"
};

const familyStageLabels: Record<string, string> = {
  single: "单身",
  engaged: "订婚",
  married: "已婚"
};

const diceCategoryLabels: Record<string, string> = {
  health: "健康与医疗",
  housing: "家庭与居住",
  consumption: "消费与设备",
  income: "兼职与创收",
  social: "社交与人情",
  safety: "安全与反诈"
};

const driverLabels: Record<string, string> = {
  "Living Cost": "基础生活费",
  "Debt Service": "债务支出",
  "Optional Spend": "可选消费",
  "Investment PnL": "投资盈亏",
  "Dice Event": "个人骰子事件",
  mandatoryLiving: "基础生活费",
  minDebtPay: "最低还款",
  loanInterest: "债务利息",
  consume: "可选消费",
  investmentPnl: "投资盈亏",
  dice: "个人骰子事件"
};

const riskTagLabels: Record<string, string> = {
  "High Debt": "高负债",
  "Low Emergency Fund": "应急金不足",
  "High Risk Exposure": "高风险暴露",
  "Debt Service Pressure": "还款承压",
  "Delinquent Debt": "债务逾期",
  "Debt Default Risk": "违约风险",
  "Fixed Cost Lock": "固定成本锁定",
  "Family Support Strain": "家庭支出承压",
  "Property Cash Lock": "房产现金锁定"
};

const debtPoolLabels: Record<string, string> = {
  "D-consumer": "消费贷",
  "D-device": "设备分期",
  "D-bridge": "应急过桥债",
  "D-medical": "医疗垫付债",
  "D-social": "家庭人情垫付债",
  consumer: "消费贷",
  device: "设备分期",
  bridge: "应急过桥债",
  medical: "医疗垫付债",
  social: "家庭人情垫付债"
};

const debtStatusLabels: Record<string, string> = {
  ACTIVE: "正常",
  DELINQUENT: "逾期",
  DEFAULT: "违约",
  CLEAR: "已结清"
};

type MacroLocalization = {
  title: string;
  transmissionPath: string;
  teachingPoints: string[];
};

const macroEventLabels: Record<number, MacroLocalization> = {
  1: { title: "AI 热潮带动风险偏好上升", transmissionPath: "创新利好 -> 股票动能增强 -> 上涨空间与追高诱惑同时放大", teachingPoints: ["风险偏好", "配置纪律", "分散投资"] },
  2: { title: "城市居住成本普遍上升", transmissionPath: "租金压力上升 -> 必需支出提高 -> 应急金安全垫变短", teachingPoints: ["住房压力", "现金缓冲", "固定成本"] },
  3: { title: "利率企稳，债券资产回暖", transmissionPath: "利率稳定 -> 债券价格修复 -> 稳健型配置收益更平滑", teachingPoints: ["利率", "久期", "防御资产"] },
  4: { title: "平台裁员压低成长预期", transmissionPath: "就业市场承压 -> 工资信心下降 -> 流动性价值提升", teachingPoints: ["收入冲击", "人力资本", "储备规划"] },
  5: { title: "出口需求回暖", transmissionPath: "外需增强 -> 企业景气回升 -> 成长资产上行弹性增加", teachingPoints: ["周期复苏", "职业机会", "时点风险"] },
  6: { title: "消费者信心转弱", transmissionPath: "需求偏弱 -> 盈利承压 -> 高杠杆家庭现金流更脆弱", teachingPoints: ["消费放缓", "偿债能力", "压力测试"] },
  7: { title: "虚拟币投机情绪再度升温", transmissionPath: "高风险叙事传播 -> 追涨行为增加 -> 收益分化显著放大", teachingPoints: ["投机情绪", "高波动", "反诈意识"] },
  8: { title: "水电与医疗价格上涨", transmissionPath: "基础价格上行 -> 必需支出抬升 -> 容错空间变小", teachingPoints: ["通胀", "生活成本韧性", "保险价值"] },
  9: { title: "医疗改革降低常规诊疗成本", transmissionPath: "报销改善 -> 常规治疗负担减轻 -> 健康规划更有价值", teachingPoints: ["保险", "费用规划", "健康韧性"] },
  10: { title: "副业税务监管收紧", transmissionPath: "申报要求提高 -> 可支配收入下降 -> 税务准备更重要", teachingPoints: ["税务准备", "现金纪律", "收入质量"] },
  11: { title: "AI 硬件拥挤交易出现回调", transmissionPath: "高估值板块回落 -> 科技股先跌 -> 高 Beta 资产承压", teachingPoints: ["估值风险", "集中度", "回撤管理"] },
  12: { title: "制造业升级带动技能岗位需求", transmissionPath: "产业投资增加 -> 技能型岗位更吃香 -> 学习投入转化为收入弹性", teachingPoints: ["人力资本", "技能溢价", "职业选择"] },
  13: { title: "假日旅游热带动服务需求", transmissionPath: "出行旺盛 -> 服务业收入改善 -> 生活方式消费也容易增加", teachingPoints: ["季节性", "服务收入", "消费诱惑"] },
  14: { title: "严打诈骗后平台炒作降温", transmissionPath: "监管清理 -> 热点题材降温 -> 谨慎行为相对更占优", teachingPoints: ["反诈意识", "平台风险", "风险筛选"] },
  15: { title: "青年技能提升补贴扩大", transmissionPath: "培训更便宜 -> 学习门槛下降 -> 人力资本回报提高", teachingPoints: ["教育回报", "技能投资", "职业杠杆"] },
  16: { title: "能源价格跃升，通勤成本抬高", transmissionPath: "燃料与物流变贵 -> 日常预算更紧 -> 养车压力上升", teachingPoints: ["成本传导", "车辆支出", "预算弹性"] },
  17: { title: "远程办公需求回升，数字工具受益", transmissionPath: "分布式办公增加 -> 软件服务更受益 -> 工具支出和储蓄竞争", teachingPoints: ["远程办公", "软件需求", "生产力工具"] },
  18: { title: "年轻借款人信贷标准收紧", transmissionPath: "放贷更谨慎 -> 融资更难 -> 流动性与负债纪律更重要", teachingPoints: ["信贷可得性", "借款能力", "现金储备"] },
  19: { title: "公共卫生事件提升保险意识", transmissionPath: "新闻风险上升 -> 家庭更重视保障 -> 保险与应急金价值提高", teachingPoints: ["风险转移", "保险", "准备度"] },
  20: { title: "平台算法偏向教育类创作者", transmissionPath: "内容分发变化 -> 教育内容曝光更高 -> 学习与创作投入回报增强", teachingPoints: ["创作者经济", "技能复制", "副业收入"] },
  21: { title: "汇率走弱抬高进口成本", transmissionPath: "货币走弱 -> 进口品更贵 -> 设备与部分必需品更难负担", teachingPoints: ["汇率冲击", "输入性通胀", "价格传导"] },
  22: { title: "公共交通升级缓解通勤压力", transmissionPath: "出行效率提升 -> 交通摩擦下降 -> 预算重新获得喘息空间", teachingPoints: ["出行效率", "成本缓解", "固定支出弹性"] },
  23: { title: "零售补贴战刺激短期消费", transmissionPath: "优惠信息增多 -> 冲动消费更诱人 -> 自控力受到考验", teachingPoints: ["消费诱惑", "预算泄漏", "自律"] },
  24: { title: "养老话题升温，长期规划被重视", transmissionPath: "未来养老压力更清晰 -> 长期规划更重要 -> 当下支出被重新审视", teachingPoints: ["养老", "长期规划", "未来现金流"] },
  25: { title: "旅游平台价格战让休闲消费更诱人", transmissionPath: "休闲出行变便宜 -> 消费欲望上升 -> 预算与目标冲突更明显", teachingPoints: ["价格战", "消费诱惑", "旅行需求"] },
  26: { title: "云软件订阅在工作中更加普及", transmissionPath: "数字工具更必需 -> 生产力提升 -> 固定订阅支出也被常态化", teachingPoints: ["工具化办公", "生产力", "软件依赖"] },
  27: { title: "医院推广预防筛查套餐", transmissionPath: "预防性支出变多 -> 小额计划支出替代部分大额意外支出", teachingPoints: ["预防", "健康管理", "小钱换大风险"] },
  28: { title: "大型平台发起反诈宣传", transmissionPath: "识骗教育增加 -> 诈骗更容易识别 -> 做好准备的人损失更少", teachingPoints: ["反诈", "网络安全", "行为护栏"] },
  29: { title: "出口制造企业加速自动化招聘", transmissionPath: "企业拥抱自动化 -> 适应型人才更吃香 -> 学习回报更快体现", teachingPoints: ["自动化", "再培训", "职业韧性"] },
  30: { title: "首套房按揭政策放松", transmissionPath: "买房门槛降低 -> 住房看起来更有吸引力 -> 固定成本仍会锁住流动性", teachingPoints: ["住房可得性", "杠杆", "现金锁定"] },
  31: { title: "高端消费情绪降温", transmissionPath: "面子型消费走弱 -> 高端品牌承压 -> 生活方式膨胀显得更不合理", teachingPoints: ["信心", "身份消费", "收入质量"] },
  32: { title: "债券基金重新吸引稳健资金", transmissionPath: "风险偏好回落 -> 防御型资产更受关注 -> 稳健配置价值回归", teachingPoints: ["防御配置", "收益稳定", "避险资产"] },
  33: { title: "社交电商创作者转化率提升", transmissionPath: "流量更容易转化 -> 创作者副业收入改善 -> 但纪律仍然重要", teachingPoints: ["内容变现", "注意力经济", "副业收入"] },
  34: { title: "购物季前进口硬件价格上涨", transmissionPath: "电子设备更贵 -> 设备损坏代价更大 -> 维护和换机时点更重要", teachingPoints: ["设备通胀", "更换时机", "计划性支出"] },
  35: { title: "通勤铁路扩容缓解日常压力", transmissionPath: "通勤更快 -> 出行摩擦下降 -> 车辆压力部分减轻", teachingPoints: ["通勤", "成本缓解", "出行选择"] },
  36: { title: "融资环境改善，创业招聘回暖", transmissionPath: "融资回暖 -> 招聘恢复 -> 增长预期和职业信心回升", teachingPoints: ["职业机会", "成长资产", "收入弹性"] },
  37: { title: "券商保证金风险提示压低杠杆情绪", transmissionPath: "风险警示增多 -> 杠杆投机降温 -> 保本思维相对更重要", teachingPoints: ["杠杆", "回撤控制", "投机纪律"] },
  38: { title: "自由职业报税季暴露记账问题", transmissionPath: "报税压力到来 -> 记录不清的人更被动 -> 税务准备更有价值", teachingPoints: ["报税管理", "现金规划", "记录纪律"] },
  39: { title: "社区健康补贴鼓励早诊早治", transmissionPath: "基础补贴降低看病门槛 -> 预防更容易 -> 应急金可以撑更久", teachingPoints: ["公共健康", "计划性治疗", "韧性"] },
  40: { title: "养老讲座让复利变得更紧迫", transmissionPath: "未来需求更具体 -> 当下取舍更清晰 -> 长期储蓄纪律增强", teachingPoints: ["复利", "养老意识", "延迟满足"] }
};

type DiceLocalization = {
  title: string;
  knowledgePoint: string;
  teacherNote: string;
};

const diceCardLabels: Record<string, DiceLocalization> = {
  "D1-01": { title: "慢性病复查", knowledgePoint: "医疗冲击属于低频高影响风险，应急金和保障都重要。", teacherNote: "可讲应急金与保险的双重缓冲。" },
  "D1-02": { title: "流感请假", knowledgePoint: "健康问题会同时影响收入和支出。", teacherNote: "用来说明为什么流动性重要。" },
  "D1-03": { title: "牙齿治疗", knowledgePoint: "小病拖延往往会在以后变成更大的支出。", teacherNote: "可对比预防支出与事后抢救支出。" },
  "D1-04": { title: "意外扭伤治疗", knowledgePoint: "意外险就是为低概率但令人心疼的损失准备的。", teacherNote: "适合对比健康险和意外险。" },
  "D1-05": { title: "心理健康支持", knowledgePoint: "心理健康同样会影响财务判断和风险承受力。", teacherNote: "可讲压力、冲动决策和风险偏好。" },
  "D1-06": { title: "家人临时看病求助", knowledgePoint: "家庭责任是现实理财的一部分。", teacherNote: "可讲照护义务、家庭支持和自我之外的应急准备。" },
  "D2-01": { title: "热水器坏了", knowledgePoint: "住房支出不只有房租，还有维护和突发维修。", teacherNote: "适合讲固定成本压力。" },
  "D2-02": { title: "临时搬家", knowledgePoint: "搬家类冲击是典型的一次性现金流打击。", teacherNote: "可对比应急金与过桥债。" },
  "D2-03": { title: "空调维修", knowledgePoint: "很多重要支出不是月月来，但迟早会来。", teacherNote: "适合讲维护预算。" },
  "D2-04": { title: "家里希望你多分担一点", knowledgePoint: "家庭反向支持是青年阶段常见现金流变量。", teacherNote: "可讲同一事件为什么对不同收入人群打击不同。" },
  "D2-05": { title: "物业/停车罚款", knowledgePoint: "小的不规范行为也会形成真实摩擦成本。", teacherNote: "适合讲可避免损失。" },
  "D2-06": { title: "房租补差", knowledgePoint: "有些冲击不是一次性，而是会抬高未来成本。", teacherNote: "可以连接固定成本锁定与应急金月数。" },
  "D3-01": { title: "手机碎屏维修", knowledgePoint: "设备损坏是典型的小额高频意外。", teacherNote: "适合区分必要维修和冲动升级。" },
  "D3-02": { title: "电脑故障", knowledgePoint: "有些支出看似消费，其实是在保住赚钱能力。", teacherNote: "可连接设备准备与副业收入。" },
  "D3-03": { title: "电子配件遗失", knowledgePoint: "补买不一定是虚荣消费，也可能是必要替换。", teacherNote: "适合讲替换和升级的区别。" },
  "D3-04": { title: "交通罚款", knowledgePoint: "行为失误会变成看似小却持续累积的成本。", teacherNote: "如果学生有车，这张卡更有教学价值。" },
  "D3-05": { title: "冲动购物后悔", knowledgePoint: "情绪消费往往在钱花出去之后才被看清。", teacherNote: "适合讲冷静期和消费纪律。" },
  "D3-06": { title: "软件工具续费", knowledgePoint: "部分订阅支出是在保护未来的收入能力。", teacherNote: "可连接工具、生产力和副业。" },
  "D4-01": { title: "短视频激励到账", knowledgePoint: "非工资收入往往来自前期投入和实验。", teacherNote: "可讲人力资本和收益延迟兑现。" },
  "D4-02": { title: "同学介绍的小单子", knowledgePoint: "副业收入受时间和注意力限制，不只是看有没有机会。", teacherNote: "可对比技能型收入和投机收益。" },
  "D4-03": { title: "奖学金 / 比赛奖金", knowledgePoint: "学习投入有时会以延迟现金回报的形式体现。", teacherNote: "适合回扣学习模块。" },
  "D4-04": { title: "家教机会", knowledgePoint: "稳定的小额收入往往比华而不实的高风险机会更有价值。", teacherNote: "可讲收入叠加。" },
  "D4-05": { title: "接单翻车", knowledgePoint: "副业并不稳定，不能把它当成百分百确定收入。", teacherNote: "适合讲自营收入的波动性。" },
  "D4-06": { title: "实习补贴", knowledgePoint: "职业经验会同时改善当下和未来的收入能力。", teacherNote: "适合比较工资成长与市场收益。" },
  "D5-01": { title: "婚礼随礼", knowledgePoint: "人情支出往往可预见，却最容易被低估。", teacherNote: "适合讲预算边界。" },
  "D5-02": { title: "同学聚会超支", knowledgePoint: "娱乐消费不是不能有，但必须服从整体规划。", teacherNote: "适合对比有无债务压力的学生。" },
  "D5-03": { title: "婚事讨论开始", knowledgePoint: "人生大支出往往不是突然到来，而是会提前进入规划。", teacherNote: "可连接订婚、婚礼和家庭支持模块。" },
  "D5-04": { title: "纪念日支出", knowledgePoint: "情感支出同样要与长期目标做平衡。", teacherNote: "适合讲计划消费与反应式消费。" },
  "D5-05": { title: "亲戚短期周转", knowledgePoint: "给熟人借钱或支持亲属从来都不是零风险。", teacherNote: "适合讲软性义务与储备规划。" },
  "D5-06": { title: "高消费社交局", knowledgePoint: "高端社交不自动等于可回收的投资。", teacherNote: "适合区分面子成本和生产性投资。" },
  "D6-01": { title: "刷单骗局", knowledgePoint: "低门槛高回报的兼职承诺，往往是骗局。", teacherNote: "可连到网络安全和行为纪律。" },
  "D6-02": { title: "跟单炒币陷阱", knowledgePoint: "别人晒收益截图，不等于你得到的是分析。", teacherNote: "适合连接高风险暴露和虚拟币叙事。" },
  "D6-03": { title: "假客服退款", knowledgePoint: "防诈骗本身就是一项理财能力。", teacherNote: "适合和网络安全保障、安全设置一起讲。" },
  "D6-04": { title: "银行卡异常扣款", knowledgePoint: "支付安全是财务健康的一部分，不只是技术问题。", teacherNote: "适合讲安全设置和网络保障。" },
  "D6-05": { title: "保本高收益广告", knowledgePoint: "凡是同时承诺保本和高收益，都值得警惕。", teacherNote: "可讲筛选金融产品和反诈意识。" },
  "D6-06": { title: "熟人稳赚项目", knowledgePoint: "熟人关系不会降低投资风险。", teacherNote: "适合讲情感诈骗和社会证明偏差。" }
};

export function formatRoleLabel(roleId?: string) {
  return roleLabels[roleId ?? ""] ?? roleId ?? "--";
}

export function formatRoundStatus(status?: string) {
  return roundStatusLabels[status ?? ""] ?? status ?? "--";
}

export function formatFamilyStage(stage?: string) {
  return familyStageLabels[stage ?? ""] ?? stage ?? "--";
}

export function formatDiceCategory(category?: string) {
  return diceCategoryLabels[category ?? ""] ?? category ?? "--";
}

export function formatDriverLabel(label?: string) {
  return driverLabels[label ?? ""] ?? label ?? "--";
}

export function formatRiskTag(tag?: string) {
  return riskTagLabels[tag ?? ""] ?? tag ?? "--";
}

export function formatDebtPool(value?: string) {
  return debtPoolLabels[value ?? ""] ?? value ?? "--";
}

export function formatDebtStatus(status?: string) {
  return debtStatusLabels[status ?? ""] ?? status ?? "--";
}

export function localizeMacroEvent(
  event?: { eventId?: number; title?: string; transmissionPath?: string; teachingPoints?: string[] } | null
) {
  if (!event || !event.eventId) return event ?? null;
  const localized = macroEventLabels[event.eventId];
  if (!localized) return event;
  return {
    ...event,
    title: localized.title,
    transmissionPath: localized.transmissionPath,
    teachingPoints: localized.teachingPoints
  };
}

export function localizeDiceCard(
  card?: { id?: string; title?: string; knowledgePoint?: string; teacherNote?: string } | null
) {
  if (!card || !card.id) return card ?? null;
  const localized = diceCardLabels[card.id];
  if (!localized) return card;
  return {
    ...card,
    title: localized.title,
    knowledgePoint: localized.knowledgePoint,
    teacherNote: localized.teacherNote
  };
}

const assetLabels: Record<string, string> = {
  A1: "银行存款",
  A2: "银行理财",
  A3: "货币基金",
  A4: "债券基金",
  A5: "股票基金",
  A6: "股票",
  A7: "虚拟币",
  A8: "期权",
  A9: "高风险投机",
  cash: "现金",
  vehicle: "车辆",
  house: "房产"
};

const cashFlowLabels: Record<string, string> = {
  salary: "工资入账",
  consume: "消费支出",
  investmentPnl: "投资盈亏",
  dice: "个人事件影响",
  fees: "交易手续费",
  repay: "主动还款",
  borrow: "主动借款",
  bridgeDebt: "自动垫付借款",
  bridgeShortfall: "现金缺口垫付",
  minDebtPay: "最低还款",
  loanInterest: "贷款利息",
  gamblePnl: "高风险结果",
  vehicleDownPayment: "购车首付",
  vehicleCarryCost: "车辆固定成本",
  houseDownPayment: "购房首付",
  houseCarryCost: "房产固定成本",
  familySetupCost: "关系阶段一次性支出",
  familyCarryCost: "家庭长期支出"
};

const modifierLabels: Record<string, string> = {
  "Owning a home reduced rent-style housing shocks, although maintenance pressure remains.":
    "已持有房产，住房类冲击有所缓和，但房屋维护压力仍在。",
  "Recent learning investment improved the payoff from the income opportunity.":
    "近期学习投入提升了这次收入机会的回报。",
  "Device maintenance preparation reduced the cost of the equipment shock.":
    "提前做了设备维护准备，降低了设备故障冲击。",
  "Owning a vehicle increased exposure to transport fines and related friction costs.":
    "持有车辆提高了交通罚款和通勤摩擦成本。",
  "Vehicle ownership plus renting tightened the housing shock because fixed costs were already high.":
    "已有车辆且仍在租房，固定成本偏高，住房冲击更明显。",
  "Low emergency buffer leaves little protection against medical costs.": "应急金偏低，面对医疗支出时缓冲不足。"
};

export function formatAssetLabel(assetId?: string) {
  return assetLabels[assetId ?? ""] ?? assetId ?? "--";
}

export function formatCashFlowLabel(key?: string) {
  return cashFlowLabels[key ?? ""] ?? key ?? "--";
}

export function formatModifierLabel(value?: string) {
  return modifierLabels[value ?? ""] ?? value ?? "--";
}

export function formatTeacherCue(value?: string) {
  if (!value) {
    return value ?? "--";
  }

  return value
    .replace("Lead with ", "教师讲解先抓住：")
    .replace("preparedness softened more shocks than it amplified, but watch ", "本轮准备动作对冲了更多冲击，但要重点提醒：")
    .replace("stress amplifiers outweighed protection this round, especially around ", "本轮放大因素多于保护因素，尤其要提醒：")
    .replace("Fixed commitments started to dominate outcomes; compare students with similar income but very different locked costs.", "固定成本开始主导结果，建议对比收入接近但固定支出差异很大的学生。")
    .replace("Asset ownership is beginning to reshape cashflow; emphasize how carrying costs change resilience before returns appear.", "资产持有开始重塑现金流，建议强调：收益还没兑现前，持有成本已经先影响抗风险能力。")
    .replace("Family lifecycle choices are now visible; discuss how relationship milestones turn into recurring cash obligations.", "家庭生命周期选择开始显现，建议讲清楚关系阶段如何转化为持续现金流责任。")
    .replace("Lifecycle load stayed light; the round was driven more by decisions and shocks than by fixed commitments.", "本轮生命周期负担较轻，结果更多由消费、投资与事件冲击决定。");
}

export function formatSettlementSummary(value?: string) {
  if (!value) {
    return value ?? "--";
  }

  return value
    .replace(/^Budget pressure came from living cost (.+) and debt pay (.+)\.$/, "本轮预算压力主要来自：基础生活费 $1，最低还款 $2。")
    .replace(/^Fixed cost ratio ended at (.+)\.$/, "本轮固定成本占收入比为 $1。")
    .replace(/^Vehicle cash lock this round was down payment (.+) and carrying cost (.+)\.$/, "车辆本轮锁定现金流：首付 $1，持续成本 $2。")
    .replace(/^No vehicle carrying cost applied this round\.$/, "本轮没有新增车辆固定成本。")
    .replace(/^Housing cash lock this round was down payment (.+) and carrying cost (.+)\.$/, "房产本轮锁定现金流：首付 $1，持续成本 $2。")
    .replace(/^No housing carrying cost applied this round\.$/, "本轮没有新增房产固定成本。")
    .replace(/^Family lifecycle cash cost was setup (.+) and monthly support (.+)\.$/, "家庭阶段带来的现金支出：一次性支出 $1，每轮家庭支持 $2。")
    .replace(/^Family lifecycle cash cost was engagement setup (.+); no monthly family support yet\.$/, "当前进入订婚阶段：一次性准备支出 $1，尚未形成每轮家庭支持。")
    .replace(/^No family lifecycle cash cost applied this round\.$/, "本轮没有新增家庭生命周期支出。")
    .replace(/^Personal event: (.+)\.$/, "本轮个人事件：$1。")
    .replace(/^Cash ended below zero, so (.+) increased by (.+)\.$/, "本轮现金跌破 0，因此自动垫付债务“$1”新增 $2。")
    .replace(/^Cash stayed above zero, so no emergency bridge debt was triggered\.$/, "本轮现金未跌破 0，没有触发自动垫付借款。")
    .replace(/^Gamble outcome: (.+) ended with (.+) and pnl (.+)\.$/, "高风险结果：$1，结果为 $2，盈亏 $3。")
    .replace(/^No gambling position was taken this round\.$/, "本轮没有进行高风险投机。")
    .replace(/^At least one debt reached DEFAULT because minimum payment was missed repeatedly\.$/, "至少有一笔债务因为连续未达最低还款，进入违约状态。")
    .replace(/^A debt became DELINQUENT because this round payment did not cover the minimum requirement\.$/, "有债务因本轮未覆盖最低还款，进入逾期状态。")
    .replace(/^All active debts met the current minimum payment threshold\.$/, "所有活跃债务都满足了本轮最低还款要求。");
}
