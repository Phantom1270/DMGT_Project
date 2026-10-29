import { useState } from "react";
import type { Work } from "../../lib/analysis";
import { work } from "../../lib/samples";
import { Check, NumberInput } from "../../components/Lab";
import { MAX_ITEMS, MAX_NAME_LENGTH } from "../../lib/constants";
export default function Editor({
  items,
  onChange,
  selected,
  onSelect,
  durations,
}: {
  items: Work[];
  onChange: (items: Work[]) => void;
  selected: string;
  onSelect: (id: string) => void;
  durations: boolean;
}) {
  const [name, setName] = useState(""),
    [error, setError] = useState("");
  const current = items.find((x) => x.id === selected);
  const update = (changes: Partial<Work>) =>
    onChange(items.map((x) => (x.id === selected ? { ...x, ...changes } : x)));
  return (
    <>
      <label className="field-label">
        Select item
        <select
          aria-label="Select item"
          value={current?.id ?? ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Choose an item</option>
          {items.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      {current && (
        <div className="editor">
          <label className="field-label">
            Name
            <input
              value={current.name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          {durations && (
            <NumberInput
              label="Duration (units)"
              value={current.duration}
              min={0.1}
              max={1000}
              step={0.5}
              onChange={(duration) => update({ duration })}
            />
          )}
          <Check
            label="Completed"
            value={current.completed}
            onChange={(completed) => update({ completed })}
          />
          <fieldset>
            <legend>Prerequisites</legend>
            {items
              .filter((x) => x.id !== selected)
              .map((x) => (
                <Check
                  key={x.id}
                  label={x.name}
                  value={current.prerequisites.includes(x.id)}
                  onChange={(checked) =>
                    update({
                      prerequisites: checked
                        ? [...current.prerequisites, x.id]
                        : current.prerequisites.filter((id) => id !== x.id),
                    })
                  }
                />
              ))}
          </fieldset>
          <button
            onClick={() => {
              onChange(
                items
                  .filter((x) => x.id !== selected)
                  .map((x) => ({
                    ...x,
                    prerequisites: x.prerequisites.filter(
                      (id) => id !== selected,
                    ),
                  })),
              );
              onSelect(items.find((x) => x.id !== selected)?.id ?? "");
            }}
          >
            Delete selected item
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) {
            setError("Enter a name before adding an item.");
            return;
          }
          if (items.length >= MAX_ITEMS) {
            setError(`This classroom lab supports up to ${MAX_ITEMS} items.`);
            return;
          }
          const id = crypto.randomUUID();
          onChange([...items, work(id, name.trim())]);
          onSelect(id);
          setName("");
          setError("");
        }}
      >
        <label className="field-label">
          New item name
          <input
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button>Add item</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
