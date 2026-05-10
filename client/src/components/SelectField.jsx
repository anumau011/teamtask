import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';

function getOptionLabel(option) {
  if (!isValidElement(option)) {
    return '';
  }

  const optionChildren = option.props.children;
  if (typeof optionChildren === 'string' || typeof optionChildren === 'number') {
    return String(optionChildren);
  }

  return option.props.label || '';
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M5.75 7.75l4.25 4.5 4.25-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SelectField({
  id,
  value,
  onChange,
  className = '',
  wrapperClassName = '',
  disabled = false,
  children,
  ...props
}) {
  const rootRef = useRef(null);
  const buttonId = useId();
  const listboxId = useId();
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () =>
      Children.toArray(children).filter((child) => isValidElement(child) && child.type === 'option'),
    [children]
  );

  const selectedOption = options.find((option) => String(option.props.value) === String(value));
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : '';
  const isEmpty = value === '' || value === null || value === undefined;
  const isPlaceholder = isEmpty && (!selectedLabel || /select|assign/i.test(selectedLabel));

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (nextValue, event) => {
    onChange?.({ target: { value: nextValue, name: props.name } });
    setOpen(false);
  };

  const buttonClassName = [
    'inline-flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm outline-none transition-colors hover:bg-gray-50 focus:border-gray-400 focus:ring-[3px] focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50',
    isPlaceholder ? 'text-gray-400' : 'text-black',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={`relative inline-block ${wrapperClassName}`.trim()}>
      <button
        id={id || buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className={buttonClassName}
      >
        <span className="truncate">{selectedLabel || getOptionLabel(options[0]) || ''}</span>
        <span className="shrink-0 text-gray-500">
          <ArrowIcon />
        </span>
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg"
        >
          {options.map((option) => {
            const optionValue = option.props.value;
            const optionLabel = getOptionLabel(option);
            const isSelected = String(optionValue) === String(value);

            return (
              <button
                key={String(optionValue)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={(event) => handleSelect(optionValue, event)}
                className={[
                  'flex w-full items-center rounded-sm px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100',
                  isSelected ? 'bg-slate-100 font-medium text-black' : 'text-gray-800'
                ].join(' ')}
              >
                {optionLabel}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}