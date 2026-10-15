import { STATUSES } from '../utils/helpers';

// Dropdown used to change an application's status (list, board and detail page)
function StatusSelect({ value, onChange, disabled }) {
  return (
    <select
      className={`status-select status-${value.toLowerCase()}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export default StatusSelect;
