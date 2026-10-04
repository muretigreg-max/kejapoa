      {/* 1. HERO SECTION WITH FULL-BLEED BACKGROUND SLIDER */}
      <section className="relative min-h-[700px] lg:min-h-[800px] text-white overflow-hidden">
        {/* Background Image Slider */}
        <HeroImageSlider />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
              Find Your Perfect Student <span className="text-emerald-300">Haven</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto drop-shadow-lg">
              Verified, affordable, and close to campus. Skip the stress and find your next room with KejaPoa.
            </p>

            {/* Search Form */}
            <form 
              action="/search" 
              method="GET" 
              className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl max-w-3xl mx-auto text-slate-900 border border-white/20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative sm:col-span-3">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select 
                    name="institutionId" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-700"
                    required
                  >
                    <option value="">Select Institution</option>
                    <option value="1">Dedan Kimathi University</option>
                    <option value="2">Karatina University</option>
                    <option value="3">Murang'a University</option>
                  </select>
                </div>

                <div className="relative">
                  <Home className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select 
                    name="propertyType" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-700"
                  >
                    <option value="">Any Type</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Bedsitter">Bedsitter</option>
                    <option value="Self-Contained">Self-Contained</option>
                  </select>
                </div>

                <div className="relative sm:col-span-2">
                  <Zap className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select 
                    name="maxBudget" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-700"
                  >
                    <option value="99999">Any Budget</option>
                    <option value="3000">Under KES 3,000</option>
                    <option value="5000">Under KES 5,000</option>
                    <option value="8000">Under KES 8,000</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg hover:scale-105"
              >
                <Search className="h-5 w-5" />
                Search Accommodations
              </button>
            </form>

            {/* Floating Badge */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full text-sm font-semibold border border-white/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-50">500+ Verified Listings</span>
            </div>
          </div>
        </div>
      </section>