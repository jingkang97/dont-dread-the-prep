/** Timeline, stool/contact, food-system, and rule-title copy. Hospital source lines stay in English. */

export const CLINICAL_EN = {
  'ev.dietStart': 'Low-residue diet starts ({days} days before)',
  'ev.dietStartBody':
    '{hospital} prescribes a {days}-day low-residue diet. This tool follows your hospital, not the 1-day guideline for low-risk patients. Allowed examples: white rice, white bread, plain noodles, lean protein, tofu, eggs. Not: fruit, vegetables, dairy, wholegrains, fried food, red meat.',
  'ev.lastMeal': 'Last meal on the eve of scope',
  'ev.packet': 'Picoprep packet {n}',
  'ev.packetBefore6': 'Picoprep packet {n} (before 6am)',
  'ev.packetPm': 'Picoprep packet {n} (afternoon session)',
  'ev.packetHand': 'Picoprep packet {n} — confirm handwritten time',
  'ev.mix':
    'Mix packet {n} with 150ml warm water until dissolved, then {fluid}. Stay near a toilet — bowel motions usually start within a few hours.',
  'ev.fluid1L': '1 litre of clear fluid',
  'ev.stopFluids': 'Stop all fluids ({hours}h before reporting)',
  'ev.stopFluidsSkh': 'SKH: no more water/fluids 4 hours before your reporting time.',
  'ev.stopFluidsSgh': 'SGH/NCCS: clear fluids (max 200ml) up to 2 hours before the procedure. Then stop.',
  'ev.report': 'Report to {hospital} endoscopy',
  'ev.reportBody':
    'Reporting time {time}. Bring your prep form. If stool is still stages 1–4 on the guide, report 2 hours early and call first.',
  'ev.stoolCheck': 'Check your stool against the colour scale',
  'ev.med7': 'If prescribed — iron, Plavix, anti-diarrhoeals',
  'ev.med7Body':
    'TTSH brochure: stop these 7 days before. This is TTSH’s sheet, not SGH’s 5-day annex. Follow the list your counsellor wrote. If you are on these drugs and unsure, ask your care team.',
  'ev.sglt2': 'If prescribed — SGLT2 inhibitors',
  'ev.sglt2Body': 'TTSH: stop empagliflozin / dapagliflozin 2 days before. Still confirm against your own list.',
  'ev.med5': 'If your annex says so — blood thinners',
  'ev.med5Body':
    'The SGH/NCCS stop dates for aspirin, clopidogrel, warfarin and anticoagulants live on a handwritten annex, not the yellow form. Typical annex: 5 days for clopidogrel. TTSH uses 7 days for Plavix — that is variation, not an error. Follow your annex.',
  'ev.sglt2Gap': 'SGLT2 inhibitors — ask your care team',
  'ev.sglt2GapBody':
    'TTSH stops these 2 days before. The SGH yellow form is silent. Silent is a gap, not permission to continue or to stop.',
  'ev.breakfastAm': 'Morning meds + tiny breakfast, then stop food',
  'ev.breakfastAmBody':
    'Continue usual medications at 6am with a small amount of water. Breakfast only: 2 plain white bread (no kaya/butter/jam) OR 2 plain biscuits. No food after breakfast. Oral meds allowed up to 2 hours before the procedure.',
  'ev.breakfastPm': 'Breakfast only — then no food',
  'ev.breakfastPmBody':
    'SGH form: 2 plain white bread or 2 plain biscuits. The printed form does not clearly spell out afternoon-slot breakfast. Confirm against the handwritten times on your yellow form.',
  'ev.p3pmBody':
    'The SGH yellow form does not print afternoon packet times (F10). Suggested split-dose placement only: take this morning so the last dose can finish 2–5 hours before your procedure. Use the time written on your form if it differs.',
  'ev.p4pmBody':
    'Suggested: start about 5 hours before reporting, finish at least 2 hours before. This is guideline timing, not an SGH printed instruction. Prefer the blanks on your yellow form.',
  'ev.skhP1':
    'No more food after 6pm. Dissolve 1st packet in 150ml water. Then 3 large cups (250ml each) of clear liquid spread over 1 hour 30 minutes.',
  'ev.skhP2': 'Dissolve 2nd packet in 150ml water. Then 3 large cups of clear liquid spread over 1 hour.',
  'ev.skhP1Pm':
    'Dissolve 1st packet in 150ml water, then 3 large cups (250ml) over 1 hour 30 minutes. Afternoon packet times are taken from SKH’s AM/PM generator pattern — confirm on the SKH website if your SMS differs.',
  'ev.skhP2Pm':
    'Dissolve 2nd packet in 150ml water, then 3 large cups over 1 hour. No more fluids 4 hours before reporting.',
  'ev.ttshEve': 'Picoprep — evening dose',
  'ev.ttshEveBody':
    'Follow the 8am–2pm Picoprep PDF you were given. Mix as instructed and drink the clear fluids listed there. This microsite does not replace the slot-specific TTSH PDF.',
  'ev.ttshAm': 'Picoprep — morning dose',
  'ev.ttshAmBody': 'Take the morning dose on the TTSH AM PDF. Finish fluids per that sheet.',
  'ev.ttshPm1': 'Picoprep — first dose (PM slot)',
  'ev.ttshPm1Body':
    'Use the 2pm–5pm Picoprep PDF. TTSH issues a separate sheet per slot — follow that over this summary.',
  'ev.ttshPm2': 'Picoprep — second dose (PM slot)',
  'ev.ttshPm2Body': 'Second dose on the PM PDF, timed to your reporting slot.',
  'ev.cghPegEve': 'PEG-ES — evening portion',
  'ev.cghPegEveBody':
    'CGH uses PEG-ES colonic lavage plus simeticone, not Picoprep. Follow the volumes and times on your CGH brochure. This card is a placeholder so the day structure is visible.',
  'ev.cghBfast': 'Light breakfast, then stop 6 hours before',
  'ev.cghBfastBody':
    'CGH: 1 slice bread or 2 biscuits or a small bowl of plain pasta. BP medications at 6am. No diabetic medication. Stop eating 6 hours before the procedure.',
  'ev.cghPegAm': 'PEG-ES — morning portion',
  'ev.cghPegAmBody': 'Complete the morning PEG as your CGH brochure specifies.',

  'hosp.sgh.stoolAction':
    'SGH form has no stool chart. This guide adapts TTSH’s 6-point scale so you have a way to check. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
  'hosp.sgh.formGap': 'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.',
  'hosp.sgh.c0.label': 'Ambulatory Endoscopy Centre',
  'hosp.sgh.c0.hours': 'Confirm hours with your care team',
  'hosp.sgh.c0.note':
    'The yellow form prints no telephone number (F9). This is the publicly listed AEC line — confirm it at counselling.',
  'hosp.sgh.c1.label': 'SGH general enquiries',
  'hosp.sgh.c1.hours': '24-hour switchboard',
  'hosp.sgh.c1.note': 'Ask to be put through to endoscopy if the AEC line is closed.',
  'hosp.nccs.stoolAction':
    'The SGH/NCCS form has no stool chart. This guide adapts TTSH’s 6-point scale. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
  'hosp.nccs.formGap': 'Medication stop dates live on a separate handwritten annex, not the yellow form.',
  'hosp.nccs.c0.label': 'NCCS main line',
  'hosp.nccs.c0.hours': 'Confirm hours with your care team',
  'hosp.nccs.c0.note': 'The yellow form prints no number. Confirm the endoscopy contact given at counselling.',
  'hosp.nccs.c1.label': 'SGH Ambulatory Endoscopy Centre',
  'hosp.nccs.c1.hours': 'Confirm hours with your care team',
  'hosp.nccs.c1.note':
    'NCCS procedures often run through the SGH endoscopy pathway. Confirm which number applies to you.',
  'hosp.ttsh.stoolAction':
    'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
  'hosp.ttsh.formGap': 'TTSH issues separate PDFs per appointment slot.',
  'hosp.ttsh.c0.label': 'Endo PACE',
  'hosp.ttsh.c0.hours': 'Mon–Fri 8:00am–5:00pm',
  'hosp.ttsh.c0.note':
    'Publicly listed on the TTSH Endoscopy Centre page. TTSH is the only sheet with a reachable after-hours pathway via central hotline.',
  'hosp.ttsh.c1.label': 'Endoscopy Centre',
  'hosp.ttsh.c1.hours': 'Mon–Fri 8:00am–5:00pm; closed weekends & PH',
  'hosp.ttsh.c1.note': 'Level 2, TTSH Atrium Block.',
  'hosp.ttsh.c2.label': 'Central hotline',
  'hosp.ttsh.c2.hours': 'Mon–Fri 8:00am–5:00pm; Sat 8:00am–12:00pm',
  'hosp.ttsh.c2.note': 'Use this if clinic lines are closed. Confirm after-hours coverage with your care team.',
  'hosp.skh.stoolAction':
    'SKH uses a 5-point cup chart (no action trigger). Stages 1–3 = not ready. If you are not at “yellow, light, clear”, call SKH before leaving home.',
  'hosp.skh.formGap':
    'SKH already generates a personalised timeline on its website — this microsite mirrors that pattern for demo.',
  'hosp.skh.c0.label': 'Sengkang General Hospital',
  'hosp.skh.c0.hours': 'Confirm hours with your care team',
  'hosp.skh.c0.note':
    'SKH website does not print an after-hours prep hotline. Confirm the number given at counselling.',
  'hosp.cgh.stoolAction':
    'CGH brochure has no stool chart. This guide adapts TTSH’s 6-point scale. If stool still looks like stages 1–4, call during office hours.',
  'hosp.cgh.formGap': 'Prep agent is PEG, not Picoprep. Day-of meds: BP at 6am; no diabetic medication.',
  'hosp.cgh.c0.label': 'CGH main line',
  'hosp.cgh.c0.hours': 'Office hours only on the CGH sheet',
  'hosp.cgh.c0.note':
    'CGH lists clinic numbers for office hours only — there is no printed after-hours prep hotline.',
  'hosp.cgh.c1.label': 'Appointment centre',
  'hosp.cgh.c1.hours': 'Office hours — confirm with your care team',
  'hosp.cgh.c1.note': 'Publicly listed appointment line, not a night-before clinical hotline.',

  'food.empty': 'Type a food or drink — for example, “can I have prata?”',
  'food.deflectTitle': 'Ask your care team',
  'food.deflectBody':
    'That sits outside the signed food ruleset. This assistant only classifies foods and a few named medication flags against your hospital’s sheet. It will not invent an answer.',
  'food.gapTitle': 'Not in the ruleset',
  'food.gapBody':
    '“{q}” is not a named line on your hospital sheet, and no approved rule classifies it. Ask your care team — this is recorded as a gap, not a guess.',
  'food.symptomTitle': 'This is not an emergency line',
  'food.symptomBody':
    'If you feel unwell, call your hospital’s number from the Stool + contact tab, or 995. This site cannot triage symptoms.',
  'food.forHospital': 'Answering for {hospital} only.',
  'food.chickenTitle': 'Chicken rice — split, not a single yes/no',
  'food.chickenBody':
    'The white rice can be allowed. The cucumber garnish is not. Chilli and oily rice are not named. Ask for plain white rice and steamed chicken, no cucumber.',
  'food.splitRice': 'The rice',
  'food.splitRiceBody': 'White rice is a refined starch (R1).',
  'food.splitCucumber': 'Cucumber garnish',
  'food.splitCucumberBody': 'Vegetables are excluded (R3).',
  'food.splitChilli': 'Chilli / oily rice',
  'food.splitChilliBody': 'Not named on the sheet.',
  'rule.R1': 'Refined starches allowed',
  'rule.R2': 'Lean protein allowed',
  'rule.R3': 'No plant fibre',
  'rule.R4': 'No dairy, no plant milks',
  'rule.R5': 'Nothing fried',
  'rule.R6': 'No skins',
  'rule.Q1': 'Open: light fruit juice',
  'rule.Q2': 'Open: rice cereal',
  'rule.Q3': 'Open: plain prata',
  'rule.Q4': 'Open: cheese',
  'rule.Q5': 'Open: vegetarian protein',
  'rule.Q6': 'Open: strained clear soup',
  'rule.Q7': 'Open: white sweets',
  'rule.F1': 'Conflict: Plavix / clopidogrel timing',
  'rule.F2': 'Gap: SGLT2 inhibitors',
  'rule.F5': 'Conflict: milk in coffee/tea',
  'rule.F6': 'Conflict: fruit juice',
  'rule.F7': 'Gap: prata vs fried food',
  'rule.HOSP': 'Follow this hospital only',
  'rule.SCOPE': 'Outside the ruleset',
} as const

