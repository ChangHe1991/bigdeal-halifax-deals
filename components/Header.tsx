type HeaderProps = {
  location?: string;
};

export default function Header({ location = "Bedford, NS" }: HeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Location</p>
        <h1 className="text-lg font-semibold">{location}</h1>
      </div>
      <p className="text-sm text-gray-500">Grocery Deals Finder</p>
    </header>
  );
}
