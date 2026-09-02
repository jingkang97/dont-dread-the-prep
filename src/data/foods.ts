import { HOSPITALS, type HospitalId } from './hospitals'

export type Verdict = 'yes' | 'no' | 'ask'
export type RuleId =
  | 'R1'
  | 'R2'
  | 'R3'
  | 'R4'
  | 'R5'
  | 'R6'
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'Q6'
  | 'Q7'
  | 'F1'
  | 'F2'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'HOSP'
  | 'SCOPE'

export type FoodEntry = {
  id: string
  name: string
  aliases: string[]
  defaultVerdict: Verdict
  rules: RuleId[]
  source: string
  why: string
  byHospital?: Partial<Record<HospitalId, { verdict: Verdict; why: string; source: string }>>
}

export const RULES: Record<RuleId, { title: string; text: string }> = {
  R1: {
    title: 'Refined starches allowed',
    text: 'White bread, white rice, plain biscuits, plain noodles, kway teow, mee sua, bee hoon, idli, iddiyappam permitted. Brown rice, wholemeal, chapatti, oats, wholegrain cereal excluded.',
  },
  R2: {
    title: 'Lean protein allowed',
    text: 'Fish, chicken, pork, eggs, shellfish, tofu, taukwa, mock meat permitted. Beef, mutton, duck excluded.',
  },
  R3: {
    title: 'No plant fibre',
    text: 'Fruit, vegetables, pulses, nuts and seeds excluded across SGH, SKH and CGH sheets.',
  },
  R4: {
    title: 'No dairy, no plant milks',
    text: 'Cow, goat, soy, almond and oat milk excluded. Yoghurt, cheese, cream soup, Milo, Horlicks, Ovaltine excluded.',
  },
  R5: {
    title: 'Nothing fried',
    text: 'Fried food is explicitly excluded on the SGH yellow form.',
  },
  R6: {
    title: 'No skins',
    text: 'Potato and yam allowed only peeled. Stated on the SGH form.',
  },
  Q1: {
    title: 'Open: light fruit juice',
    text: 'SKH permits light-coloured juice (apple, pear). SGH forbids all fruit juices. Pending gastroenterologist ruling.',
  },
  Q2: {
    title: 'Open: rice cereal',
    text: 'SKH permits rice cereal. SGH forbids cereal without qualification.',
  },
  Q3: {
    title: 'Open: plain prata',
    text: 'SGH lists prata as allowed and separately forbids fried food. Prata is cooked in oil.',
  },
  Q4: {
    title: 'Open: cheese',
    text: 'ESGE lists cheese as a low-residue example. All three Singapore sheets exclude it.',
  },
  Q5: {
    title: 'Open: vegetarian protein',
    text: 'Once pulses (R3) and dairy/plant milks (R4) are excluded, remaining protein is tofu/mock meat. Sheets do not address vegan/vegetarian patients.',
  },
  Q6: {
    title: 'Open: strained clear soup',
    text: 'SGH says clear soup with no vegetables. SKH says clear soup. Ambiguous in practice.',
  },
  Q7: {
    title: 'Open: white sweets',
    text: 'SGH mentions Mentos and Polo only if hungry or dizzy — not as a general food.',
  },
  F1: {
    title: 'Conflict: Plavix / clopidogrel timing',
    text: 'TTSH: stop Plavix 7 days before. SGH/NCCS annex: 5 days for clopidogrel. Clinical variation — this tool never adjudicates.',
  },
  F2: {
    title: 'Gap: SGLT2 inhibitors',
    text: 'TTSH: stop 2 days before. SGH yellow form is silent. Until SGH position is confirmed, return ask your care team.',
  },
  F5: {
    title: 'Conflict: milk in coffee/tea',
    text: 'TTSH permits coffee/tea with or without milk. SGH: no milk. SKH: no milk (and avoids coffee/tea as dark liquids). CGH: Milo without milk.',
  },
  F6: {
    title: 'Conflict: fruit juice',
    text: 'SKH permits light-coloured juice. SGH forbids all fruit juices.',
  },
  F7: {
    title: 'Gap: prata vs fried food',
    text: 'Internal contradiction on the SGH form itself.',
  },
  HOSP: {
    title: 'Follow this hospital only',
    text: 'Answer uses the selected hospital’s sheet. Other hospitals may differ. This tool never averages.',
  },
  SCOPE: {
    title: 'Outside the ruleset',
    text: 'Standing safety rule: anything that cannot be classified by an approved rule returns ask your care team. The tool never improvises.',
  },
}

