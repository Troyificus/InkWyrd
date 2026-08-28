// Session Zero Questionnaire content. Organized into sections, each with
// a set of discussion prompts. Selection state (which sections/questions
// are included) is stored in localStorage, not per-item like the other
// generators — this is a single configurable document, not a deck of
// separately-saved things.

const SESSION_ZERO_SECTIONS = [
  {
    key: 'safety',
    label: 'Content & Safety',
    questions: [
      { id: 'lines', text: 'Are there any topics or themes that should be completely off the table for this campaign?' },
      { id: 'veils', text: 'Are there topics that are okay to include but should be handled off-screen or lightly, not shown in detail?' },
      { id: 'safety-tool', text: 'Should the table use a safety tool during play, like an X-card or a check-in phrase, to pause or adjust a scene in the moment?' },
      { id: 'safety-followup', text: 'If a safety tool gets used, how does the group want that handled afterward \u2014 in the moment, or after the session?' },
      { id: 'real-world', text: 'Are there any real-world topics \u2014 illness, loss, specific fears \u2014 any player would prefer stay out of the fiction entirely?' },
      { id: 'violence', text: 'How does the group feel about depicting violence, especially against named or sympathetic characters?' },
      { id: 'romance', text: 'How does the group feel about romance or intimacy being part of character stories, and how much detail is welcome on-screen?' },
      { id: 'heads-up', text: 'Should certain content warrant a heads-up before it comes up in a session, even if it\u2019s not fully off-limits?' }
    ]
  },
  {
    key: 'tone',
    label: 'Tone & Themes',
    questions: [
      { id: 'overall-tone', text: 'What\u2019s the overall tone the group wants: heroic and hopeful, gritty and dangerous, comedic, something else entirely?' },
      { id: 'optimism', text: 'Should the world lean more optimistic (good ultimately wins) or morally grey (victories come with real costs)?' },
      { id: 'death-permanence', text: 'How permanent should character death be? Is it always final, or should there be room for magic or plot to bring someone back?' },
      { id: 'intrigue', text: 'How much political intrigue, moral ambiguity, or "no clean answers" storytelling does the group want?' },
      { id: 'reference-media', text: 'Is there a particular book, show, or game that captures the vibe the group\u2019s going for?' },
      { id: 'horror-level', text: 'How much horror, dread, or unsettling content fits the story the group wants to tell?' },
      { id: 'failure-weight', text: 'Should failure carry real narrative weight, or should the game lean toward players usually succeeding at what they try?' }
    ]
  },
  {
    key: 'logistics',
    label: 'Table Logistics',
    questions: [
      { id: 'schedule', text: 'How often will the group meet, and for roughly how long each session?' },
      { id: 'lateness', text: 'What\u2019s the policy on being late, missing a session, or needing to step away mid-session?' },
      { id: 'breaks', text: 'Will the group take a scheduled break partway through longer sessions?' },
      { id: 'devices', text: 'Are phones and other devices okay at the table, or should they be set aside during play?' },
      { id: 'recording', text: 'Is anyone interested in recording sessions, for a podcast, personal archive, or absent-player catch-up?' },
      { id: 'new-player', text: 'How will the group handle bringing in a new player partway through the campaign?' },
      { id: 'hosting', text: 'Who\u2019s responsible for snacks, drinks, or hosting logistics if playing in person?' },
      { id: 'between-sessions', text: 'Is there a preferred way to communicate between sessions \u2014 a group chat or forum \u2014 for scheduling and in-character extras?' }
    ]
  },
  {
    key: 'characters',
    label: 'Character Creation & Party',
    questions: [
      { id: 'concept-restrictions', text: 'Are there any character concepts, races, or classes that don\u2019t fit this campaign and should be avoided?' },
      { id: 'party-cohesion', text: 'How do the characters know each other at the start, or will that be figured out together in the first session?' },
      { id: 'backstory-depth', text: 'How much backstory detail is expected before session one, and how much can be filled in as we play?' },
      { id: 'character-death-replacement', text: 'If a character dies, how should a replacement character be introduced into the story?' },
      { id: 'pvp', text: 'Is player-versus-player conflict between characters something the table wants, and if so, how should it be handled?' },
      { id: 'major-decisions', text: 'Should players check with each other before making major character decisions that affect the whole party?' },
      { id: 'homebrew', text: 'Is multiclassing, homebrew content, or unusual character builds welcome, or should the group stick close to core rules?' }
    ]
  },
  {
    key: 'expectations',
    label: 'Player Expectations & Style',
    questions: [
      { id: 'spotlight', text: 'How should the group make sure everyone gets a fair share of spotlight time during sessions?' },
      { id: 'notes', text: 'Is note-taking something the group wants to share, or will everyone keep their own?' },
      { id: 'homework', text: 'How much prep or "homework" between sessions feels reasonable, if any?' },
      { id: 'heated-moments', text: 'How does the table feel about in-character arguments becoming heated, and how do we keep that fun rather than tense?' },
      { id: 'side-talk', text: 'Should side conversations and jokes happen freely during play, or does the table prefer to stay focused on the scene?' },
      { id: 'rules-disputes', text: 'How does the group want to handle disagreements about rules mid-session: quick GM ruling, brief discussion, or look it up together?' },
      { id: 'agency', text: 'How much player agency versus GM-driven plot does the group want? Should players be able to steer the story in big ways?' }
    ]
  }
];

// Optional, toggleable independently of the core sections above — a
// group only sees the notes for whichever system(s) they actually play.
const SESSION_ZERO_SYSTEM_NOTES = {
  daggerheart: {
    label: 'Daggerheart',
    questions: [
      { id: 'dh-fear', text: 'How does the group want to handle the GM\u2019s Fear currency and its narrative weight \u2014 should players be reminded when Fear is spent, or should it stay a GM-side surprise?' },
      { id: 'dh-hope', text: 'How should Hope be spent or shared among players between big moments?' }
    ]
  },
  dnd5e: {
    label: 'D&D 5E',
    questions: [
      { id: '5e-optional-rules', text: 'Are optional rules like flanking, feats, or multiclassing in play?' },
      { id: '5e-leveling', text: 'Should the group use milestone leveling or track experience points?' }
    ]
  },
  pathfinder2e: {
    label: 'Pathfinder 2E',
    questions: [
      { id: 'pf2e-action-economy', text: 'Given the three-action economy\u2019s complexity, would the table like a session zero walkthrough of how actions work before play begins?' },
      { id: 'pf2e-variant-rules', text: 'Are Automatic Bonus Progression or other optional variant rules in play?' }
    ]
  }
};
