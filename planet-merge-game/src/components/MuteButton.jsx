function MuteButton({ muted, onToggle }) {
  return (
    <button
      type="button"
      className="card mute-button"
      onClick={onToggle}
      aria-label={muted ? '소리 켜기' : '소리 끄기'}
      title={muted ? '소리 켜기' : '소리 끄기'}
    >
      <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
    </button>
  )
}

export default MuteButton
