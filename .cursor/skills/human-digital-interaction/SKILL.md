---
name: human-digital-interaction
description: Applies principles of how humans interact with digital AI and websites. Use when designing AI interfaces, chatbots, websites, UX patterns, user flows, or when the user mentions human-AI interaction, website UX, user expectations, or digital experience design.
---

# Human-Digital Interaction

Domain knowledge for designing interfaces that match how people actually interact with digital AI and websites.

---

## Human-AI Interaction

### Four Interaction Phases

People engage with AI systems across four phases; design must address each:

| Phase | Focus |
|-------|--------|
| **Initial** | First impression, onboarding, setting expectations |
| **Regular** | Ongoing use, feedback loops, trust calibration |
| **Failure** | When the AI errs—recovery, explanations, graceful degradation |
| **Over time** | Adaptation, learning, changing expectations |

### Key Principles

- **Appropriate reliance**: Balance overreliance (accepting wrong answers) and underreliance (dismissing good ones). Generative AI’s fluent output often hides errors.
- **Transparency**: Clarify what the AI can/cannot do, when it’s guessing, and when it’s uncertain.
- **Control**: Users expect to correct, undo, refine, or override AI outputs.
- **Mental models**: Users form expectations from prior tools. Align behavior with familiar patterns or explain differences.
- **Recovery**: Make failures understandable, fixable, and non-fatal.

### Communication Challenges (Human ↔ Agent)

- **Agent → User**: How outcomes are explained, progress shown, and uncertainty communicated.
- **User → Agent**: How intent and constraints are expressed, clarified, and corrected.
- **Across phases**: Clarity before, during, and after execution.

---

## Website Interaction

### Jakob’s Law

Users assume sites work like others they know. Familiar patterns reduce errors and improve task completion.

### Expected Patterns

| Element | Typical expectation |
|---------|---------------------|
| Search | Text box, top-right or prominent |
| Logo | Top-left, links to home |
| Main nav | Top, horizontal |
| Cart/basket | Top-right icon |
| Back button | Returns to the previous perceived page |
| Mobile | Pinch-to-zoom, thumb-friendly zones |
| Scroll | Scrollbars for navigation |

Breaking these expectations increases confusion and abandonment. Avoid doing so without a clear benefit.

### Back Button

Many users depend on the back button. Ensure it:
- Returns to the perceived previous state
- Preserves in-progress work where appropriate
- Doesn’t create dead ends or loops

---

## Friction Points to Avoid

- **Hidden capabilities**: Features users don’t know about.
- **No feedback**: No indication that an action was received or is in progress.
- **Irreversible actions** without confirmation.
- **Jargon and unclear error messages**.
- **Uncertainty about AI correctness** with no way to verify or correct.
- **Disrespect for expectations** (e.g., back button, search placement) without explanation.

---

## Design Checklist

When building AI or website experiences:

- [ ] Users understand what the system does (and its limits) early
- [ ] Feedback is clear for loading, success, and failure
- [ ] Users can correct, undo, or refine outputs
- [ ] Uncertainty and confidence are communicated
- [ ] Common web patterns (nav, search, back, etc.) are respected
- [ ] Errors are explained and have clear recovery paths
- [ ] Mobile layouts support touch and readability

---

## When to Apply

Use this skill when:
- Designing AI chat, assistants, or copilots
- Planning website or app UX
- Discussing user expectations or mental models
- Fixing confusing or frustrating flows
- Adding onboarding or error handling
- Making accessibility or inclusive design decisions
