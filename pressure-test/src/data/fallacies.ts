import type { Fallacy, FallacyCategory } from '../types';

export const FALLACY_CATEGORIES: Record<FallacyCategory, { label: string; description: string }> = {
  relevance: {
    label: 'Relevance',
    description: 'The premises are beside the point — they persuade without bearing on the claim.',
  },
  presumption: {
    label: 'Presumption',
    description: 'The argument smuggles in an unjustified assumption.',
  },
  causal: {
    label: 'Causal',
    description: 'Cause and effect are inferred without warrant.',
  },
  ambiguity: {
    label: 'Ambiguity',
    description: 'A shift in meaning or scope makes the argument look valid.',
  },
  formal: {
    label: 'Formal',
    description: 'The logical structure itself is invalid, regardless of content.',
  },
};

export const FALLACIES: Fallacy[] = [
  // ── Relevance ────────────────────────────────────────────────
  {
    id: 'ad-hominem',
    name: 'Ad Hominem',
    aka: ['Personal attack'],
    category: 'relevance',
    definition: 'Attacking the person making an argument instead of the argument itself.',
    example: '"Why should we listen to her proposal on tax reform? She was divorced twice."',
    flaw: 'Her marital history has no bearing on whether the tax proposal is sound.',
    quizScenarios: [
      '"The study on climate risk was written by a guy who drives an SUV, so it\'s obviously worthless."',
      '"You can\'t trust his code review — he dropped out of college."',
    ],
  },
  {
    id: 'tu-quoque',
    name: 'Tu Quoque',
    aka: ['Appeal to hypocrisy', 'Whataboutism'],
    category: 'relevance',
    definition: 'Deflecting criticism by pointing out that the critic is guilty of the same thing.',
    example: '"My doctor told me to quit smoking, but she smokes too — so I don\'t need to."',
    flaw: 'The doctor\'s hypocrisy doesn\'t change the health effects of smoking.',
    quizScenarios: [
      '"You say I shouldn\'t miss deadlines? You were late on the last sprint yourself."',
      '"Why should our country cut emissions when your country pollutes even more?"',
    ],
  },
  {
    id: 'straw-man',
    name: 'Straw Man',
    aka: [],
    category: 'relevance',
    definition: 'Misrepresenting an opponent\'s position as weaker or more extreme, then refuting that distortion.',
    example:
      'A: "We should have stricter safety inspections for playgrounds." B: "So you want to wrap kids in bubble wrap and ban them from having fun?"',
    flaw: 'B refutes a position A never took; the actual proposal goes unaddressed.',
    quizScenarios: [
      'A: "We could reduce the defense budget by 5%." B: "I can\'t believe you want to leave the country completely defenseless."',
      'A: "I think we should add more tests before release." B: "Right, so you want us to never ship anything ever again."',
    ],
  },
  {
    id: 'red-herring',
    name: 'Red Herring',
    aka: ['Irrelevant conclusion'],
    category: 'relevance',
    definition: 'Introducing an irrelevant topic to divert attention from the original issue.',
    example:
      '"Sure, the factory is polluting the river, but think of all the jobs it provides and how much the community depends on it."',
    flaw: 'Jobs are a separate question; the pollution claim is left unanswered.',
    quizScenarios: [
      'Asked why the project is over budget, the manager replies: "Let\'s not forget how hard this team has worked through a tough year."',
      '"Why worry about the data breach when there are far bigger cybersecurity threats out there, like state-sponsored hackers?"',
    ],
  },
  {
    id: 'appeal-to-authority',
    name: 'Appeal to Authority',
    aka: ['Argumentum ad verecundiam'],
    category: 'relevance',
    definition:
      'Treating a claim as true because an authority said so — especially an authority outside their field of expertise.',
    example: '"A famous actor says this diet cures anxiety, so it must work."',
    flaw: 'Fame isn\'t medical expertise, and even experts\' claims need evidence behind them.',
    quizScenarios: [
      '"A Nobel-winning physicist said this stock will triple, so I\'m buying in."',
      '"My favorite podcaster is really smart, and he says vaccines are dangerous — that settles it."',
    ],
  },
  {
    id: 'appeal-to-emotion',
    name: 'Appeal to Emotion',
    aka: ['Appeal to pity', 'Appeal to fear'],
    category: 'relevance',
    definition: 'Manipulating emotions — fear, pity, guilt, outrage — in place of a valid argument.',
    example: '"If you don\'t buy this home security system, imagine how you\'ll feel when your family is in danger."',
    flaw: 'The fear is vivid, but no evidence is given that the system reduces risk.',
    quizScenarios: [
      '"Please give me an A on this paper. I\'ve had a terrible semester and my parents will be devastated."',
      '"Think of the children! How could anyone with a heart vote against this bill?"',
    ],
  },
  {
    id: 'bandwagon',
    name: 'Appeal to Popularity',
    aka: ['Bandwagon', 'Argumentum ad populum'],
    category: 'relevance',
    definition: 'Arguing that a claim is true or good because many people believe or do it.',
    example: '"Millions of people use this supplement, so it must be effective."',
    flaw: 'Popularity measures belief, not truth; many people can share the same mistake.',
    quizScenarios: [
      '"Everyone in the office is switching to this framework — it has to be the best choice."',
      '"This book has been a bestseller for 40 weeks, so its historical claims must be accurate."',
    ],
  },
  {
    id: 'appeal-to-tradition',
    name: 'Appeal to Tradition',
    aka: ['Argumentum ad antiquitatem'],
    category: 'relevance',
    definition: 'Arguing that something is right or better because it has always been done that way.',
    example: '"We\'ve always held the meeting on Monday mornings. There\'s no reason to change it."',
    flaw: 'Longevity shows habit, not merit — the original reasons may no longer apply.',
    quizScenarios: [
      '"Our family has always voted for this party, so it\'s the right choice for you too."',
      '"We\'ve used paper forms for thirty years. Why would we move to a digital system?"',
    ],
  },
  {
    id: 'appeal-to-nature',
    name: 'Appeal to Nature',
    aka: [],
    category: 'relevance',
    definition: 'Arguing that something is good because it is "natural," or bad because it is "unnatural."',
    example: '"This herbal remedy is all-natural, so it\'s safer than prescription medicine."',
    flaw: 'Arsenic and hemlock are natural; "natural" says nothing about safety or efficacy.',
    quizScenarios: [
      '"Humans didn\'t evolve to eat processed food, so anything processed is bad for you."',
      '"Air conditioning isn\'t natural. People should just learn to live with the heat."',
    ],
  },
  {
    id: 'appeal-to-ignorance',
    name: 'Appeal to Ignorance',
    aka: ['Argumentum ad ignorantiam'],
    category: 'relevance',
    definition: 'Claiming something is true because it hasn\'t been proven false, or false because it hasn\'t been proven true.',
    example: '"No one has ever proven that ghosts don\'t exist, so they must be real."',
    flaw: 'Absence of disproof isn\'t proof; the burden stays on the one making the claim.',
    quizScenarios: [
      '"Scientists can\'t show this pesticide is harmful, so it\'s definitely safe."',
      '"You can\'t prove I didn\'t see a UFO last night, so you have to accept that I did."',
    ],
  },
  {
    id: 'genetic',
    name: 'Genetic Fallacy',
    aka: ['Fallacy of origins'],
    category: 'relevance',
    definition: 'Judging a claim or idea by where it came from rather than on its merits.',
    example: '"That idea came from a tobacco company, so it can\'t possibly be right."',
    flaw: 'A biased source is a reason to scrutinize, not a proof of falsehood.',
    quizScenarios: [
      '"The Volkswagen Beetle was designed under the Nazis, so it\'s a bad car."',
      '"That productivity tip started on a Reddit forum. Obviously it doesn\'t work."',
    ],
  },

  // ── Presumption ──────────────────────────────────────────────
  {
    id: 'false-dilemma',
    name: 'False Dilemma',
    aka: ['False dichotomy', 'Black-or-white'],
    category: 'presumption',
    definition: 'Presenting only two options when more exist.',
    example: '"Either you support this war, or you hate your country."',
    flaw: 'One can love one\'s country and still oppose a specific war — the options aren\'t exhaustive.',
    quizScenarios: [
      '"We either rewrite the whole codebase from scratch or accept that it will stay broken forever."',
      '"You\'re either with us or against us."',
    ],
  },
  {
    id: 'begging-the-question',
    name: 'Begging the Question',
    aka: ['Circular reasoning', 'Petitio principii'],
    category: 'presumption',
    definition: 'Using the conclusion as a premise, so the argument assumes what it is trying to prove.',
    example: '"This book is trustworthy because it says it is the truth, and it must be true because it\'s trustworthy."',
    flaw: 'The conclusion is assumed in the premise; no independent support is offered.',
    quizScenarios: [
      '"He\'s a great leader because he has excellent leadership skills."',
      '"You can trust me because I\'m an honest person — and I know I\'m honest because I\'d never lie to you."',
    ],
  },
  {
    id: 'loaded-question',
    name: 'Loaded Question',
    aka: ['Complex question'],
    category: 'presumption',
    definition: 'Asking a question that contains an unproven assumption, so any direct answer concedes it.',
    example: '"Have you stopped cheating on your exams?"',
    flaw: 'Both "yes" and "no" admit to having cheated — the presumption is never established.',
    quizScenarios: [
      '"Why did you decide to sabotage the team\'s launch?"',
      '"How long have you been hiding the real numbers from investors?"',
    ],
  },
  {
    id: 'hasty-generalization',
    name: 'Hasty Generalization',
    aka: ['Overgeneralization'],
    category: 'presumption',
    definition: 'Drawing a broad conclusion from a small or unrepresentative sample.',
    example: '"I met two rude people from that city, so everyone there is rude."',
    flaw: 'Two encounters can\'t represent a whole population.',
    quizScenarios: [
      '"My grandfather smoked every day and lived to 95, so smoking can\'t be that bad."',
      '"The first two restaurants I tried in this town were bad. The food scene here is terrible."',
    ],
  },
  {
    id: 'no-true-scotsman',
    name: 'No True Scotsman',
    aka: ['Appeal to purity'],
    category: 'presumption',
    definition: 'Redefining a group to exclude a counterexample rather than revising the generalization.',
    example: '"No Scotsman puts sugar on his porridge." "My uncle is Scottish and does." "Well, no true Scotsman does."',
    flaw: 'The definition is changed after the fact to make the claim unfalsifiable.',
    quizScenarios: [
      '"Real programmers never use a debugger." "Linus uses one." "Then he\'s not a real programmer."',
      '"No true fan would ever leave a game early." "I\'ve followed this team for 30 years and left early once." "Then you\'re not a true fan."',
    ],
  },
  {
    id: 'sunk-cost',
    name: 'Sunk Cost',
    aka: ['Concorde fallacy'],
    category: 'presumption',
    definition: 'Continuing a course of action because of past investment rather than future value.',
    example: '"I\'ve already spent $2,000 fixing this car, so I should keep repairing it."',
    flaw: 'The $2,000 is gone either way; only future costs and benefits should drive the decision.',
    quizScenarios: [
      '"We\'ve put three years into this project. We can\'t cancel it now, even if it\'s failing."',
      '"The movie is terrible, but I paid for the ticket, so I\'m staying until the end."',
    ],
  },
  {
    id: 'special-pleading',
    name: 'Special Pleading',
    aka: [],
    category: 'presumption',
    definition: 'Applying a rule to others while exempting oneself or a favored case without justification.',
    example: '"Everyone should follow the speed limit — but I\'m an excellent driver, so it doesn\'t apply to me."',
    flaw: 'No principled reason is given for the exception.',
    quizScenarios: [
      '"All code must be reviewed before merging — except mine, since I know what I\'m doing."',
      '"Psychic powers can\'t be tested in a lab because the skeptical atmosphere interferes with them."',
    ],
  },
  {
    id: 'cherry-picking',
    name: 'Cherry Picking',
    aka: ['Suppressed evidence', 'Texas sharpshooter'],
    category: 'presumption',
    definition: 'Selecting only the evidence that supports a claim while ignoring evidence that contradicts it.',
    example: '"Look at these three studies showing coffee is healthy." (Ignoring the dozen showing mixed or negative results.)',
    flaw: 'A conclusion drawn from a filtered subset of evidence misrepresents the whole.',
    quizScenarios: [
      'A company\'s ad quotes the single five-star review from a critic who gave every other product in the category one star.',
      '"This winter has been freezing — so much for global warming," ignoring decades of global temperature data.',
    ],
  },
  {
    id: 'middle-ground',
    name: 'Middle Ground',
    aka: ['Argument to moderation', 'False compromise'],
    category: 'presumption',
    definition: 'Assuming the truth must lie in a compromise between two opposing positions.',
    example: '"You say the Earth is round; he says it\'s flat. The truth is probably somewhere in between."',
    flaw: 'The midpoint between a true claim and a false one isn\'t automatically true.',
    quizScenarios: [
      '"One expert says the bridge is safe, the other says it will collapse. Let\'s assume it\'s half-safe and allow half the traffic."',
      '"She says the vaccine is safe; he says it\'s poison. The reasonable view is that it\'s a little dangerous."',
    ],
  },

  // ── Causal ───────────────────────────────────────────────────
  {
    id: 'post-hoc',
    name: 'Post Hoc',
    aka: ['Post hoc ergo propter hoc', 'False cause'],
    category: 'causal',
    definition: 'Assuming that because one event followed another, the first caused the second.',
    example: '"I wore my lucky socks and we won the game. The socks worked."',
    flaw: 'Sequence alone doesn\'t establish causation.',
    quizScenarios: [
      '"I took this cold remedy and three days later my cold was gone. It really works."',
      '"Right after the new CEO arrived, sales dropped. She\'s ruining the company."',
    ],
  },
  {
    id: 'correlation-causation',
    name: 'Correlation ≠ Causation',
    aka: ['Cum hoc ergo propter hoc'],
    category: 'causal',
    definition: 'Assuming that because two things occur together, one must cause the other.',
    example: '"Ice cream sales and drowning deaths both rise in summer, so ice cream causes drowning."',
    flaw: 'A third factor — hot weather — drives both; the correlation isn\'t causal.',
    quizScenarios: [
      '"Kids who eat breakfast get better grades, so eating breakfast makes you smarter."',
      '"Cities with more firefighters have more fires. Firefighters must be causing fires."',
    ],
  },
  {
    id: 'slippery-slope',
    name: 'Slippery Slope',
    aka: [],
    category: 'causal',
    definition: 'Asserting that a small first step will inevitably lead to a chain of extreme consequences, without evidence for each link.',
    example: '"If we allow students to redo one test, soon they\'ll expect to redo every assignment, and eventually grades will mean nothing."',
    flaw: 'Each link in the chain is asserted, not shown to be likely.',
    quizScenarios: [
      '"If we let employees work from home on Fridays, next they\'ll want every day, and soon nobody will show up at all."',
      '"Legalize this one thing and society will collapse into total chaos within a decade."',
    ],
  },
  {
    id: 'gamblers',
    name: 'Gambler\'s Fallacy',
    aka: ['Monte Carlo fallacy'],
    category: 'causal',
    definition: 'Believing that past independent random events affect the probability of future ones.',
    example: '"Red has come up six times in a row on the roulette wheel. Black is due."',
    flaw: 'Each spin is independent; the wheel has no memory.',
    quizScenarios: [
      '"We\'ve had four boys, so the next baby is almost certainly going to be a girl."',
      '"I\'ve lost ten lottery draws in a row — my odds of winning the next one must be way up."',
    ],
  },

  // ── Ambiguity ────────────────────────────────────────────────
  {
    id: 'equivocation',
    name: 'Equivocation',
    aka: [],
    category: 'ambiguity',
    definition: 'Using a word with two different meanings in the same argument as if the meaning were constant.',
    example: '"A feather is light. What is light cannot be dark. Therefore a feather cannot be dark."',
    flaw: '"Light" shifts from "not heavy" to "not dark" between premises.',
    quizScenarios: [
      '"Evolution is just a theory. Theories are just guesses. So evolution is just a guess."',
      '"The sign says \'fine for parking here,\' so it must be fine to park here."',
    ],
  },
  {
    id: 'composition',
    name: 'Composition',
    aka: [],
    category: 'ambiguity',
    definition: 'Inferring that what is true of the parts must be true of the whole.',
    example: '"Every player on this team is a star, so the team will be great."',
    flaw: 'Individually excellent parts don\'t guarantee a well-functioning whole.',
    quizScenarios: [
      '"Each brick in this wall is light, so the wall must be light."',
      '"Every microservice passes its own tests, so the whole system must work correctly."',
    ],
  },
  {
    id: 'division',
    name: 'Division',
    aka: [],
    category: 'ambiguity',
    definition: 'Inferring that what is true of the whole must be true of each part.',
    example: '"That university is prestigious, so every professor there must be brilliant."',
    flaw: 'Properties of the institution don\'t automatically transfer to each member.',
    quizScenarios: [
      '"The company is highly profitable, so every one of its departments must be making money."',
      '"Water is wet, so each H₂O molecule must be wet."',
    ],
  },

  // ── Formal ───────────────────────────────────────────────────
  {
    id: 'affirming-consequent',
    name: 'Affirming the Consequent',
    aka: [],
    category: 'formal',
    definition: 'If P then Q; Q is true; therefore P. Invalid because Q may have other causes.',
    example: '"If it rained, the street is wet. The street is wet. So it rained."',
    flaw: 'A street cleaner or burst pipe could also make the street wet.',
    quizScenarios: [
      '"If he were guilty, he\'d be nervous. He\'s nervous. So he\'s guilty."',
      '"If the server is down, the site won\'t load. The site won\'t load, so the server is down."',
    ],
  },
  {
    id: 'denying-antecedent',
    name: 'Denying the Antecedent',
    aka: ['Inverse error'],
    category: 'formal',
    definition: 'If P then Q; P is false; therefore Q is false. Invalid because Q may happen anyway.',
    example: '"If you\'re a doctor, you went to college. You\'re not a doctor, so you didn\'t go to college."',
    flaw: 'Many non-doctors went to college; the conditional only runs one direction.',
    quizScenarios: [
      '"If I study, I\'ll pass. I didn\'t study, so I won\'t pass."',
      '"If it\'s a cat, it has fur. It\'s not a cat, so it doesn\'t have fur."',
    ],
  },
  {
    id: 'fallacy-fallacy',
    name: 'Fallacy Fallacy',
    aka: ['Argument from fallacy'],
    category: 'formal',
    definition: 'Concluding that a claim is false because the argument for it contains a fallacy.',
    example: '"You used an ad hominem, so your conclusion about the budget must be wrong."',
    flaw: 'A bad argument for a claim doesn\'t make the claim false — it just leaves it unsupported.',
    quizScenarios: [
      '"Your argument that exercise is healthy relied on an appeal to authority, so exercise probably isn\'t healthy."',
      '"She made a straw man of my position, which proves her overall point is false."',
    ],
  },
];

export function getFallacy(id: string): Fallacy | undefined {
  return FALLACIES.find((f) => f.id === id);
}
