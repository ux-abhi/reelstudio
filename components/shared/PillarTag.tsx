const CLASSES = ['tag-toolbox', 'tag-decoded', 'tag-take', 'tag-builder', 'tag-hci']

function pillarClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff
  return CLASSES[hash % CLASSES.length]
}

export function PillarTag({ pillar }: { pillar: string }) {
  return <span className={`tag ${pillarClass(pillar)}`}>{pillar}</span>
}
