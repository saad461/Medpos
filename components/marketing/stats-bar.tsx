export function StatsBar() {
  const stats = [
    { value: '3,000+', label: 'Pakistan Medicines Pre-loaded' },
    { value: '99.9%', label: 'Uptime Guaranteed' },
    { value: '< 5 min', label: 'Average Setup Time' },
    { value: '14 Days', label: 'Free Trial, No Card Needed' },
  ]

  return (
    <section className="bg-white border-y border-slate-200 py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center md:border-r last:border-r-0 border-slate-100 px-4 group"
            >
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2 transition-transform group-hover:scale-110 duration-300">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium max-w-[150px] mx-auto leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
