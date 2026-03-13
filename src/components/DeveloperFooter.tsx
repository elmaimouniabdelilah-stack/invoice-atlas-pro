export default function DeveloperFooter() {
  return (
    <footer className="border-t border-border bg-gradient-to-r from-primary/5 via-card to-secondary/10">
      <div className="mx-auto flex flex-col items-center gap-2 px-4 py-4 text-center sm:flex-row sm:justify-between sm:gap-4 sm:py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-foreground leading-tight">عبدالإله الميموني</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              مطور تطبيقات ومواقع — © {new Date().getFullYear()}
            </span>
          </div>
        </div>

        <a
          href="https://wa.me/212677765847"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 rounded-full bg-[hsl(142,70%,49%)]/10 px-3 py-1.5 text-xs font-medium text-[hsl(142,70%,40%)] transition-all hover:bg-[hsl(142,70%,49%)] hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.955L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span dir="ltr">+212 677-765847</span>
          <span className="hidden sm:inline">— لطلب تطوير تطبيق أو موقع</span>
        </a>
      </div>
    </footer>
  );
}
