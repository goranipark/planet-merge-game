function NextPreview({ mode, stage }) {
  const def = mode.stages[stage]

  return (
    <div className="card next-preview">
      <span className="label">다음 차례</span>
      <img
        className="next-preview-sprite"
        src={mode.getSprite(stage)}
        alt={def.name}
        width={48}
        height={48}
      />
      <span className="name">{def.name}</span>
    </div>
  )
}

export default NextPreview
