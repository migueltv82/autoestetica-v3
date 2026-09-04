function ToggleButton({ checked, onChange, className, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={className}
      onClick={() => onChange(!checked)}
    >
      {children}
    </button>
  );
}

export default ToggleButton;
