import type { Project } from '../../content/types.ts';

/**
 * A sample case study, used only by test/case-study.ts to check the template.
 * It is never part of the published site: the real build does not read this
 * folder. All text is placeholder; there is no real client or credit here.
 */
export const projects: Project[] = [
  {
    slug: 'template-test',
    kind: 'case',
    title: 'Case study template',
    year: 2026,
    type: 'Template test',
    role: 'Placeholder role',
    roles: ['Placeholder role A', 'Placeholder role B'],
    client: 'Placeholder client',
    place: 'Placeholder place',
    description: 'Placeholder for what the project was.',
    context: 'Placeholder for the original objective.\n\nA second paragraph, to check spacing.',
    direction: 'Placeholder for the visual concept.',
    execution: 'Placeholder for how it was produced.',
    contribution: 'Placeholder for what Heni did.',
    credits: [{ role: 'Placeholder credit', name: 'Placeholder name' }],
    selected: false,
    published: true,
    image: { trim: true },
  },
];
