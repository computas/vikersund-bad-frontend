type InfoFieldProps = {
  label: string;
  value: string | number;
};

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <p>
      <span className="font-medium text-zinc-600 dark:text-zinc-400">
        {label}:
      </span>{" "}
      {value}
    </p>
  );
}
