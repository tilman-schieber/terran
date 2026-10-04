// Line drawings for the menu, in the style of the globe logo: thin strokes in the text colour, one accent detail.
// 48×48 viewBox; `a` marks the accent part.
const svg = (body) =>
  `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const dot = (x, y, r = 2.2) => `<circle class="a" cx="${x}" cy="${y}" r="${r}"/>`;

export const ICONS = {
  // globe with a pin
  classic: svg(`
    <circle cx="24" cy="24" r="17"/>
    <ellipse cx="24" cy="24" rx="7.5" ry="17"/>
    <path d="M7 24h34M9.3 15.5h29.4M9.3 32.5h29.4"/>
    ${dot(30.5, 16.5)}`),

  // a lattice tower
  sightseeing: svg(`
    <path d="M24 8 17 41M24 8l7 33M13 41h22M20.2 27h7.6M21.9 18.5h4.2"/>
    <path d="M19.5 41c1.5-5 7.5-5 9 0"/>
    <path d="M24 8V5"/>
    ${dot(24, 5)}`),

  // a domed government building
  capitals: svg(`
    <path d="M8 40h32M10 36h28M12 24h24"/>
    <path d="M14 36V24M19 36V24M24 36V24M29 36V24M34 36V24"/>
    <path d="M15 24a9 9 0 0 1 18 0"/>
    <path d="M24 15v-4"/>
    ${dot(24, 9.5)}`),

  // a route hopping across the globe
  tour: svg(`
    <circle cx="24" cy="24" r="17"/>
    <path d="M13 19c4-6 10-8 16-6s9 8 7 13-8 9-14 7-11-6-10-10" stroke-dasharray="2 3"/>
    <circle cx="13" cy="19" r="1.6" fill="currentColor"/>
    <circle cx="29" cy="13" r="1.6" fill="currentColor"/>
    <circle cx="36" cy="26" r="1.6" fill="currentColor"/>
    <circle cx="22" cy="33" r="1.6" fill="currentColor"/>
    ${dot(12, 23)}`),

  // two nearly identical flags
  lookalikes: svg(`
    <path d="M11 41V8M29 41V8"/>
    <path d="M11 9h12v10H11M29 9h12v10H29"/>
    <path d="M11 14h12M29 14h12"/>
    ${dot(35, 11.5, 1.6)}`),

  // a straight road to the horizon
  lost: svg(`
    <path d="M5 27h38"/>
    <path d="M21 27 11 43M27 27l10 16"/>
    <path d="M24 31v2.5M24 37v4"/>
    ${dot(34, 16, 3)}`),

  // a viewfinder on a landscape
  snapshot: svg(`
    <path d="M8 15V8h7M33 8h7v7M40 33v7h-7M15 40H8v-7"/>
    <path d="M12 32l7-8 5 5 6-7 6 10"/>
    ${dot(31, 15)}`),

  // a calendar page
  daily: svg(`
    <path d="M10 12h28v26H10zM10 19h28M17 8v7M31 8v7"/>
    ${dot(24, 28.5, 2.6)}`),

  // two sliders
  custom: svg(`
    <path d="M8 17h32M8 31h32"/>
    <circle cx="18" cy="17" r="3.5" class="knob"/>
    <circle cx="31" cy="31" r="3.5" class="knob a-stroke"/>`),
};
