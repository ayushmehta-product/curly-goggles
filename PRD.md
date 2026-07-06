# PRD — User_Experience

## Overview

**Product:** User_Experience
**What it does:** It is a product to manage qualitative research.
**Primary users:** Researchers

## Key Entities

- **Usability tests** — (placeholder, not yet built)
- **Interviews** — IDI Studies (see below)
- **Focus groups and Studies** — (placeholder, not yet built)

## Primary User Actions

- View the studies/tests
- Create and manage IDI studies (Interviews)

---

## Screens & Flows

### Usability tests

> Placeholder — not yet implemented.

### Focus groups and Studies

> Placeholder — not yet implemented.

---

## Interviews (IDI Studies)

Imported from qp-ux. Sidebar label: **Interviews**. Routes: `/idi-studies`.

### Feature Summary

Introduce In-Depth Interview (IDI) studies into QuestionPro UX with two moderation modes:

- Human Moderated
- AI Moderated

The feature will enable researchers to conduct qualitative interviews, generate insights from conversations, manage participant intelligence, and provide stakeholder-friendly research consumption experiences.

This is not intended to be a standalone video interviewing tool. The long-term direction is to create a unified qualitative research intelligence platform tightly integrated with QuestionPro UX and InsightsHub.

---

### Problem Statement

Current UX research workflows are fragmented across:
- Interview scheduling tools
- Video conferencing tools
- Note-taking tools
- Analysis tools
- Insight repositories

Researchers spend significant time:
- coordinating interviews
- extracting insights manually
- synthesizing findings
- sharing findings with stakeholders

Stakeholders often:
- do not watch interview recordings
- do not read transcripts
- struggle to consume qualitative insights efficiently

Additionally, organizations lose valuable qualitative intelligence after studies conclude because insights are not structured, searchable, or connected across studies.

---

### Goals

#### Primary Goals
- Enable researchers to run moderated IDI studies inside QuestionPro UX
- Introduce AI Moderated interview capability
- Create structured insight extraction workflows
- Improve stakeholder accessibility to qualitative insights
- Build persistent participant intelligence

#### Secondary Goals
- Increase stickiness of QuestionPro UX
- Expand qualitative research capabilities
- Differentiate from commodity IDI tools
- Create foundation for future AI research workflows

---

### Non-Goals (V1)

The following are explicitly out of scope for V1:
- AI-generated emotional truth detection
- Fully autonomous research agents
- Complex longitudinal behavioral prediction
- Multi-language live translation
- AI avatar moderators
- Advanced journey orchestration
- Deep quantitative correlation engines
- Automated decision-making recommendations

---

### Information Architecture Rules

Core entities are:
- Study
- Participant
- Session
- Insight
- Theme
- Clip
- Transcript

Relationships between entities should remain visible throughout the UX.

Avoid isolated screens that lose study context.

---

### User Types

#### Primary Users
- UX Researchers
- Product Researchers
- Research Operations Teams

#### Secondary Users
- Product Managers
- Designers
- Executives
- Customer Experience Teams
- Stakeholders / Observers

---

### Core Concepts

#### Study Type — IDI Study

A qualitative research study involving conversational interviews with participants.

#### Moderation Mode

**Human Moderated** — A researcher conducts the interview live.

**AI Moderated** — An AI interviewer conducts the session based on a structured discussion guide.

Potential future: Hybrid Moderation

---

### Core Functional Areas

#### Study Creation

Researchers must be able to:
- Create an IDI study
- Select moderation mode
- Define research objectives
- Configure discussion guides
- Configure participant requirements
- Launch studies

**Study Creation Flow**

1. **Study Type** — Select IDI Study
2. **Moderation Mode** — Human Moderated or AI Moderated
3. **Research Goals** — Study title, research objective, target audience, key research questions, hypotheses, success criteria
4. **Discussion Guide** — Manual or AI-assisted guide creation; section organization, questions, probes, time estimates; AI settings (style, probe depth, autonomy)
5. **Participant Criteria** — Demographic targeting, screening questions, prior participation filtering, reliability filtering, domain expertise filtering, communication richness indicators
6. **Review & Launch** — Study summary, configuration validation, missing setup warnings, launch CTA

**Routes:** `/idi-studies`, `/idi-studies/create`

---

#### Human Moderated Sessions

Researchers must be able to:
- Schedule interviews
- Invite participants
- Conduct live sessions
- Record interviews
- Add notes and tags
- Bookmark moments
- Allow observers

**Features:** Scheduling (calendar, time zones, reminders), live session room (video, screen sharing, observer mode, notes, tagging, clip bookmarking), AI copilot (topic coverage, follow-up suggestions, contradiction detection, live summary).

**Route:** `/idi-studies/[id]/sessions`

---

#### AI Moderated Sessions

Participants must be able to:
- Join asynchronous AI interviews
- Interact conversationally
- Answer guided research questions
- Complete tasks and follow-ups

**AI Moderator Behavior:** Conversational interviews, task-based interviews, prototype walkthroughs. Ask follow-up questions, clarify vague answers, adapt probe depth, stay aligned to discussion guide.

---

#### Participant Intelligence Layer

Build persistent participant intelligence across studies.

**Participant Profile:** Static data (demographics, geography, occupation, industry, device usage), behavioral signals (response richness, talkativeness, reliability, session completion rate, technical fluency, research familiarity), research history (prior studies, themes, historical participation, past feedback patterns).

Participant Intelligence should appear during recruitment, participant selection, session review, and participant detail views.

---

#### Insight Layer

Transform interview data into structured research intelligence.

**AI Processing:** Transcripts, notes, tags, clips, tasks, reactions.

**Insight Objects:** Title, description, supporting evidence, associated clips, associated quotes, confidence score, frequency, severity, impacted personas.

**Theme Detection:** Automatic theme extraction, cross-interview clustering, emerging trend detection, contradiction identification.

**Route:** `/idi-studies/[id]/analyze`

---

#### Stakeholder Experience Layer

Enable stakeholders to consume qualitative insights quickly without reviewing entire interviews.

**Features:** Executive summary, theme explorer, insight reels (frustration, delight, confusion, requests, objections), live observation room.

---

#### Study Detail

**Route:** `/idi-studies/[id]`

**Purpose:** Study overview, workspace tabs (overview, sessions, analyze), study stats, team, settings.

---

### UX Principles

- Keep setup simple
- Progressive disclosure
- Shared workflow between moderation modes
- AI should feel assistive, not magical
- Evidence-backed insights only
- Reduce stakeholder cognitive load
- Minimize transcript dependency

---

### Success Metrics

**Adoption:** Number of IDI studies created, human vs AI moderation usage, study completion rate.

**Engagement:** Average session duration, stakeholder session views, insight reel views, theme explorer usage.

**AI:** AI follow-up acceptance rate, AI insight usefulness ratings, AI-generated guide adoption rate.

**Business:** Qualitative research feature adoption, expansion revenue influence, retention improvement.

---

### Future Considerations

- Hybrid moderation
- AI-generated highlight narratives
- Longitudinal participant intelligence
- Cross-study organizational memory
- Conversational insight querying
- Adaptive interview branching
- Automated research synthesis
- Research recommendation engine

---

## Terminology

| Term | Definition |
|------|------------|
| IDI Study | In-Depth Interview study — a qualitative research study involving conversational interviews |
| Human Moderated | A researcher conducts the interview live |
| AI Moderated | An AI interviewer conducts the session based on a structured discussion guide |
| Session | A single interview occurrence with a participant |
| Discussion Guide | Structured questions, probes, and sections for an interview |
| Insight | A structured research finding backed by evidence from sessions |
