import type { Component, JSX } from 'solid-js';

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type ExportToJsonProps = {
  data: () => unknown | null | undefined;
  filename: string | (() => string);
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
};

export const ExportToJson: Component<ExportToJsonProps> = (props) => {
  const handleExport = () => {
    const payload = props.data();
    if (payload == null) return;

    const raw = typeof props.filename === 'function' ? props.filename() : props.filename;
    const name = raw.endsWith('.json') ? raw : `${raw}.json`;
    downloadJson(name, payload);
  };

  return (
    <button
      type='button'
      onClick={handleExport}
      disabled={props.disabled}
      class={
        props.class ??
        'fixed top-2 right-2 z-50 rounded-md bg-[#007a55] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#005c40] disabled:cursor-not-allowed disabled:opacity-40'
      }>
      {props.children ?? 'Export JSON'}
    </button>
  );
};