export const FOODS: FoodEntry[] = [
  {
    id: 'white-bread',
    name: 'Plain white bread',
    aliases: ['white bread', 'plain bread', 'toast', 'bread'],
    defaultVerdict: 'yes',
    rules: ['R1'],
    source: 'SGH/NCCS yellow form — Can eat: plain white bread / biscuit',
    why: 'Refined starch. On the day of an SGH morning slot, bread must be plain — no kaya, butter, or jam.',
  },
  {
    id: 'kaya-toast',
    name: 'Kaya toast',
    aliases: ['kaya', 'kaya toast', 'butter toast', 'jam'],
    defaultVerdict: 'ask',
    rules: ['R1', 'HOSP'],
    source: 'SGH/NCCS yellow form — 3 days before: kaya/butter okay; day of: no kaya/butter/jam',
    why: 'Allowed during the 3-day low-residue window at SGH, but not on the morning of the scope.',
    byHospital: {
      sgh: {
        verdict: 'ask',
        why: 'SGH allows kaya/butter on the 3-day diet, but forbids them on the morning of the scope. Which day are you asking about?',
        source: 'SGH/NCCS yellow form',
      },
      nccs: {
        verdict: 'ask',
        why: 'Shared SGH/NCCS form: kaya/butter okay on diet days, not on the morning of scope.',
        source: 'SGH/NCCS yellow form',
      },
    },
  },
  {
    id: 'white-rice',
    name: 'White rice',
    aliases: ['white rice', 'rice'],
    defaultVerdict: 'yes',
    rules: ['R1'],
    source: 'SGH/NCCS yellow form — Can eat: white rice. SKH diet advice — white rice / porridge allowed.',
    why: 'Refined starch. Brown rice is not allowed.',
  },
  {
    id: 'chicken-rice-rice',
    name: 'Chicken rice (the rice)',
    aliases: ['chicken rice rice', 'chicken rice (rice)'],
    defaultVerdict: 'yes',
    rules: ['R1'],
    source: 'SGH/NCCS yellow form — white rice allowed',
    why: 'The rice itself is a refined starch. Skip cucumber, chilli, dark soy, and oily rice if you can ask for plain.',
  },
  {
    id: 'chicken-rice-cucumber',
    name: 'Chicken rice cucumber garnish',
    aliases: ['cucumber', 'chicken rice cucumber'],
    defaultVerdict: 'no',
    rules: ['R3'],
    source: 'SGH/NCCS yellow form — Cannot eat: fruits, vegetables',
    why: 'Vegetables are excluded under the no-plant-fibre rule.',
  },
  {
    id: 'chicken-rice',
    name: 'Chicken rice',
    aliases: ['chicken rice', 'hnk', 'hainanese'],
    defaultVerdict: 'ask',
    rules: ['R1', 'R3', 'R5'],
    source: 'Doc 03 sample list splits chicken rice (rice) vs cucumber garnish',
    why: 'The rice can be yes; the cucumber garnish is no. Oily rice and chilli are not named on the sheet.',
  },
  {
    id: 'porridge',
    name: 'Plain porridge',
    aliases: ['porridge', 'plain porridge', 'congee', 'fish porridge', 'chicken porridge'],
    defaultVerdict: 'yes',
    rules: ['R1', 'R2'],
    source: 'SGH/NCCS yellow form — Can eat: porridge (fish/chicken)',
    why: 'Plain white porridge with fish or chicken is listed. Keep vegetables and century-egg garnishes off.',
  },
  {
    id: 'century-egg-porridge',
    name: 'Century egg porridge',
    aliases: ['century egg', 'pidan', 'century egg porridge'],
    defaultVerdict: 'ask',
    rules: ['R2', 'SCOPE'],
    source: 'Doc 03 sample list — not named on hospital sheets',
    why: 'Eggs are allowed, but century egg porridge is not named. Standing rule: do not improvise.',
  },
  {
    id: 'mee-goreng',
    name: 'Mee goreng',
    aliases: ['mee goreng', 'mi goreng', 'fried noodles'],
    defaultVerdict: 'no',
    rules: ['R5', 'R3'],
    source: 'SGH/NCCS yellow form — Cannot eat: fried food; vegetables',
    why: 'Fried, and typically cooked with vegetables.',
  },
  {
    id: 'char-kway-teow',
    name: 'Char kway teow',
    aliases: ['char kway teow', 'ckt', 'char kway', 'fried kway teow'],
    defaultVerdict: 'no',
    rules: ['R5', 'R3'],
    source: 'SGH/NCCS yellow form — Cannot eat: fried food',
    why: 'Fried noodle dish. Plain (not fried) kway teow soup is listed as allowed.',
  },
  {
    id: 'bak-chor-mee',
    name: 'Bak chor mee',
    aliases: ['bak chor mee', 'bcm', 'minced meat noodles'],
    defaultVerdict: 'no',
    rules: ['R3', 'R5'],
    source: 'SGH/NCCS yellow form — Cannot eat: vegetables, fried food',
    why: 'Typically served with vegetables, vinegar, and fried shallots — none of which the sheet permits.',
  },
  {
    id: 'fishball-noodle',
    name: 'Fishball noodle soup',
    aliases: ['fishball', 'fish ball', 'fishball noodle', 'fishball noodles'],
    defaultVerdict: 'ask',
    rules: ['R1', 'R2', 'R3'],
    source: 'SGH/NCCS yellow form — plain kway teow / mee sua / bee hoon soup allowed',
    why: 'Plain noodle soup and fish (lean protein) can be yes. Hawker fishball soup almost always includes vegetables. Ask for no veg, or ask your care team.',
  },
  {
    id: 'plain-noodles',
    name: 'Plain noodles / bee hoon soup',
    aliases: ['bee hoon', 'mee sua', 'kway teow', 'plain noodles', 'pasta', 'plain pasta', 'noodle soup'],
    defaultVerdict: 'yes',
    rules: ['R1'],
    source: 'SGH/NCCS yellow form — plain pasta/noodles; plain kway teow / mee sua / bee hoon soup',
    why: 'Refined noodles, not fried, no vegetables.',
  },
  {
    id: 'prata',
    name: 'Plain roti prata',
    aliases: ['prata', 'roti prata', 'roti canai', 'plain prata'],
    defaultVerdict: 'ask',
    rules: ['Q3', 'F7', 'R5'],
    source: 'SGH/NCCS yellow form lists prata as allowed AND forbids fried food. Doc 03 Q3.',
    why: 'Prata is cooked in oil. This is an internal contradiction on the SGH form, not something this tool will guess.',
  },
  {
    id: 'prata-dhal',
    name: 'Roti prata with dhal',
    aliases: ['prata with dhal', 'dhal', 'dal', 'dhal curry'],
    defaultVerdict: 'no',
    rules: ['R3', 'Q3'],
    source: 'R3 no pulses. Doc 03 sample list.',
    why: 'Dhal is pulses — excluded even if plain prata were allowed.',
  },
  {
    id: 'thosai',
    name: 'Plain thosai',
    aliases: ['thosai', 'dosa', 'plain thosai', 'plain dosa'],
    defaultVerdict: 'ask',
    rules: ['R1', 'HOSP'],
    source: 'SGH/NCCS yellow form — Can eat: plain thosai / prata / idiyappam (white sugar only)',
    why: 'Named as allowed on the SGH form. Not named on SKH/TTSH/CGH sheets.',
    byHospital: {
      sgh: {
        verdict: 'yes',
        why: 'Explicitly listed on the SGH/NCCS yellow form, white sugar only. Skip coconut chutney and dhal.',
        source: 'SGH/NCCS yellow form — Can eat: plain thosai',
      },
      nccs: {
        verdict: 'yes',
        why: 'Shared SGH/NCCS yellow form lists plain thosai.',
        source: 'SGH/NCCS yellow form',
      },
    },
  },
  {
    id: 'idli',
    name: 'Idli',
    aliases: ['idli', 'idly'],
    defaultVerdict: 'yes',
    rules: ['R1'],
    source: 'SGH form (idiyappam/thosai family) and SKH diet advice — idli allowed',
    why: 'Refined steamed starch. Skip coconut chutney and sambar (pulses/vegetables).',
  },
  {
    id: 'idiyappam',
    name: 'Idiyappam / putu mayam',
    aliases: ['idiyappam', 'iddiyappam', 'putu mayam', 'string hopper'],
    defaultVerdict: 'yes',
    rules: ['R1'],
    source: 'SGH/NCCS yellow form; SKH diet advice — iddiyappam (putu mayam)',
    why: 'Named refined starch. White sugar only on the SGH form.',
  },
  {
    id: 'chapati',
    name: 'Chapati',
    aliases: ['chapati', 'chapatti', 'roti', 'wholemeal roti'],
    defaultVerdict: 'no',
    rules: ['R1'],
    source: 'SKH diet advice — avoid chapatti. R1 wholegrain excluded.',
    why: 'Wholegrain / atta flour. Refined-starch rule excludes it.',
  },
  {
    id: 'nasi-lemak',
    name: 'Nasi lemak',
    aliases: ['nasi lemak'],
    defaultVerdict: 'no',
    rules: ['R3', 'R5', 'R4'],
    source: 'SGH/NCCS yellow form — vegetables, fried food, coconut/milk products not permitted',
    why: 'Cucumber, sambal, fried items, and coconut milk sit outside the allowed list.',
  },
  {
    id: 'mee-rebus',
    name: 'Mee rebus',
    aliases: ['mee rebus', 'mi rebus'],
    defaultVerdict: 'no',
    rules: ['R3'],
    source: 'R3 no plant fibre — gravy typically includes sweet potato and garnishes',
    why: 'Not a plain noodle soup. Vegetable gravy and garnishes are excluded.',
  },
  {
    id: 'lontong',
    name: 'Lontong',
    aliases: ['lontong'],
    defaultVerdict: 'no',
    rules: ['R3', 'R4'],
    source: 'R3 vegetables/pulses; coconut gravy not on the allowed drink/food list',
    why: 'Coconut gravy, vegetables, and compressed rice cake accompaniments are not permitted.',
  },
  {
    id: 'tau-huay',
    name: 'Tau huay',
    aliases: ['tau huay', 'tauhuey', 'tau suan', 'douhua', 'soya beancurd', 'bean curd dessert'],
    defaultVerdict: 'ask',
    rules: ['R4', 'SCOPE'],
    source: 'R4 excludes soy milk. Tofu is allowed as a savoury protein. Tau huay is not named.',
    why: 'Standing rule: do not improvise a dessert classification from the tofu line.',
  },
  {
    id: 'soy-milk',
    name: 'Soy milk',
    aliases: ['soy milk', 'soya milk', 'soy', 'soya', 'plant milk', 'almond milk', 'oat milk'],
    defaultVerdict: 'no',
    rules: ['R4'],
    source: 'SGH/NCCS yellow form — Cannot drink: milk products (cow, goat, soy, almond, oat)',
    why: 'Plant milks are excluded alongside dairy.',
  },
  {
    id: 'kopi-o',
    name: 'Kopi-o / tea-o with sugar',
    aliases: ['kopi-o', 'kopi o', 'kopio', 'tea-o', 'teh-o', 'teh o', 'tea o', 'black coffee', 'black tea'],
    defaultVerdict: 'ask',
    rules: ['HOSP', 'F5'],
    source: 'Hospital instruction audit — coffee/tea rules differ',
    why: 'Depends on hospital. SGH allows coffee/tea with no milk. SKH avoids coffee/tea as dark liquids.',
    byHospital: {
      sgh: {
        verdict: 'yes',
        why: 'SGH allows coffee/tea with no milk, and tea-O with sugar on the morning of scope.',
        source: 'SGH/NCCS yellow form — Can drink: coffee/tea (no milk); day of: tea ’O’ + sugar',
      },
      nccs: {
        verdict: 'yes',
        why: 'Shared SGH/NCCS form allows coffee/tea with no milk.',
        source: 'SGH/NCCS yellow form',
      },
      ttsh: {
        verdict: 'yes',
        why: 'TTSH permits coffee or tea with or without milk during the three-day period.',
        source: 'TTSH brochure March 2026',
      },
      skh: {
        verdict: 'no',
        why: 'SKH diet advice lists coffee/tea as dark-coloured liquids to avoid.',
        source: 'SKH diet advice — Avoid: dark coloured liquids e.g. coffee/tea',
      },
      cgh: {
        verdict: 'yes',
        why: 'CGH specifies drinks without milk (e.g. Milo without milk). Kopi-o is the no-milk version — still confirm if CGH treats coffee as allowed.',
        source: 'Hospital instruction audit v2 — CGH: no milk',
      },
    },
  },
  {
    id: 'kopi-milk',
    name: 'Kopi / teh with milk',
    aliases: ['kopi', 'teh', 'coffee with milk', 'tea with milk', 'latte', 'cappuccino', 'kopi si', 'kopi peng'],
    defaultVerdict: 'ask',
    rules: ['F5', 'R4', 'HOSP'],
    source: 'F5 — hospitals disagree on milk in coffee/tea. This tool never adjudicates.',
    why: 'TTSH allows milk. SGH, SKH and CGH do not. Your hospital’s sheet is the only answer.',
    byHospital: {
      sgh: {
        verdict: 'no',
        why: 'SGH specifies coffee and tea with no milk.',
        source: 'SGH/NCCS yellow form — Can drink: coffee/tea (no milk)',
      },
      nccs: {
        verdict: 'no',
        why: 'Shared SGH/NCCS form: no milk in coffee/tea.',
        source: 'SGH/NCCS yellow form',
      },
      ttsh: {
        verdict: 'yes',
        why: 'TTSH explicitly permits coffee and tea with or without milk. Other hospitals do not — this is not an error, it is TTSH’s sheet.',
        source: 'TTSH brochure March 2026',
      },
      skh: {
        verdict: 'no',
        why: 'SKH excludes milk, soy milk, and malted drinks, and lists coffee/tea as dark liquids to avoid.',
        source: 'SKH diet advice',
      },
      cgh: {
        verdict: 'no',
        why: 'CGH specifies no milk (Milo without milk).',
        source: 'Hospital instruction audit v2',
      },
    },
  },
  {
    id: 'milo',
    name: 'Milo / Horlicks / Ovaltine',
    aliases: ['milo', 'horlicks', 'ovaltine', 'malted'],
    defaultVerdict: 'no',
    rules: ['R4'],
    source: 'SGH/NCCS yellow form — Cannot drink: Milo, Ovaltine. SKH: malted drinks. R4.',
    why: 'Malted milk drinks are excluded on every sheet we have.',
    byHospital: {
      cgh: {
        verdict: 'ask',
        why: 'CGH specifies Milo without milk — which is a different instruction from SGH (Milo forbidden). Ask your CGH care team which they mean, rather than this tool averaging the two.',
        source: 'Hospital instruction audit v2 — CGH: Milo without milk',
      },
    },
  },
  {
    id: 'bandung',
    name: 'Bandung',
    aliases: ['bandung', 'sirap bandung', 'rose syrup'],
    defaultVerdict: 'no',
    rules: ['R4'],
    source: 'R4 no dairy. SGH forbids milk products.',
    why: 'Bandung is milk plus rose syrup.',
  },
  {
    id: 'hundred-plus',
    name: '100Plus / colourless isotonic drinks',
    aliases: ['100 plus', '100plus', '100+', 'pocari', 'sprite', '7-up', '7up', 'isotonic', 'colourless soft drink'],
    defaultVerdict: 'yes',
    rules: ['HOSP'],
    source: 'SGH/NCCS yellow form — colourless soft drinks (100Plus, Pocari, Sprite, 7-Up)',
    why: 'Named clear fluids. Avoid red or dark-coloured drinks.',
  },
  {
    id: 'apple-juice',
    name: 'Apple juice / fruit juice',
    aliases: ['apple juice', 'pear juice', 'fruit juice', 'juice', 'orange juice', 'grape juice'],
    defaultVerdict: 'ask',
    rules: ['Q1', 'F6', 'HOSP'],
    source: 'Doc 03 Q1. SKH permits light-coloured juice. SGH forbids all fruit juices.',
    why: 'Hospital conflict. This tool will not average SGH and SKH.',
    byHospital: {
      sgh: {
        verdict: 'no',
        why: 'SGH explicitly forbids all fruit juices.',
        source: 'SGH/NCCS yellow form — Cannot drink: fruit juices',
      },
      nccs: {
        verdict: 'no',
        why: 'Shared SGH/NCCS form forbids fruit juices.',
        source: 'SGH/NCCS yellow form',
      },
      skh: {
        verdict: 'yes',
        why: 'SKH permits light-coloured juice (apple, pear). Dark juices (grape, prune, tomato) are still avoided.',
        source: 'SKH diet advice — Allowed: light coloured juice e.g. apple/pear juice',
      },
      ttsh: {
        verdict: 'ask',
        why: 'TTSH sheet is silent on fruit juice. Silent ≠ permitted.',
        source: 'Hospital instruction audit v2 — TTSH: silent',
      },
      cgh: {
        verdict: 'ask',
        why: 'CGH sheet is silent on fruit juice. Silent ≠ permitted.',
        source: 'Hospital instruction audit v2 — CGH: silent',
      },
    },
  },
  {
    id: 'barley',
    name: 'Barley water, no pearls',
    aliases: ['barley', 'barley water'],
    defaultVerdict: 'yes',
    rules: ['HOSP'],
    source: 'SGH/NCCS yellow form — Can drink: barley water (no pearls)',
    why: 'Named on the SGH form. No pearls, no grass jelly.',
  },
  {
    id: 'steamed-fish',
    name: 'Steamed fish',
    aliases: ['steamed fish', 'fish', 'steam fish'],
    defaultVerdict: 'yes',
    rules: ['R2'],
    source: 'SGH/NCCS yellow form — Can eat: fish. SKH: fish allowed.',
    why: 'Lean protein. Not fried. Skip chilli, vegetables, and thick sauces.',
  },
  {
    id: 'steamed-egg',
    name: 'Steamed / boiled egg',
    aliases: ['steamed egg', 'boiled egg', 'poached egg', 'egg', 'eggs'],
    defaultVerdict: 'yes',
    rules: ['R2'],
    source: 'SGH/NCCS yellow form — eggs (boiled, poached). SKH: eggs allowed.',
    why: 'Lean protein. Fried eggs are a different question (R5).',
  },
  {
    id: 'fried-egg',
    name: 'Fried egg',
    aliases: ['fried egg', 'sunny side', 'omelette', 'omelet'],
    defaultVerdict: 'no',
    rules: ['R5'],
    source: 'SGH/NCCS yellow form — Cannot eat: fried food',
    why: 'Nothing fried.',
  },
  {
    id: 'yong-tau-foo-fishcake',
    name: 'Yong tau foo — fishcake / tofu only',
    aliases: ['fishcake', 'yong tau foo fishcake'],
    defaultVerdict: 'yes',
    rules: ['R2'],
    source: 'Doc 03 sample list; R2 lean protein / tofu allowed',
    why: 'Fishcake and plain tofu can be yes. The vegetable stuffed items cannot.',
  },
  {
    id: 'yong-tau-foo',
    name: 'Yong tau foo (with vegetables)',
    aliases: ['yong tau foo', 'yong tau fu', 'ytf'],
    defaultVerdict: 'no',
    rules: ['R3'],
    source: 'Doc 03 sample list — yong tau foo (with vegetables) = no',
    why: 'Vegetables are excluded. You can ask for tofu and fishcake only, in clear soup with no veg.',
  },
  {
    id: 'tofu',
    name: 'Plain tofu / taukwa',
    aliases: ['tofu', 'taukwa', 'tau kwa', 'beancurd', 'bean curd'],
    defaultVerdict: 'yes',
    rules: ['R2'],
    source: 'SGH/NCCS yellow form — plain tofu. SKH: tofu, taukwa, vegetarian mock meat.',
    why: 'Named lean protein. Not fried. Mock meat is allowed if it is not wholegrain/gluten-heavy — SGH says vegetarian mock meat (no gluten).',
  },
  {
    id: 'chicken',
    name: 'Chicken / pork / seafood',
    aliases: ['chicken', 'pork', 'seafood', 'prawn', 'prawns', 'shrimp', 'shellfish'],
    defaultVerdict: 'yes',
    rules: ['R2'],
    source: 'SGH/NCCS yellow form — fish / chicken / pork / seafood. SKH same.',
    why: 'Lean protein, not fried, no skin-on fatty cuts. Red meat is a different answer.',
  },
  {
    id: 'red-meat',
    name: 'Red meat (beef, mutton, duck)',
    aliases: ['beef', 'mutton', 'lamb', 'duck', 'steak', 'red meat'],
    defaultVerdict: 'no',
    rules: ['R2'],
    source: 'SGH/NCCS yellow form — Cannot eat: red meat (beef, mutton, duck)',
    why: 'Red meat is excluded even though chicken and pork are allowed.',
  },
  {
    id: 'fruit',
    name: 'Fruit',
    aliases: ['fruit', 'apple', 'banana', 'orange', 'papaya', 'watermelon', 'grape', 'berries'],
    defaultVerdict: 'no',
    rules: ['R3'],
    source: 'SGH/NCCS yellow form — Cannot eat: fruits. SKH: avoid ALL fruits and vegetables.',
    why: 'No plant fibre. Juice is a separate, hospital-specific question.',
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    aliases: ['vegetable', 'vegetables', 'salad', 'broccoli', 'spinach', 'kai lan', 'chye', 'lettuce', 'tomato'],
    defaultVerdict: 'no',
    rules: ['R3'],
    source: 'SGH/NCCS yellow form — Cannot eat: vegetables. SKH: avoid ALL fruits and vegetables.',
    why: 'No plant fibre, including garnishes.',
  },
  {
    id: 'wholegrain',
    name: 'Wholegrain / oats / brown rice',
    aliases: ['brown rice', 'wholemeal', 'wholegrain', 'oats', 'oatmeal', 'bran', 'cereal', 'muesli'],
    defaultVerdict: 'no',
    rules: ['R1', 'Q2'],
    source: 'SGH: cereal not allowed. SKH: rice cereal allowed, brown rice/oats not.',
    why: 'Wholegrain is out. Rice cereal is a hospital-specific exception — ask as “rice cereal”.',
  },
  {
    id: 'rice-cereal',
    name: 'Rice cereal',
    aliases: ['rice cereal', 'rice bubbles', 'rice krispies'],
    defaultVerdict: 'ask',
    rules: ['Q2', 'HOSP'],
    source: 'Doc 03 Q2. SKH permits rice cereal. SGH forbids cereal without qualification.',
    why: 'Hospital conflict / gap.',
    byHospital: {
      sgh: {
        verdict: 'no',
        why: 'SGH forbids cereal without qualification.',
        source: 'SGH/NCCS yellow form — Cannot eat: cereal, oats, wholemeal bread',
      },
      nccs: {
        verdict: 'no',
        why: 'Shared SGH/NCCS form forbids cereal.',
        source: 'SGH/NCCS yellow form',
      },
      skh: {
        verdict: 'yes',
        why: 'SKH diet advice lists rice cereal as allowed.',
        source: 'SKH diet advice — Allowed: rice cereal',
      },
      ttsh: {
        verdict: 'no',
        why: 'TTSH sheet: cereal not allowed.',
        source: 'Hospital instruction audit v2',
      },
      cgh: {
        verdict: 'ask',
        why: 'CGH sheet discusses wholegrain rather than naming rice cereal. Silent ≠ permitted.',
        source: 'Hospital instruction audit v2 — CGH: wholegrain only called out',
      },
    },
  },
  {
    id: 'cheese',
    name: 'Cheese / yoghurt',
    aliases: ['cheese', 'yoghurt', 'yogurt', 'cream', 'butter'],
    defaultVerdict: 'no',
    rules: ['R4', 'Q4'],
    source: 'All three Singapore sheets exclude dairy. ESGE lists cheese as an example low-residue food — local sheets do not.',
    why: 'Follow the local sheet, not the European example list. Q4 flags this as a convention, not a puzzle for the bot to solve.',
  },
  {
    id: 'milk',
    name: 'Milk',
    aliases: ['milk', 'fresh milk', 'cow milk', 'dairy'],
    defaultVerdict: 'no',
    rules: ['R4'],
    source: 'SGH/NCCS yellow form — milk products excluded',
    why: 'Dairy is out. Milk-in-kopi is a separate hospital-specific question.',
  },
  {
    id: 'nuts',
    name: 'Nuts, seeds, beans, lentils',
    aliases: ['nuts', 'seeds', 'beans', 'lentils', 'dhal', 'tempeh', 'pulses'],
    defaultVerdict: 'no',
    rules: ['R3'],
    source: 'R3. SKH: avoid tempeh, beans, lentils, nuts & seeds.',
    why: 'Plant fibre / pulses.',
  },
  {
    id: 'potato',
    name: 'Peeled potato / yam',
    aliases: ['potato', 'yam', 'mashed potato'],
    defaultVerdict: 'yes',
    rules: ['R6'],
    source: 'SGH/NCCS yellow form — potato / yam (no skin)',
    why: 'Allowed only peeled. Fries are fried (R5) and are no.',
  },
  {
    id: 'fries',
    name: 'Fries / fried food',
    aliases: ['fries', 'french fries', 'fried', 'goreng', 'you tiao', 'youtiao'],
    defaultVerdict: 'no',
    rules: ['R5'],
    source: 'SGH/NCCS yellow form — Cannot eat: fried food',
    why: 'Nothing fried.',
  },
  {
    id: 'clear-soup',
    name: 'Clear soup',
    aliases: ['clear soup', 'soup', 'broth'],
    defaultVerdict: 'ask',
    rules: ['Q6'],
    source: 'Doc 03 Q6 — SGH: clear soup with no vegetables. SKH: clear soup. Ambiguous once vegetables are strained.',
    why: 'If the soup is clear and has no vegetables in the bowl, SGH’s line supports it. Straining vegetables out is the open question.',
  },
  {
    id: 'mentos',
    name: 'Mentos / Polo',
    aliases: ['mentos', 'polo', 'sweet', 'sweets', 'candy'],
    defaultVerdict: 'ask',
    rules: ['Q7'],
    source: 'SGH/NCCS yellow form mentions Mentos/Polo only if hungry or dizzy',
    why: 'Not a general snack. Only the “hungry or dizzy” line names them.',
  },
  {
    id: 'water',
    name: 'Plain water',
    aliases: ['water', 'plain water', 'ice', 'ice cubes'],
    defaultVerdict: 'yes',
    rules: ['HOSP'],
    source: 'SGH/NCCS yellow form — Can drink: plain water. Stop according to your hospital’s fluid cutoff.',
    why: 'Always the default clear fluid, until your fasting cutoff.',
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    aliases: ['alcohol', 'beer', 'wine', 'whisky', 'soju'],
    defaultVerdict: 'no',
    rules: ['HOSP'],
    source: 'SGH/NCCS yellow form — Cannot drink: alcoholic beverages',
    why: 'Named exclusion.',
  },
]

