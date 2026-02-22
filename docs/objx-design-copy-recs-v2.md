# OBJX Design — Website Copy Recommendations
## Based on Full Codebase Review

---

## Current State Summary

The site is a React + Vite + Tailwind app with 4 pages (Landing, Work, Admin, 404). The design system is clean and minimal — the bones are solid. But the **content is positioned as an art gallery**, not an architecture practice:

- Projects are paintings (Oil on canvas, Resin on panel, Acrylic on canvas)
- "What We Do" section references "original artworks and environmental installations for private collectors"
- FlipCard backs show "Medium," "Category," "Commission similar work →"
- IntelligenceBridge talks about "AI team" and "creative process" — reads like a SaaS pitch, not architecture

**The structure works. The copy needs to pivot.**

---

## File-by-File Copy Recommendations

### 1. `LandingPage.tsx` — Hero Section

**Current:**
```
"We design and build environments shaped by purpose and clarity."
```
**Recommendation:** This line actually works for architecture. Keep it, or sharpen:

| Option | Copy |
|--------|------|
| A (keep) | We design and build environments shaped by purpose and clarity. |
| B (direct) | We design and build for how people actually live. |
| C (tech-forward) | Architecture refined by intent, accelerated by intelligence. |

**Current sub-copy:**
```
"Every project is an opportunity to develop creative direction in response
to our continuously evolving landscapes."
```
**Recommendation — replace with grounding statement:**
```
Residential and commercial architecture rooted in San Diego.
Full-service design — from feasibility through permit.
```

**Current tagline:**
```
"Objective By Design + OBJXIntelligence"
```
**Recommendation — soften:**
```
Objective by Design + OBJX Intelligence
```
Or replace with: `designobjx.com · San Diego`

---

### 2. `LandingPage.tsx` — "What We Do" Section (lines 60-90)

This is where the art gallery language lives. Full rewrite needed.

**Current left column:**
```
h2: "Custom environments, composed with intention."
p1: "OBJX Design creates original artworks and environmental installations
    for private collectors and commercial spaces..."
p2: "Available for custom commissions, private collections..."
```

**Recommended left column:**
```
h2: "Design with clarity. Build with intent."

p1: "OBJX Design is a San Diego architecture and design practice specializing
    in residential renovations, ADUs, commercial interiors, and new construction.
    We handle the full scope — concept through permitted drawings."

p2: "For property owners exploring what's possible, we offer feasibility analysis,
    zoning review, and development consulting — powered by OBJX Intelligence."
```

**Current right column (Contact):**
```
p: "For custom paintings, commissions, or any questions — reach out directly."
```
**Recommended:**
```
p: "For project inquiries or to discuss your property — reach out directly."
```

---

### 3. `IntelligenceBridge.tsx` — Full Rewrite

This section currently reads like it's selling an AI product to clients. For a design practice site, it should quietly establish the technology differentiator without sounding like a SaaS landing page.

**Current:**
```
label: "Powered by OBJX Intelligence"
h2: "Our design practice runs on the same AI platform we build for clients."
p:  "Every project is guided by intelligence that compounds. The same system
    that powers your AI team powers our creative process..."
CTA: "Explore OBJX Intelligence"
```

**Recommended:**
```
label: "OBJX Intelligence"
h2: "Design practice, amplified by intelligence."
p:  "Every project benefits from integrated analysis — zoning feasibility,
    code compliance, and property intelligence built into our process
    from day one. Not bolted on. Built in."
CTA: "Learn more at meetobjx.com"
```

Alternatively, if you want this section even more understated:
```
h2: "The tools behind the work."
p:  "OBJX Intelligence is our proprietary platform for property analysis,
    zoning feasibility, and project intelligence. It's how we move faster
    without cutting corners."
```

---

### 4. `Footer.tsx` — Intelligence Strip

**Current:**
```
"Built on OBJX Intelligence · Objective by Design + Intelligence"
```
**Recommended:**
```
"Objective by Design · San Diego Architecture + Design"
```

**Current footer tagline:**
```
"Objective by Design. Environments shaped by purpose and clarity."
```
**This works as-is.** Good brand line for the footer.

---

### 5. `projects.json` — Content Pivot Required

All 8 projects are paintings. For architecture positioning, these need to become built work, renders, or project documentation. The data structure supports this — just needs new content.

**Current fields that need rethinking:**
- `category`: "Painting" → "Residential" / "Commercial" / "ADU" / "Interior"
- `medium`: "Oil on canvas" → "New Construction" / "Renovation" / "Permitted Design"
- `description`: Art language → Project scope descriptions

**Example project entry for architecture:**
```json
{
  "id": "1",
  "title": "Hillcrest ADU",
  "description": "Detached 800 SF accessory dwelling unit — full design and permitting through City of San Diego. Maximized buildable area within setback constraints.",
  "imageUrl": "/images/hillcrest-adu.jpg",
  "category": "Residential",
  "medium": "ADU — New Construction",
  "year": "2025",
  "orderIndex": 1,
  "published": true
}
```

---

### 6. `FlipCard.tsx` — Back Face Copy

**Current CTA:**
```
"Commission similar work →"
```
**Recommended:**
```
"Inquire about this project →"
```
Or simply: `"Contact →"`

**Current metadata labels** (Medium, Category, Year) work for architecture too — no change needed structurally, just the data in projects.json.

---

### 7. `WorkPage.tsx` — Minor Copy Update

**Current:**
```
"Hover or tap each piece to see the story behind it."
```
**Recommended:**
```
"Hover or tap to see project details."
```

---

## Services Language (for reference across all sections)

Keep this vocabulary consistent wherever services are mentioned:

**Core services:**
- Residential design (renovations, additions, new construction)
- ADU design and permitting
- Commercial interior design
- Full permitting services (City of San Diego)

**Consulting services (via OBJX Intelligence):**
- Property feasibility analysis
- Zoning and code review
- Development consulting

**Avoid:**
- "Creative direction" (reads agency, not architecture)
- "Environmental installations" (reads art gallery)
- "Private collectors" (wrong audience)
- "AI team" (confusing on a design practice site)

---

## What to Keep

- The visual design system — it's excellent. Minimal, confident, appropriate for the positioning.
- The hero headline (Option A) — it translates perfectly to architecture.
- The footer brand line — works as-is.
- The structural layout of all pages — nothing needs to move, just the words inside.
- The IntelligenceBridge section concept — the dark band differentiator is smart, just needs architecture-appropriate copy.
- The admin system for managing projects — great for swapping in built work over time.

---

## Priority Order

1. **LandingPage "What We Do" section** — currently the most misaligned (art gallery copy)
2. **IntelligenceBridge** — SaaS pitch → architecture differentiator
3. **projects.json** — paintings → built work (content dependent on available project photos)
4. **Hero sub-copy** — swap to grounding statement
5. **FlipCard CTA + WorkPage helper text** — quick string swaps
6. **Footer intelligence strip** — one line change
