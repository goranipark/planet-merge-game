import { STAGES } from '../game/objects'
import { getSprite } from '../game/sprites'

function NextPreview({ stage }) {
  const def = STAGES[stage]

  return (
    <div className="card next-preview">
      <span className="label">다음</span>
      <img
        className="next-preview-sprite"
        src={getSprite(stage)}
        alt={def.name}
        width={48}
        height={48}
      />
      <span className="name">{def.name}</span>
    </div>
  )
}

export default NextPreview