export const CLINICAL_ZH: Record<keyof typeof CLINICAL_EN, string> = {
  'ev.dietStart': '低渣饮食开始（提前 {days} 天）',
  'ev.dietStartBody':
    '{hospital} 规定 {days} 天低渣饮食。本工具跟您的医院，不跟低风险患者的 1 天指引。可以：白饭、白面包、清汤面、瘦肉蛋白、豆腐、蛋。不可以：水果、蔬菜、乳制品、全谷、油炸、红肉。',
  'ev.lastMeal': '检查前一晚的最后一餐',
  'ev.packet': 'Picoprep 第 {n} 包',
  'ev.packetBefore6': 'Picoprep 第 {n} 包（早上 6 点前）',
  'ev.packetPm': 'Picoprep 第 {n} 包（下午场）',
  'ev.packetHand': 'Picoprep 第 {n} 包 — 请核对手写时间',
  'ev.mix': '第 {n} 包溶于 150ml 温水，然后 {fluid}。请靠近厕所 — 通常几小时内会开始排便。',
  'ev.fluid1L': '再喝 1 升透明液体',
  'ev.stopFluids': '停止所有液体（报到前 {hours} 小时）',
  'ev.stopFluidsSkh': 'SKH：报到前 4 小时起不可再喝水或其他液体。',
  'ev.stopFluidsSgh': 'SGH/NCCS：检查前 2 小时内透明液体最多 200ml，之后停止。',
  'ev.report': '到 {hospital} 内视镜中心报到',
  'ev.reportBody': '报到时间 {time}。带上准备表格。若粪便仍是对照表第 1–4 级，请先打电话，并提前 2 小时报到。',
  'ev.stoolCheck': '对照颜色表检查粪便',
  'ev.med7': '如有服用 — 铁剂、Plavix、止泻药',
  'ev.med7Body':
    '陈笃生说明书：提前 7 天停用。这是陈笃生的表格，不是新国大的 5 天附件。请跟辅导员写下的清单。不确定请询问医护人员。',
  'ev.sglt2': '如有服用 — SGLT2 抑制剂',
  'ev.sglt2Body': '陈笃生：提前 2 天停用 empagliflozin / dapagliflozin。仍请对照您自己的清单。',
  'ev.med5': '若附件有写 — 薄血药',
  'ev.med5Body':
    '阿司匹林、氯吡格雷、华法林等停药日期写在手写附件上，不在黄色表格。常见：氯吡格雷 5 天。陈笃生 Plavix 为 7 天 — 这是医院差异，不是错误。请跟您的附件。',
  'ev.sglt2Gap': 'SGLT2 抑制剂 — 请询问医护人员',
  'ev.sglt2GapBody': '陈笃生提前 2 天停用。新国大黄色表格没有写。没写不等于可以继续，也不等于必须停。',
  'ev.breakfastAm': '早上药物 + 少量早餐，然后停食',
  'ev.breakfastAmBody':
    '早上 6 点用少量水继续日常药物。早餐仅限：2 片原味白面包（无咖椰/牛油/果酱）或 2 块原味饼干。早餐后不可再吃。口服药可服至检查前 2 小时。',
  'ev.breakfastPm': '仅早餐 — 然后停食',
  'ev.breakfastPmBody':
    '新国大表格：2 片原味白面包或 2 块原味饼干。印刷表格没有清楚写下午场早餐。请核对黄色表格上的手写时间。',
  'ev.p3pmBody':
    '新国大黄色表格没有印下午场药包时间（F10）。这只是建议的分次时间：早上服用，使最后一剂在检查前 2–5 小时完成。若表格手写不同，以手写为准。',
  'ev.p4pmBody':
    '建议：报到前约 5 小时开始，至少提前 2 小时完成。这是指引时间，不是新国大印刷说明。请优先看黄色表格上的空白栏。',
  'ev.skhP1': '晚上 6 点后不可再吃。第 1 包溶于 150ml 水，再在 1 小时 30 分钟内分饮 3 大杯（各 250ml）透明液体。',
  'ev.skhP2': '第 2 包溶于 150ml 水，再在 1 小时内分饮 3 大杯透明液体。',
  'ev.skhP1Pm':
    '第 1 包溶于 150ml 水，再在 1 小时 30 分钟内分饮 3 大杯（250ml）。下午场时间取自盛港上下午生成器 — 若简讯不同，请上盛港网站核对。',
  'ev.skhP2Pm': '第 2 包溶于 150ml 水，再在 1 小时内分饮 3 大杯。报到前 4 小时起不可再喝液体。',
  'ev.ttshEve': 'Picoprep — 晚间剂量',
  'ev.ttshEveBody':
    '请跟您拿到的 8am–2pm Picoprep PDF。按该说明书混合并喝所列透明液体。本微站不能代替陈笃生按时段发出的 PDF。',
  'ev.ttshAm': 'Picoprep — 早间剂量',
  'ev.ttshAmBody': '按陈笃生上午 PDF 服用早间剂量，并按该表完成液体。',
  'ev.ttshPm1': 'Picoprep — 第一剂（下午场）',
  'ev.ttshPm1Body': '请用 2pm–5pm 的 Picoprep PDF。陈笃生每个时段单独一张表 — 以该表为准。',
  'ev.ttshPm2': 'Picoprep — 第二剂（下午场）',
  'ev.ttshPm2Body': '下午 PDF 上的第二剂，按您的报到时段安排。',
  'ev.cghPegEve': 'PEG-ES — 晚间部分',
  'ev.cghPegEveBody':
    '樟宜用 PEG-ES 加 simeticone，不是 Picoprep。容量与时间请跟樟宜手册。此卡片只为显示当天结构。',
  'ev.cghBfast': '清淡早餐，然后提前 6 小时停食',
  'ev.cghBfastBody':
    '樟宜：1 片面包或 2 块饼干或一小碗清汤意面。早上 6 点血压药。不可服糖尿病药。检查前 6 小时停食。',
  'ev.cghPegAm': 'PEG-ES — 早间部分',
  'ev.cghPegAmBody': '按樟宜手册完成早上 PEG。',

  'hosp.sgh.stoolAction':
    '新国大表格没有粪便对照图。本指南借用陈笃生六点量表，方便您自查。若仍是第 1–4 级，请致电下方号码或提前 2 小时报到。',
  'hosp.sgh.formGap': 'Picoprep 时间为手写空白。下午场没有印在表格上。',
  'hosp.sgh.c0.label': '日间内视镜中心',
  'hosp.sgh.c0.hours': '请向医护人员确认时间',
  'hosp.sgh.c0.note': '黄色表格没有印电话（F9）。这是公开的日间内视镜电话 — 请在辅导时确认。',
  'hosp.sgh.c1.label': '新国大总机',
  'hosp.sgh.c1.hours': '24 小时总机',
  'hosp.sgh.c1.note': '若日间内视镜电话已关，请要求转内视镜。',
  'hosp.nccs.stoolAction':
    '新国大／国癌中心表格没有粪便对照图。本指南借用陈笃生六点量表。若仍是第 1–4 级，请致电下方号码或提前 2 小时报到。',
  'hosp.nccs.formGap': '停药日期写在另一份手写附件上，不在黄色表格。',
  'hosp.nccs.c0.label': '国癌中心总机',
  'hosp.nccs.c0.hours': '请向医护人员确认时间',
  'hosp.nccs.c0.note': '黄色表格没有印号码。请确认辅导时给的内视镜联络方式。',
  'hosp.nccs.c1.label': '新国大日间内视镜中心',
  'hosp.nccs.c1.hours': '请向医护人员确认时间',
  'hosp.nccs.c1.note': '国癌中心检查常走新国大内视镜路径。请确认哪一个号码适用于您。',
  'hosp.ttsh.stoolAction': '若粪便仍是第 1–4 级，请提前 2 小时报到，并致电 Endo PACE／内视镜中心。',
  'hosp.ttsh.formGap': '陈笃生按预约时段发出不同 PDF。',
  'hosp.ttsh.c0.label': 'Endo PACE',
  'hosp.ttsh.c0.hours': '周一至周五 上午 8:00–下午 5:00',
  'hosp.ttsh.c0.note': '列在陈笃生内视镜中心网页。陈笃生是唯一可通过中央热线联系的下班后路径。',
  'hosp.ttsh.c1.label': '内视镜中心',
  'hosp.ttsh.c1.hours': '周一至周五 上午 8:00–下午 5:00；周末及公共假期关闭',
  'hosp.ttsh.c1.note': '陈笃生 Atrium 座 2 楼。',
  'hosp.ttsh.c2.label': '中央热线',
  'hosp.ttsh.c2.hours': '周一至周五 上午 8:00–下午 5:00；周六 上午 8:00–中午 12:00',
  'hosp.ttsh.c2.note': '诊所电话关闭时使用。下班后覆盖范围请向医护人员确认。',
  'hosp.skh.stoolAction':
    '盛港用五点杯图（没有行动触发）。第 1–3 级 = 未准备好。若还不是“黄、浅、清澈”，出门前请致电盛港。',
  'hosp.skh.formGap': '盛港网站已能生成个人化时间表 — 本微站演示同一模式。',
  'hosp.skh.c0.label': 'Sengkang General Hospital',
  'hosp.skh.c0.hours': '请向医护人员确认时间',
  'hosp.skh.c0.note': '盛港网站没有印下班后肠道准备热线。请确认辅导时给的号码。',
  'hosp.cgh.stoolAction':
    '樟宜手册没有粪便对照图。本指南借用陈笃生六点量表。若仍是第 1–4 级，请在办公时间致电。',
  'hosp.cgh.formGap': '准备药物是 PEG，不是 Picoprep。当天药物：早上 6 点血压药；不可服糖尿病药。',
  'hosp.cgh.c0.label': '樟宜总机',
  'hosp.cgh.c0.hours': '手册仅列办公时间',
  'hosp.cgh.c0.note': '樟宜只列办公时间诊所电话 — 没有印下班后准备热线。',
  'hosp.cgh.c1.label': '预约中心',
  'hosp.cgh.c1.hours': '办公时间 — 请向医护人员确认',
  'hosp.cgh.c1.note': '公开预约电话，不是检查前一晚的临床热线。',

  'food.empty': '请输入食物或饮料，例如：“可以吃 prata 吗？”',
  'food.deflectTitle': '请询问医护人员',
  'food.deflectBody':
    '这超出已签署的食物规则。本助手只按您医院表格对食物和少数药物标记分类，不会编造答案。',
  'food.gapTitle': '规则里没有这一项',
  'food.gapBody': '“{q}”不是您医院表格上的具名项目，也没有已核准规则可分类。请询问医护人员 — 这会记为缺口，不是猜测。',
  'food.symptomTitle': '这不是急救热线',
  'food.symptomBody': '若您感到不适，请从粪便与联络页拨打医院电话，或拨 995。本站不能分诊症状。',
  'food.forHospital': '仅按 {hospital} 作答。',
  'food.chickenTitle': '鸡肉饭 — 要拆开，不是单一可以/不可以',
  'food.chickenBody': '白饭可以。黄瓜配菜不可以。辣椒和油饭没有具名。请点原味白饭和蒸鸡，不要黄瓜。',
  'food.splitRice': '米饭',
  'food.splitRiceBody': '白饭属于精制淀粉（R1）。',
  'food.splitCucumber': '黄瓜配菜',
  'food.splitCucumberBody': '蔬菜排除（R3）。',
  'food.splitChilli': '辣椒／油饭',
  'food.splitChilliBody': '表格没有具名。',
  'rule.R1': '精制淀粉可以',
  'rule.R2': '瘦肉蛋白可以',
  'rule.R3': '不可植物纤维',
  'rule.R4': '不可乳制品、植物奶',
  'rule.R5': '不可油炸',
  'rule.R6': '不可带皮',
  'rule.Q1': '待定：浅色果汁',
  'rule.Q2': '待定：米谷类',
  'rule.Q3': '待定：原味 prata',
  'rule.Q4': '待定：起司',
  'rule.Q5': '待定：素食蛋白',
  'rule.Q6': '待定：清汤',
  'rule.Q7': '待定：调味料',
  'rule.F1': '冲突：Plavix／氯吡格雷时间',
  'rule.F2': '缺口：SGLT2',
  'rule.F5': '冲突：咖啡／茶加奶',
  'rule.F6': '冲突：果汁',
  'rule.F7': '缺口：prata 与油炸',
  'rule.HOSP': '只跟这家医院',
  'rule.SCOPE': '超出规则范围',
}

