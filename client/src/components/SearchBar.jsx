export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search messages..."
      className="p-1 px-2 rounded border text-sm w-52"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