export const MED_PATTERNS: { test: RegExp; id: string; name: string; rules: RuleId[]; source: string; why: string; byHospital?: FoodEntry['byHospital'] }[] = [
  {
    test: /\b(sglt2|empagliflozin|dapagliflozin|jardiance|forxiga|canagliflozin|invokana)\b/i,
    id: 'sglt2',
    name: 'SGLT2 inhibitors',
    rules: ['F2'],
    source: 'TTSH brochure March 2026; SGH yellow form is silent',
    why: 'TTSH: stop 2 days before. SGH form does not mention this class. Gap → ask your care team for SGH/NCCS.',
    byHospital: {
      ttsh: {
        verdict: 'ask',
        why: 'TTSH instructs stopping SGLT2 inhibitors 2 days before — still confirm against the list your counsellor wrote down. This is a medication instruction, not a food rule.',
        source: 'TTSH brochure March 2026',
      },
      sgh: {
        verdict: 'ask',
        why: 'The SGH yellow form is silent on SGLT2 inhibitors. Silent ≠ continue, and silent ≠ stop. Ask your care team.',
        source: 'SGH/NCCS yellow form (silent) · F2',
      },
      nccs: {
        verdict: 'ask',
        why: 'Shared SGH/NCCS form is silent on SGLT2 inhibitors. Ask your care team.',
        source: 'SGH/NCCS yellow form (silent) · F2',
      },
    },
  },
  {
    test: /\b(plavix|clopidogrel|aspirin|warfarin|anticoagulant|blood thinner|iron|anti-diarrh)/i,
    id: 'blood-thinners',
    name: 'Blood thinners / iron / anti-diarrhoeals',
    rules: ['F1'],
    source: 'SGH/NCCS handwritten annex (5 days); TTSH brochure (Plavix 7 days)',
    why: 'Hospitals differ, and the right stop date depends on why you are on the drug. This tool never adjudicates F1.',
    byHospital: {
      sgh: {
        verdict: 'ask',
        why: 'SGH/NCCS annex: 5 days for clopidogrel, plus aspirin/warfarin/anticoagulants — but that annex is handwritten and separate from the yellow form. Follow what was written for you, not a generic number.',
        source: 'SGH/NCCS handwritten medication annex · F1 / F3',
      },
      nccs: {
        verdict: 'ask',
        why: 'Same SGH/NCCS annex. Follow the handwritten stop dates you were given.',
        source: 'SGH/NCCS handwritten medication annex · F1 / F3',
      },
      ttsh: {
        verdict: 'ask',
        why: 'TTSH: iron, Plavix and anti-diarrhoeals at 7 days. That is TTSH’s sheet, not a universal rule. Confirm against your brochure.',
        source: 'TTSH brochure March 2026 · F1',
      },
    },
  },
]