export const CLINICAL_MS: Record<keyof typeof CLINICAL_EN, string> = {
  'ev.dietStart': 'Diet rendah sisa bermula ({days} hari sebelum)',
  'ev.dietStartBody':
    '{hospital} tetapkan diet rendah sisa {days} hari. Alatan ini ikut hospital anda, bukan garis panduan 1 hari. Boleh: nasi putih, roti putih, mi kosong, protein tanpa lemak, tauhu, telur. Tidak: buah, sayur, tenusu, bijirin penuh, goreng, daging merah.',
  'ev.lastMeal': 'Hidangan terakhir malam sebelum prosedur',
  'ev.packet': 'Picoprep paket {n}',
  'ev.packetBefore6': 'Picoprep paket {n} (sebelum 6 pagi)',
  'ev.packetPm': 'Picoprep paket {n} (sesi petang)',
  'ev.packetHand': 'Picoprep paket {n} — sahkan masa bertulis',
  'ev.mix':
    'Campur paket {n} dengan 150ml air suam hingga larut, kemudian {fluid}. Dekati tandas — najis biasanya bermula dalam beberapa jam.',
  'ev.fluid1L': '1 liter cecair jernih',
  'ev.stopFluids': 'Henti semua cecair ({hours}j sebelum daftar)',
  'ev.stopFluidsSkh': 'SKH: jangan minum air/cecair 4 jam sebelum masa daftar.',
  'ev.stopFluidsSgh': 'SGH/NCCS: cecair jernih (maks 200ml) hingga 2 jam sebelum prosedur. Kemudian henti.',
  'ev.report': 'Daftar di endoskopi {hospital}',
  'ev.reportBody':
    'Masa daftar {time}. Bawa borang persediaan. Jika najis masih tahap 1–4, daftar 2 jam awal dan telefon dulu.',
  'ev.stoolCheck': 'Semak najis dengan skala warna',
  'ev.med7': 'Jika ditetapkan — zat besi, Plavix, ubat cegah cirit-birit',
  'ev.med7Body':
    'Brosur TTSH: henti 7 hari sebelum. Ini helaian TTSH, bukan lampiran 5 hari SGH. Ikut senarai kaunselor anda. Jika tidak pasti, tanya pasukan rawatan.',
  'ev.sglt2': 'Jika ditetapkan — perencat SGLT2',
  'ev.sglt2Body': 'TTSH: henti empagliflozin / dapagliflozin 2 hari sebelum. Masih sahkan dengan senarai anda.',
  'ev.med5': 'Jika lampiran anda kata begitu — penipis darah',
  'ev.med5Body':
    'Tarikh henti aspirin, clopidogrel, warfarin ada pada lampiran bertulis, bukan borang kuning. Lazim: clopidogrel 5 hari. TTSH Plavix 7 hari — itu perbezaan, bukan ralat. Ikut lampiran anda.',
  'ev.sglt2Gap': 'Perencat SGLT2 — tanya pasukan rawatan',
  'ev.sglt2GapBody':
    'TTSH henti 2 hari sebelum. Borang kuning SGH senyap. Senyap bukan kebenaran terus atau henti.',
  'ev.breakfastAm': 'Ubat pagi + sarapan kecil, kemudian henti makanan',
  'ev.breakfastAmBody':
    'Teruskan ubat biasa 6 pagi dengan sedikit air. Sarapan sahaja: 2 roti putih kosong (tiada kaya/mentega/jem) ATAU 2 biskut kosong. Tiada makanan selepas sarapan. Ubat oral hingga 2 jam sebelum prosedur.',
  'ev.breakfastPm': 'Sarapan sahaja — kemudian tiada makanan',
  'ev.breakfastPmBody':
    'Borang SGH: 2 roti putih kosong atau 2 biskut kosong. Borang bercetak tidak jelas untuk sarapan slot petang. Sahkan masa bertulis pada borang kuning.',
  'ev.p3pmBody':
    'Borang kuning SGH tidak cetak masa paket petang (F10). Cadangan split-dose sahaja: ambil pagi ini supaya dos terakhir siap 2–5 jam sebelum prosedur. Guna masa pada borang jika berbeza.',
  'ev.p4pmBody':
    'Cadangan: mula kira-kira 5 jam sebelum daftar, siap sekurang-kurangnya 2 jam sebelum. Ini masa garis panduan, bukan arahan bercetak SGH. Utamakan ruang kosong pada borang kuning.',
  'ev.skhP1':
    'Tiada makanan selepas 6 petang. Larut paket 1 dalam 150ml air. Kemudian 3 cawan besar (250ml) cecair jernih sepanjang 1 jam 30 minit.',
  'ev.skhP2': 'Larut paket 2 dalam 150ml air. Kemudian 3 cawan besar cecair jernih sepanjang 1 jam.',
  'ev.skhP1Pm':
    'Larut paket 1 dalam 150ml air, kemudian 3 cawan besar (250ml) sepanjang 1 jam 30 minit. Masa sesi petang dari corak penjana SKH — sahkan di laman SKH jika SMS berbeza.',
  'ev.skhP2Pm':
    'Larut paket 2 dalam 150ml air, kemudian 3 cawan besar sepanjang 1 jam. Tiada cecair 4 jam sebelum daftar.',
  'ev.ttshEve': 'Picoprep — dos petang',
  'ev.ttshEveBody':
    'Ikut PDF Picoprep 8am–2pm yang diberi. Campur seperti diarah dan minum cecair jernih di situ. Tapak mikro ini tidak gantikan PDF TTSH mengikut slot.',
  'ev.ttshAm': 'Picoprep — dos pagi',
  'ev.ttshAmBody': 'Ambil dos pagi pada PDF AM TTSH. Habiskan cecair ikut helaian itu.',
  'ev.ttshPm1': 'Picoprep — dos pertama (slot PM)',
  'ev.ttshPm1Body': 'Guna PDF Picoprep 2pm–5pm. TTSH keluarkan helaian berasingan setiap slot — itu yang diutamakan.',
  'ev.ttshPm2': 'Picoprep — dos kedua (slot PM)',
  'ev.ttshPm2Body': 'Dos kedua pada PDF PM, dijadual mengikut slot daftar anda.',
  'ev.cghPegEve': 'PEG-ES — bahagian petang',
  'ev.cghPegEveBody':
    'CGH guna PEG-ES plus simeticone, bukan Picoprep. Ikut isipadu dan masa pada brosur CGH. Kad ini penanda supaya struktur hari nampak.',
  'ev.cghBfast': 'Sarapan ringan, kemudian henti 6 jam sebelum',
  'ev.cghBfastBody':
    'CGH: 1 hirisan roti atau 2 biskut atau mangkuk kecil pasta kosong. Ubat tekanan 6 pagi. Tiada ubat kencing manis. Henti makan 6 jam sebelum prosedur.',
  'ev.cghPegAm': 'PEG-ES — bahagian pagi',
  'ev.cghPegAmBody': 'Lengkapkan PEG pagi seperti brosur CGH.',

  'hosp.sgh.stoolAction':
    'Borang SGH tiada carta najis. Panduan ini menyesuaikan skala 6 tahap TTSH. Jika masih tahap 1–4, telefon nombor di bawah atau daftar 2 jam awal.',
  'hosp.sgh.formGap': 'Masa Picoprep ialah ruang kosong bertulis. Slot petang tidak dicetak.',
  'hosp.sgh.c0.label': 'Ambulatory Endoscopy Centre',
  'hosp.sgh.c0.hours': 'Sahkan waktu dengan pasukan rawatan',
  'hosp.sgh.c0.note':
    'Borang kuning tidak cetak nombor telefon (F9). Ini talian AEC yang disenaraikan — sahkan semasa kaunseling.',
  'hosp.sgh.c1.label': 'Talian am SGH',
  'hosp.sgh.c1.hours': 'Papan suis 24 jam',
  'hosp.sgh.c1.note': 'Minta disambungkan ke endoskopi jika talian AEC ditutup.',
  'hosp.nccs.stoolAction':
    'Borang SGH/NCCS tiada carta najis. Panduan ini menyesuaikan skala 6 tahap TTSH. Jika masih tahap 1–4, telefon nombor di bawah atau daftar 2 jam awal.',
  'hosp.nccs.formGap': 'Tarikh henti ubat ada pada lampiran bertulis berasingan, bukan borang kuning.',
  'hosp.nccs.c0.label': 'Talian utama NCCS',
  'hosp.nccs.c0.hours': 'Sahkan waktu dengan pasukan rawatan',
  'hosp.nccs.c0.note': 'Borang kuning tidak cetak nombor. Sahkan hubungan endoskopi yang diberi semasa kaunseling.',
  'hosp.nccs.c1.label': 'SGH Ambulatory Endoscopy Centre',
  'hosp.nccs.c1.hours': 'Sahkan waktu dengan pasukan rawatan',
  'hosp.nccs.c1.note':
    'Prosedur NCCS sering melalui laluan endoskopi SGH. Sahkan nombor yang terpakai untuk anda.',
  'hosp.ttsh.stoolAction':
    'Jika najis masih tahap 1–4, daftar 2 jam awal dan telefon Endo PACE / pusat endoskopi.',
  'hosp.ttsh.formGap': 'TTSH keluarkan PDF berasingan setiap slot temujanji.',
  'hosp.ttsh.c0.label': 'Endo PACE',
  'hosp.ttsh.c0.hours': 'Isnin–Jumaat 8:00 pagi–5:00 petang',
  'hosp.ttsh.c0.note':
    'Disenaraikan pada halaman Pusat Endoskopi TTSH. TTSH satu-satunya helaian dengan laluan selepas waktu pejabat melalui talian pusat.',
  'hosp.ttsh.c1.label': 'Pusat Endoskopi',
  'hosp.ttsh.c1.hours': 'Isnin–Jumaat 8:00 pagi–5:00 petang; tutup hujung minggu & cuti umum',
  'hosp.ttsh.c1.note': 'Aras 2, Blok Atrium TTSH.',
  'hosp.ttsh.c2.label': 'Talian pusat',
  'hosp.ttsh.c2.hours': 'Isnin–Jumaat 8:00 pagi–5:00 petang; Sabtu 8:00 pagi–12:00 tengah hari',
  'hosp.ttsh.c2.note': 'Guna ini jika talian klinik ditutup. Sahkan liputan selepas waktu pejabat dengan pasukan rawatan.',
  'hosp.skh.stoolAction':
    'SKH guna carta cawan 5 tahap (tiada pencetus tindakan). Tahap 1–3 = belum sedia. Jika belum “kuning, cerah, jernih”, telefon SKH sebelum keluar rumah.',
  'hosp.skh.formGap':
    'SKH sudah jana jadual peribadi di laman webnya — tapak mikro ini mencontohi corak itu untuk demo.',
  'hosp.skh.c0.label': 'Sengkang General Hospital',
  'hosp.skh.c0.hours': 'Sahkan waktu dengan pasukan rawatan',
  'hosp.skh.c0.note':
    'Laman SKH tidak cetak talian panas persediaan selepas waktu pejabat. Sahkan nombor yang diberi semasa kaunseling.',
  'hosp.cgh.stoolAction':
    'Brosur CGH tiada carta najis. Panduan ini menyesuaikan skala 6 tahap TTSH. Jika masih tahap 1–4, telefon semasa waktu pejabat.',
  'hosp.cgh.formGap': 'Ejen persediaan ialah PEG, bukan Picoprep. Ubat hari prosedur: tekanan 6 pagi; tiada ubat kencing manis.',
  'hosp.cgh.c0.label': 'Talian utama CGH',
  'hosp.cgh.c0.hours': 'Waktu pejabat sahaja pada helaian CGH',
  'hosp.cgh.c0.note':
    'CGH senaraikan nombor klinik waktu pejabat sahaja — tiada talian panas persediaan selepas waktu pejabat.',
  'hosp.cgh.c1.label': 'Pusat temujanji',
  'hosp.cgh.c1.hours': 'Waktu pejabat — sahkan dengan pasukan rawatan',
  'hosp.cgh.c1.note': 'Talian temujanji yang disenaraikan, bukan talian klinikal malam sebelumnya.',

  'food.empty': 'Taip makanan atau minuman — contoh, “boleh saya makan prata?”',
  'food.deflectTitle': 'Tanya pasukan rawatan',
  'food.deflectBody':
    'Itu di luar ruleset makanan yang ditandatangani. Pembantu ini hanya mengelaskan makanan dan beberapa bendera ubat pada helaian hospital anda. Ia tidak akan cipta jawapan.',
  'food.gapTitle': 'Tiada dalam ruleset',
  'food.gapBody':
    '“{q}” bukan baris bernama pada helaian hospital anda, dan tiada peraturan diluluskan yang mengelaskannya. Tanya pasukan rawatan — ini direkod sebagai jurang, bukan tekaan.',
  'food.symptomTitle': 'Ini bukan talian kecemasan',
  'food.symptomBody':
    'Jika anda tidak sihat, telefon nombor hospital dari tab Najis + hubungan, atau 995. Tapak ini tidak boleh triaj gejala.',
  'food.forHospital': 'Menjawab untuk {hospital} sahaja.',
  'food.chickenTitle': 'Nasi ayam — dipecah, bukan satu ya/tidak',
  'food.chickenBody':
    'Nasi putih boleh dibenarkan. Hiasan timun tidak. Cili dan nasi berminyak tidak dinamakan. Minta nasi putih kosong dan ayam kukus, tanpa timun.',
  'food.splitRice': 'Nasi',
  'food.splitRiceBody': 'Nasi putih ialah kanji ditapis (R1).',
  'food.splitCucumber': 'Hiasan timun',
  'food.splitCucumberBody': 'Sayur dikecualikan (R3).',
  'food.splitChilli': 'Cili / nasi berminyak',
  'food.splitChilliBody': 'Tidak dinamakan pada helaian.',
  'rule.R1': 'Kanji ditapis dibenarkan',
  'rule.R2': 'Protein tanpa lemak dibenarkan',
  'rule.R3': 'Tiada serat tumbuhan',
  'rule.R4': 'Tiada tenusu, tiada susu tumbuhan',
  'rule.R5': 'Tiada goreng',
  'rule.R6': 'Tiada kulit',
  'rule.Q1': 'Terbuka: jus buah cerah',
  'rule.Q2': 'Terbuka: bijirin beras',
  'rule.Q3': 'Terbuka: prata kosong',
  'rule.Q4': 'Terbuka: keju',
  'rule.Q5': 'Terbuka: protein vegetarian',
  'rule.Q6': 'Terbuka: sup jernih',
  'rule.Q7': 'Terbuka: gula-gula putih',
  'rule.F1': 'Konflik: masa Plavix / clopidogrel',
  'rule.F2': 'Jurang: SGLT2',
  'rule.F5': 'Konflik: susu dalam kopi/teh',
  'rule.F6': 'Konflik: jus buah',
  'rule.F7': 'Jurang: prata vs goreng',
  'rule.HOSP': 'Ikut hospital ini sahaja',
  'rule.SCOPE': 'Di luar ruleset',
}

