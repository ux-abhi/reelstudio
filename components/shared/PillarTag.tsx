const PILLAR_CLASS: Record<string, string> = {
  "Designer's Toolbox": 'tag-toolbox',
  'Design Decoded':     'tag-decoded',
  "Builder's Log":      'tag-builder',
  'The Honest Take':    'tag-take',
  'From India to Germany': 'tag-hci',
  'HCI Life':           'tag-hci',
}

export function PillarTag({ pillar }: { pillar: string }) {
  const cls = PILLAR_CLASS[pillar] ?? 'tag-default'
  return <span className={`tag ${cls}`}>{pillar}</span>
}