export type ChatAnswer = {
  verdict: Verdict
  title: string
  body: string
  source: string
  rules: RuleId[]
  matched: string
  split?: { title: string; verdict: Verdict; body: string }[]
}

const DEFLECT: ChatAnswer = {
  verdict: 'ask',
  title: 'Ask your care team',
  body: 'That sits outside the signed food ruleset. This assistant only classifies foods and a few named medication flags against your hospital’s sheet. It will not invent an answer.',
  source: 'Doc 03 standing safety rule — never improvise a classification',
  rules: ['SCOPE'],
  matched: 'out of scope',
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9+ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeFoodQuestion(q: string) {
  return (
    /\b(eat|ate|drink|have|take|kopi|teh|milo|prata|rice|noodle|bread|soup|juice|milk|fish|chicken|egg)\b/.test(q) ||
    q.split(' ').length <= 6
  )
}

export function classify(raw: string, hospitalId: HospitalId): ChatAnswer {
  const q = norm(raw)
  if (!q) {
    return { ...DEFLECT, body: 'Type a food or drink — for example, “can I have prata?”' }
  }

  if (/\b(pain|vomit|blood|faint|emergency|chest|allergic)\b/.test(q)) {
    return {
      verdict: 'ask',
      title: 'This is not an emergency line',
      body: 'If you feel unwell, call your hospital’s number from the Stool + contact tab, or 995. This site cannot triage symptoms.',
      source: 'Safety deflection — outside the ruleset',
      rules: ['SCOPE'],
      matched: 'symptom',
    }
  }

  for (const med of MED_PATTERNS) {
    if (med.test.test(raw) || med.test.test(q)) {
      const override = med.byHospital?.[hospitalId]
      return {
        verdict: override?.verdict ?? 'ask',
        title: med.name,
        body: override?.why ?? med.why,
        source: override?.source ?? med.source,
        rules: med.rules,
        matched: med.name,
      }
    }
  }

  if (/\bchicken rice\b/.test(q) && !/cucumber/.test(q)) {
    return {
      verdict: 'ask',
      title: 'Chicken rice — split, not a single yes/no',
      body: 'The white rice can be allowed. The cucumber garnish is not. Chilli and oily rice are not named. Ask for plain white rice and steamed chicken, no cucumber.',
      source: 'Doc 03 sample list — chicken rice (rice) vs chicken rice (cucumber garnish)',
      rules: ['R1', 'R3', 'R5'],
      matched: 'chicken rice',
      split: [
        { title: 'The rice', verdict: 'yes', body: 'White rice is a refined starch (R1).' },
        { title: 'Cucumber garnish', verdict: 'no', body: 'Vegetables are excluded (R3).' },
        { title: 'Chilli / oily rice', verdict: 'ask', body: 'Not named on the sheet.' },
      ],
    }
  }

  let best: { entry: FoodEntry; alias: string } | undefined
  for (const entry of FOODS) {
    for (const alias of entry.aliases) {
      const a = norm(alias)
      if (!a) continue
      const hit = q === a || q.includes(` ${a} `) || q.startsWith(`${a} `) || q.endsWith(` ${a}`) || q.includes(a)
      if (!hit) continue
      if (!best || a.length > best.alias.length) best = { entry, alias: a }
    }
  }

  if (!best) {
    if (!looksLikeFoodQuestion(q)) return DEFLECT
    return {
      ...DEFLECT,
      title: 'Not in the ruleset',
      body: `“${raw.trim()}” is not a named line on your hospital sheet, and no approved rule classifies it. Ask your care team — this is recorded as a gap, not a guess.`,
      matched: raw.trim(),
    }
  }

  const hospital = HOSPITALS[hospitalId]
  const override = best.entry.byHospital?.[hospitalId]
  const verdict = override?.verdict ?? best.entry.defaultVerdict
  const body = override?.why ?? best.entry.why
  const source = override?.source ?? best.entry.source

  return {
    verdict,
    title: best.entry.name,
    body: `${body} Answering for ${hospital.short} only.`,
    source,
    rules: best.entry.rules,
    matched: best.alias,
  }
}

export const SUGGESTIONS = [
  { query: 'Can I have prata?', label: 'food.s.prata' },
  { query: 'Kopi with milk?', label: 'food.s.kopi' },
  { query: 'Apple juice', label: 'food.s.juice' },
  { query: 'Chicken rice', label: 'food.s.chicken' },
  { query: 'Milo', label: 'food.s.milo' },
  { query: 'White bread', label: 'food.s.bread' },
  { query: 'Thosai', label: 'food.s.thosai' },
  { query: 'Jardiance', label: 'food.s.jardiance' },
] as const