export const CLINICAL_TA: Record<keyof typeof CLINICAL_EN, string> = {
  'ev.dietStart': 'குறைந்த எச்ச உணவு தொடக்கம் ({days} நாட்கள் முன்)',
  'ev.dietStartBody':
    '{hospital} {days} நாள் குறைந்த எச்ச உணவைக் குறிக்கிறது. இக்கருவி உங்கள் மருத்துவமனையைப் பின்பற்றுகிறது. அனுமதி: வெள்ளை சோறு, வெள்ளை ரொட்டி, சாதாரண நூடுல்ஸ், மெலிந்த புரதம், டோஃபு, முட்டை. இல்லை: பழம், காய்கறி, பால் பொருள், முழு தானியம், வறுத்த உணவு, சிவப்பு இறைச்சி.',
  'ev.lastMeal': 'பரிசோதனைக்கு முந்தைய இரவின் கடைசி உணவு',
  'ev.packet': 'Picoprep பாக்கெட் {n}',
  'ev.packetBefore6': 'Picoprep பாக்கெட் {n} (காலை 6க்கு முன்)',
  'ev.packetPm': 'Picoprep பாக்கெட் {n} (பிற்பகல் அமர்வு)',
  'ev.packetHand': 'Picoprep பாக்கெட் {n} — கையெழுத்து நேரத்தை உறுதிசெய்யவும்',
  'ev.mix':
    'பாக்கெட் {n} ஐ 150ml வெந்நீரில் கரைத்து, பிறகு {fluid}. கழிவறை அருகில் இருங்கள் — சில மணி நேரத்தில் மலம் தொடங்கும்.',
  'ev.fluid1L': '1 லிட்டர் தெளிவான திரவம்',
  'ev.stopFluids': 'அனைத்து திரவங்களையும் நிறுத்து (வருகைக்கு {hours} மணி முன்)',
  'ev.stopFluidsSkh': 'SKH: வருகை நேரத்துக்கு 4 மணி முன் நீர்/திரவம் வேண்டாம்.',
  'ev.stopFluidsSgh': 'SGH/NCCS: பரிசோதனைக்கு 2 மணி முன் வரை தெளிவான திரவம் (அதிகபட்சம் 200ml). பிறகு நிறுத்து.',
  'ev.report': '{hospital} எண்டோஸ்கோபிக்கு வருகை',
  'ev.reportBody':
    'வருகை நேரம் {time}. தயாரிப்பு படிவத்தை கொண்டு வாருங்கள். மலம் இன்னும் 1–4 நிலைகளில் இருந்தால், 2 மணி முன் வந்து முதலில் அழைக்கவும்.',
  'ev.stoolCheck': 'நிற அளவுகோலுடன் மலத்தைச் சரிபார்',
  'ev.med7': 'பரிந்துரைக்கப்பட்டிருந்தால் — இரும்பு, Plavix, வயிற்றுப்போக்கு மருந்து',
  'ev.med7Body':
    'TTSH கையேடு: 7 நாட்கள் முன் நிறுத்து. இது TTSH தாள், SGH இன் 5 நாள் இணைப்பு அல்ல. உங்கள் ஆலோசகர் எழுதிய பட்டியலைப் பின்பற்றுங்கள். உறுதியில்லை என்றால் பராமரிப்பு குழுவிடம் கேளுங்கள்.',
  'ev.sglt2': 'பரிந்துரைக்கப்பட்டிருந்தால் — SGLT2 தடுப்பான்கள்',
  'ev.sglt2Body': 'TTSH: empagliflozin / dapagliflozin ஐ 2 நாட்கள் முன் நிறுத்து. உங்கள் பட்டியலுடன் உறுதிசெய்யவும்.',
  'ev.med5': 'உங்கள் இணைப்பில் இருந்தால் — இரத்த மெல்லியவை',
  'ev.med5Body':
    'aspirin, clopidogrel, warfarin நிறுத்தும் தேதிகள் கையெழுத்து இணைப்பில் உள்ளன, மஞ்சள் படிவத்தில் இல்லை. வழக்கம்: clopidogrel 5 நாட்கள். TTSH Plavix 7 நாட்கள் — இது வேறுபாடு, பிழை அல்ல. உங்கள் இணைப்பைப் பின்பற்றுங்கள்.',
  'ev.sglt2Gap': 'SGLT2 தடுப்பான்கள் — பராமரிப்பு குழுவிடம் கேளுங்கள்',
  'ev.sglt2GapBody':
    'TTSH இவற்றை 2 நாட்கள் முன் நிறுத்துகிறது. SGH மஞ்சள் படிவம் ம silently. ம silently என்பது தொடர அனுமதி அல்ல, நிறுத்தவும் அல்ல.',
  'ev.breakfastAm': 'காலை மருந்து + சிறிய காலை உணவு, பிறகு உணவு நிறுத்து',
  'ev.breakfastAmBody':
    'காலை 6 மணிக்கு சாதாரண மருந்துகளை சிறிது நீருடன் தொடருங்கள். காலை உணவு மட்டும்: 2 சாதாரண வெள்ளை ரொட்டி (kaya/வெண்ணெய்/ஜாம் இல்லை) அல்லது 2 சாதாரண பிஸ்கட். காலை உணவுக்குப் பின் உணவு வேண்டாம். வாய்வழி மருந்து பரிசோதனைக்கு 2 மணி முன் வரை.',
  'ev.breakfastPm': 'காலை உணவு மட்டும் — பிறகு உணவு இல்லை',
  'ev.breakfastPmBody':
    'SGH படிவம்: 2 சாதாரண வெள்ளை ரொட்டி அல்லது 2 சாதாரண பிஸ்கட். அச்சிட்ட படிவம் பிற்பகல் காலை உணவை தெளிவாகச் சொல்லவில்லை. மஞ்சள் படிவத்தின் கையெழுத்து நேரத்தை உறுதிசெய்யவும்.',
  'ev.p3pmBody':
    'SGH மஞ்சள் படிவம் பிற்பகல் பாக்கெட் நேரங்களை அச்சிடவில்லை (F10). பரிந்துரை மட்டும்: இக்காலையில் எடுங்கள், கடைசி அளவு பரிசோதனைக்கு 2–5 மணி முன் முடியும். படிவத்தில் வேறு நேரம் இருந்தால் அதைப் பயன்படுத்துங்கள்.',
  'ev.p4pmBody':
    'பரிந்துரை: வருகைக்கு சுமார் 5 மணி முன் தொடங்கி, குறைந்தது 2 மணி முன் முடிக்கவும். இது வழிகாட்டி நேரம், SGH அச்சிட்ட அறிவுறுத்தல் அல்ல. மஞ்சள் படிவத்தின் காலி இடங்களை முன்னுரிமை கொடுங்கள்.',
  'ev.skhP1':
    'மாலை 6க்குப் பின் உணவு வேண்டாம். 1வது பாக்கெட்டை 150ml நீரில் கரைக்கவும். பிறகு 1 மணி 30 நிமிடத்தில் 3 பெரிய கோப்பை (250ml) தெளிவான திரவம்.',
  'ev.skhP2': '2வது பாக்கெட்டை 150ml நீரில் கரைக்கவும். பிறகு 1 மணியில் 3 பெரிய கோப்பை தெளிவான திரவம்.',
  'ev.skhP1Pm':
    '1வது பாக்கெட்டை 150ml நீரில் கரைத்து, 1 மணி 30 நிமிடத்தில் 3 பெரிய கோப்பை (250ml). பிற்பகல் நேரங்கள் SKH AM/PM வடிவத்திலிருந்து — SMS வேறுபட்டால் SKH இணையதளத்தில் உறுதிசெய்யவும்.',
  'ev.skhP2Pm':
    '2வது பாக்கெட்டை 150ml நீரில் கரைத்து, 1 மணியில் 3 பெரிய கோப்பை. வருகைக்கு 4 மணி முன் திரவம் வேண்டாம்.',
  'ev.ttshEve': 'Picoprep — மாலை அளவு',
  'ev.ttshEveBody':
    'உங்களுக்குத் தரப்பட்ட 8am–2pm Picoprep PDF ஐப் பின்பற்றுங்கள். அங்குள்ளபடி கலந்து தெளிவான திரவத்தைக் குடியுங்கள். இந்த நுண் தளம் TTSH slot PDF ஐ மாற்றாது.',
  'ev.ttshAm': 'Picoprep — காலை அளவு',
  'ev.ttshAmBody': 'TTSH AM PDF இல் காலை அளவை எடுங்கள். அந்த தாளின்படி திரவத்தை முடியுங்கள்.',
  'ev.ttshPm1': 'Picoprep — முதல் அளவு (PM slot)',
  'ev.ttshPm1Body': '2pm–5pm Picoprep PDF ஐப் பயன்படுத்துங்கள். TTSH ஒவ்வொரு slot-க்கும் தனி தாள் — அதை இந்த சுருக்கத்துக்கு மேல் பின்பற்றுங்கள்.',
  'ev.ttshPm2': 'Picoprep — இரண்டாம் அளவு (PM slot)',
  'ev.ttshPm2Body': 'PM PDF இல் இரண்டாம் அளவு, உங்கள் வருகை slot-க்கு ஏற்ப.',
  'ev.cghPegEve': 'PEG-ES — மாலை பகுதி',
  'ev.cghPegEveBody':
    'CGH Picoprep அல்ல, PEG-ES + simeticone பயன்படுத்துகிறது. CGH கையேட்டில் உள்ள அளவுகளையும் நேரங்களையும் பின்பற்றுங்கள். இந்த அட்டை நாள் அமைப்பைக் காட்ட மட்டும்.',
  'ev.cghBfast': 'இலேசான காலை உணவு, பிறகு 6 மணி முன் நிறுத்து',
  'ev.cghBfastBody':
    'CGH: 1 ரொட்டி அல்லது 2 பிஸ்கட் அல்லது சிறிய கிண்ணம் சாதாரண பாஸ்தா. காலை 6 மணிக்கு BP மருந்து. சர்க்கரை நோய் மருந்து வேண்டாம். பரிசோதனைக்கு 6 மணி முன் உணவு நிறுத்து.',
  'ev.cghPegAm': 'PEG-ES — காலை பகுதி',
  'ev.cghPegAmBody': 'CGH கையேடு குறிப்பிடும் காலை PEG ஐ முடிக்கவும்.',

  'hosp.sgh.stoolAction':
    'SGH படிவத்தில் மல அட்டவணை இல்லை. இந்த வழிகாட்டி TTSH ஆறு நிலை அளவுகோலைப் பயன்படுத்துகிறது. இன்னும் 1–4 நிலைகளில் இருந்தால் கீழுள்ள எண்ணை அழைக்கவும் அல்லது 2 மணி முன் வரவும்.',
  'hosp.sgh.formGap': 'Picoprep நேரங்கள் கையெழுத்து காலி இடங்கள். பிற்பகல் slots அச்சிடப்படவில்லை.',
  'hosp.sgh.c0.label': 'Ambulatory Endoscopy Centre',
  'hosp.sgh.c0.hours': 'பராமரிப்பு குழுவிடம் நேரத்தை உறுதிசெய்யவும்',
  'hosp.sgh.c0.note':
    'மஞ்சள் படிவம் தொலைபேசி எண்ணை அச்சிடவில்லை (F9). இது பொதுவில் உள்ள AEC வரி — ஆலோசனையில் உறுதிசெய்யவும்.',
  'hosp.sgh.c1.label': 'SGH பொது விசாரணை',
  'hosp.sgh.c1.hours': '24 மணி சுவிட்ச்போர்டு',
  'hosp.sgh.c1.note': 'AEC வரி மூடியிருந்தால் எண்டோஸ்கோபிக்கு இணைக்கச் சொல்லுங்கள்.',
  'hosp.nccs.stoolAction':
    'SGH/NCCS படிவத்தில் மல அட்டவணை இல்லை. இந்த வழிகாட்டி TTSH ஆறு நிலை அளவுகோலைப் பயன்படுத்துகிறது. இன்னும் 1–4 நிலைகளில் இருந்தால் கீழுள்ள எண்ணை அழைக்கவும் அல்லது 2 மணி முன் வரவும்.',
  'hosp.nccs.formGap': 'மருந்து நிறுத்தும் தேதிகள் தனி கையெழுத்து இணைப்பில் உள்ளன, மஞ்சள் படிவத்தில் இல்லை.',
  'hosp.nccs.c0.label': 'NCCS முதன்மை வரி',
  'hosp.nccs.c0.hours': 'பராமரிப்பு குழுவிடம் நேரத்தை உறுதிசெய்யவும்',
  'hosp.nccs.c0.note': 'மஞ்சள் படிவம் எண்ணை அச்சிடவில்லை. ஆலோசனையில் தரப்பட்ட எண்டோஸ்கோபி தொடர்பை உறுதிசெய்யவும்.',
  'hosp.nccs.c1.label': 'SGH Ambulatory Endoscopy Centre',
  'hosp.nccs.c1.hours': 'பராமரிப்பு குழுவிடம் நேரத்தை உறுதிசெய்யவும்',
  'hosp.nccs.c1.note':
    'NCCS பரிசோதனைகள் பெரும்பாலும் SGH எண்டோஸ்கோபி பாதையில் நடக்கும். உங்களுக்கு எந்த எண் பொருந்தும் என உறுதிசெய்யவும்.',
  'hosp.ttsh.stoolAction':
    'மலம் இன்னும் 1–4 நிலைகளில் இருந்தால், 2 மணி முன் வந்து Endo PACE / எண்டோஸ்கோபி மையத்தை அழைக்கவும்.',
  'hosp.ttsh.formGap': 'TTSH ஒவ்வொரு சந்திப்பு slot-க்கும் தனி PDF வழங்குகிறது.',
  'hosp.ttsh.c0.label': 'Endo PACE',
  'hosp.ttsh.c0.hours': 'திங்கள்–வெள்ளி காலை 8:00–மாலை 5:00',
  'hosp.ttsh.c0.note':
    'TTSH எண்டோஸ்கோபி மைய பக்கத்தில் பொதுவில் உள்ளது. அலுவலக நேரத்துக்குப் பின் மைய ஹாட்லைன் வழியாக அடையக்கூடிய ஒரே தாள் TTSH.',
  'hosp.ttsh.c1.label': 'எண்டோஸ்கோபி மையம்',
  'hosp.ttsh.c1.hours': 'திங்கள்–வெள்ளி காலை 8:00–மாலை 5:00; வார இறுதி & பொது விடுமுறை மூடப்படும்',
  'hosp.ttsh.c1.note': 'நிலை 2, TTSH Atrium Block.',
  'hosp.ttsh.c2.label': 'மைய ஹாட்லைன்',
  'hosp.ttsh.c2.hours': 'திங்கள்–வெள்ளி காலை 8:00–மாலை 5:00; சனி காலை 8:00–மதியம் 12:00',
  'hosp.ttsh.c2.note': 'கிளினிக் வரிகள் மூடியிருந்தால் இதைப் பயன்படுத்துங்கள். அலுவலக நேரத்துக்குப் பின் என்பதை பராமரிப்பு குழுவிடம் உறுதிசெய்யவும்.',
  'hosp.skh.stoolAction':
    'SKH 5 நிலை கோப்பை அட்டவணை பயன்படுத்துகிறது (செயல் தூண்டல் இல்லை). நிலை 1–3 = தயார் இல்லை. “மஞ்சள், வெளிர், தெளிவு” இல்லை என்றால் வீட்டை விட்டு வெளியேறும் முன் SKH ஐ அழைக்கவும்.',
  'hosp.skh.formGap':
    'SKH இணையதளம் ஏற்கனவே தனிப்பயன் கால அட்டவணையை உருவாக்குகிறது — இந்த நுண் தளம் அந்த வடிவத்தை டெமோவுக்கு பிரதிபலிக்கிறது.',
  'hosp.skh.c0.label': 'Sengkang General Hospital',
  'hosp.skh.c0.hours': 'பராமரிப்பு குழுவிடம் நேரத்தை உறுதிசெய்யவும்',
  'hosp.skh.c0.note':
    'SKH இணையதளம் அலுவலக நேரத்துக்குப் பின் தயாரிப்பு ஹாட்லைனை அச்சிடவில்லை. ஆலோசனையில் தரப்பட்ட எண்ணை உறுதிசெய்யவும்.',
  'hosp.cgh.stoolAction':
    'CGH கையேட்டில் மல அட்டவணை இல்லை. இந்த வழிகாட்டி TTSH ஆறு நிலை அளவுகோலைப் பயன்படுத்துகிறது. இன்னும் 1–4 நிலைகளில் இருந்தால் அலுவலக நேரத்தில் அழைக்கவும்.',
  'hosp.cgh.formGap': 'தயாரிப்பு மருந்து PEG, Picoprep அல்ல. அன்றைய மருந்து: காலை 6 மணிக்கு BP; சர்க்கரை நோய் மருந்து வேண்டாம்.',
  'hosp.cgh.c0.label': 'CGH முதன்மை வரி',
  'hosp.cgh.c0.hours': 'CGH தாளில் அலுவலக நேரம் மட்டும்',
  'hosp.cgh.c0.note':
    'CGH அலுவலக நேர கிளினிக் எண்களை மட்டும் பட்டியலிடுகிறது — அச்சிட்ட இரவு நேர தயாரிப்பு ஹாட்லைன் இல்லை.',
  'hosp.cgh.c1.label': 'சந்திப்பு மையம்',
  'hosp.cgh.c1.hours': 'அலுவலக நேரம் — பராமரிப்பு குழுவிடம் உறுதிசெய்யவும்',
  'hosp.cgh.c1.note': 'பொதுவில் உள்ள சந்திப்பு வரி, முந்தைய இரவு மருத்துவ ஹாட்லைன் அல்ல.',

  'food.empty': 'ஒரு உணவு அல்லது பானத்தை தட்டச்சு செய்க — எ.கா. “prata சாப்பிடலாமா?”',
  'food.deflectTitle': 'பராமரிப்பு குழுவிடம் கேளுங்கள்',
  'food.deflectBody':
    'இது கையொப்பமிட்ட உணவு விதிகளுக்கு வெளியே. இந்த உதவியாளர் உங்கள் மருத்துவமனை தாளின் உணவுகளையும் சில மருந்து குறிகளையும் மட்டும் வகைப்படுத்துகிறது. பதிலை உருவாக்காது.',
  'food.gapTitle': 'விதிகளில் இல்லை',
  'food.gapBody':
    '“{q}” உங்கள் மருத்துவமனை தாளில் பெயரிடப்பட்ட வரி அல்ல, அங்கீகரிக்கப்பட்ட விதி வகைப்படுத்தவும் இல்லை. பராமரிப்பு குழுவிடம் கேளுங்கள் — இது ஊகம் அல்ல, இடைவெளியாக பதிவு செய்யப்படும்.',
  'food.symptomTitle': 'இது அவசர வரி அல்ல',
  'food.symptomBody':
    'நீங்கள் உடல் நலம் இல்லாவிட்டால், மலம் + தொடர்பு தாவலில் உள்ள மருத்துவமனை எண்ணை அழைக்கவும், அல்லது 995. இந்த தளம் அறிகுறிகளை வகைப்படுத்தாது.',
  'food.forHospital': '{hospital} க்கு மட்டும் பதிலளிக்கிறோம்.',
  'food.chickenTitle': 'Chicken rice — பிரிக்கவும், ஒரே ஆம்/இல்லை அல்ல',
  'food.chickenBody':
    'வெள்ளை சோறு அனுமதிக்கப்படலாம். வெள்ளரி அலங்காரம் இல்லை. மிளகாய் மற்றும் எண்ணெய் சோறு பெயரிடப்படவில்லை. சாதாரண வெள்ளை சோறும் ஆவியில் வேகவைத்த கோழியும் கேளுங்கள், வெள்ளரி வேண்டாம்.',
  'food.splitRice': 'சோறு',
  'food.splitRiceBody': 'வெள்ளை சோறு சுத்திகரிக்கப்பட்ட மாவு (R1).',
  'food.splitCucumber': 'வெள்ளரி அலங்காரம்',
  'food.splitCucumberBody': 'காய்கறிகள் விலக்கப்பட்டுள்ளன (R3).',
  'food.splitChilli': 'மிளகாய் / எண்ணெய் சோறு',
  'food.splitChilliBody': 'தாளில் பெயரிடப்படவில்லை.',
  'rule.R1': 'சுத்திகரிக்கப்பட்ட மாவு அனுமதி',
  'rule.R2': 'மெலிந்த புரதம் அனுமதி',
  'rule.R3': 'தாவர நார் இல்லை',
  'rule.R4': 'பால் பொருள் இல்லை, தாவர பால் இல்லை',
  'rule.R5': 'வறுத்தது இல்லை',
  'rule.R6': 'தோல் இல்லை',
  'rule.Q1': 'திறந்தது: வெளிர் பழச்சாறு',
  'rule.Q2': 'திறந்தது: அரிசி தானியம்',
  'rule.Q3': 'திறந்தது: சாதாரண prata',
  'rule.Q4': 'திறந்தது: சீஸ்',
  'rule.Q5': 'திறந்தது: சைவ புரதம்',
  'rule.Q6': 'திறந்தது: தெளிவான சூப்',
  'rule.Q7': 'திறந்தது: வெள்ளை இனிப்பு',
  'rule.F1': 'முரண்: Plavix / clopidogrel நேரம்',
  'rule.F2': 'இடைவெளி: SGLT2',
  'rule.F5': 'முரண்: காபி/டீயில் பால்',
  'rule.F6': 'முரண்: பழச்சாறு',
  'rule.F7': 'இடைவெளி: prata vs வறுத்த உணவு',
  'rule.HOSP': 'இந்த மருத்துவமனையை மட்டும் பின்பற்று',
  'rule.SCOPE': 'விதிகளுக்கு வெளியே',
}
