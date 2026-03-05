const dietArticles = [
    {
        id: "metabolic-switch-01",
        title: "Why You're Not Burning Fat ?",
        thumbnail: "https://images.pexels.com/photos/793765/pexels-photo-793765.jpeg?auto=compress&cs=tinysrgb&w=500", 
        description: "The complete guide to the Insulin Lock, Fat-Baiting, and how to master your body's fuel system.",
        content: `
            <div class="max-w-2xl mx-auto space-y-6 pb-10 px-4 md:px-0">
                <div class="bg-gray-800/50 border border-white/10 p-4 rounded-2xl mb-6">
                    <p class="text-[10px] text-gray-400 italic leading-tight">
                        <strong>Disclaimer:</strong> This content is for educational purposes only and not medical advice. Consult a healthcare professional before changing your diet, especially if you have underlying conditions.
                    </p>
                </div>

                <h1 class="text-white text-3xl font-black uppercase italic md:text-center mb-4 hidden md:block">
                    The Metabolic Switch
                </h1>

                <div class="relative rounded-3xl overflow-hidden shadow-2xl h-56 md:h-80 border border-white/10">
                    <img src="https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-transparent to-transparent"></div>
                </div>

                <section class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 class="text-xl font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span class="w-8 h-[2px] bg-blue-500"></span> 1. Two Fuel Engines
                    </h3>
                    <p class="text-gray-300 text-sm md:text-base leading-relaxed">
                        To understand why you can't lose fat, you must realize your body is a <strong>Hybrid Vehicle</strong>. It has two distinct systems for generating energy:
                    </p>
                    
                    <div class="grid grid-cols-2 gap-4 mt-5">
                        <div class="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 backdrop-blur-sm">
                            <h4 class="text-yellow-500 font-bold text-sm uppercase text-center">Carb Engine</h4>
                            <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter text-center">Glucose Burning</p>
                        </div>
                        <div class="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                            <h4 class="text-green-500 font-bold text-sm uppercase text-center">Fat Engine</h4>
                            <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter text-center">Ketone Burning</p>
                        </div>
                    </div>
                    <p class="text-gray-400 text-sm md:text-base mt-4 italic leading-relaxed border-l-2 border-yellow-500/50 pl-4">
                        <strong>The problem?</strong> Most people spend nearly their entire life in "Carb Mode," meaning their Fat Engine remains underutilized.
                    </p>
                </section>

                <section class="bg-blue-900/20 p-6 rounded-3xl border border-blue-500/30 shadow-xl">
                    <h3 class="text-lg font-bold text-white mb-3 uppercase italic text-blue-300 flex items-center gap-2">
                        🔒 The Insulin Lock
                    </h3>
                    <p class="text-sm md:text-base text-gray-300 leading-relaxed">
                        Why does body fat stay on your belly even when you're hungry? <strong>The answer is often Insulin.</strong> 
                        <br><br>
                        When you consume carbohydrates, your body releases Insulin. This is a <strong>Storage Hormone</strong>. Its primary role is to promote fat storage and inhibit fat release.
                        <br><br>
                        As long as your Insulin level remains chronically elevated, your body is <strong>biologically restricted</strong> from efficiently accessing stored body fat. The metabolic door is effectively locked.
                    </p>
                </section>

                <section>
                    <h3 class="text-xl font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span class="w-8 h-[2px] bg-blue-500"></span> 2. The "Bait" Mechanism
                    </h3>
                    <p class="text-gray-300 text-sm md:text-base leading-relaxed">
                        This is the core principle of LCHF. To burn fat, you must first teach your body to process fat.
                    </p>
                    <div class="bg-gray-800/80 p-5 rounded-2xl mt-4 border-l-4 border-blue-500 shadow-md backdrop-blur-md">
                        <p class="text-gray-200 text-sm md:text-base italic leading-relaxed">
                            "By <strong>consuming</strong> High-Quality Fat and strictly limiting Carbs, you are <strong>baiting</strong> your metabolism. You are retraining your liver to prioritize dietary fat, which eventually leads it to target your stored body fat."
                        </p>
                    </div>
                    <p class="text-gray-400 text-sm md:text-base mt-4 leading-relaxed italic border-t border-white/5 pt-4">
                        Healthy dietary fat has a negligible impact on insulin. It serves as the "spark" that helps flip the switch from Carb-Burning to Fat-Burning mode.
                    </p>
                </section>

                <section class="space-y-4 pt-6 border-t border-gray-800">
                    <h3 class="text-lg font-bold text-red-500 uppercase italic tracking-tighter md:text-center">The Scientific Principles</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-sm">
                            <h4 class="text-white text-sm font-bold uppercase mb-2">Thermodynamics</h4>
                            <p class="text-xs text-gray-400 italic leading-relaxed">LCHF optimizes the metabolic environment, but total energy balance still plays a role in long-term loss.</p>
                        </div>
                        <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-sm">
                            <h4 class="text-white text-sm font-bold uppercase mb-2">Metabolic Flexibility</h4>
                            <p class="text-xs text-gray-400 italic leading-relaxed">The goal is burning Fat for daily life while strategically using Carbs for peak performance.</p>
                        </div>
                    </div>
                </section>

                <div class="pt-4">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-2xl text-center shadow-2xl shadow-blue-900/20 active:scale-[0.98] transition-all cursor-pointer group">
                        <p class="text-white font-black uppercase italic tracking-widest group-hover:tracking-[0.2em] transition-all">
                            Flip the Switch Now
                        </p>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: "extreme-bait-01",
        title: "Xtreme: No Carb - Super High Fat",
        thumbnail: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=500", 
        description: "The nuclear option for fat loss. Learn why pushing your body to the edge is the ultimate bait.",
        content: `
            <div class="max-w-2xl mx-auto space-y-6 pb-10 px-4 md:px-0">
                <div class="bg-red-500/10 border-2 border-red-500/50 p-5 rounded-3xl mb-8">
                    <div class="flex items-center gap-2 text-red-500 mb-3">
                        <span class="font-black uppercase tracking-tighter text-sm">⚠️ Medical Warning & Disclaimer</span>
                    </div>
                    <p class="text-xs text-gray-300 leading-relaxed italic">
                        This content describes an extreme nutritional protocol. We are not medical professionals. This information is for educational purposes only. <strong>Consult a doctor before attempting.</strong> You implement this protocol at your <strong>own risk.</strong>
                    </p>
                </div>

                <h1 class="text-white text-3xl font-black uppercase italic md:text-center">All-In: Therapeutic Ketosis</h1>

                <div class="relative rounded-3xl overflow-hidden shadow-2xl h-56 md:h-80 border border-white/10">
                    <img src="https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-transparent to-transparent"></div>
                </div>

                <section class="bg-gray-800/40 p-6 rounded-3xl border border-white/5">
                    <p class="text-gray-300 leading-relaxed italic text-sm md:text-base">
                        "Going Xtreme is an All-in play—highly focused and intense. It is designed to rapidly shift your metabolism towards total fat adaptation."
                    </p>
                </section>

                <section>
                    <h3 class="text-xl font-bold text-red-500 mb-4 uppercase tracking-wider">⚡ Why it's a "Super Bait"?</h3>
                    <div class="space-y-4">
                        <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h4 class="text-white font-bold mb-1 text-sm">1. Glycogen Depletion</h4>
                            <p class="text-gray-400 text-xs">By dropping Carbs to near zero, Glycogen stores are typically exhausted within 48 hours, forcing the body to seek alternative fuel.</p>
                        </div>
                        <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h4 class="text-white font-bold mb-1 text-sm">2. Maximum Insulin Sensitivity</h4>
                            <p class="text-gray-400 text-xs">With insulin levels at their baseline, the metabolic barriers to your fat stores are significantly reduced.</p>
                        </div>
                        <div class="p-4 bg-red-500/5 rounded-2xl border-l-4 border-red-500">
                            <h4 class="text-white font-bold mb-1 text-sm">3. Targeted Ketogenesis</h4>
                            <p class="text-gray-400 text-xs">Providing the liver with High-Quality Fat stimulates rapid Ketone production, transitioning stored body fat into the primary energy source.</p>
                        </div>
                    </div>
                </section>

                <section class="bg-yellow-500/10 p-6 rounded-3xl border border-yellow-500/20">
                    <h3 class="text-lg font-bold text-yellow-500 mb-4 uppercase flex items-center gap-2">⚠️ Critical Considerations</h3>
                    <div class="space-y-5">
                        <div>
                            <h4 class="text-white font-bold text-sm">1. "Keto Flu" (Adaptation Phase)</h4>
                            <p class="text-gray-400 text-xs mt-1 leading-relaxed">
                                You may experience temporary fatigue or headaches as your brain adapts to Ketones. <br>
                                <strong>Management:</strong> Maintain a proper balance of electrolytes and hydration. Consult a professional for specific mineral needs.
                            </p>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">2. Fat Quality is Vital</h4>
                            <p class="text-gray-400 text-xs mt-1 leading-relaxed">
                                Avoid processed fats. Industrial seed oils can trigger inflammation instead of fat loss. <br>
                                <strong>Preferred Sources:</strong> Extra virgin olive oil, avocado, Omega-3 rich fats, and grass-fed butter. High-quality fuel yields high-quality results.
                            </p>
                        </div>
                    </div>
                </section>

                <section class="border-t border-white/10 pt-6">
                    <h3 class="text-xl font-bold text-blue-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                        🚀 4. The Exit Strategy
                    </h3>
                    <div class="bg-gradient-to-br from-blue-900/40 to-black p-6 rounded-3xl border border-blue-500/20 shadow-inner">
                        <p class="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                            Xtreme Ketosis is your <strong>Strategic Strike</strong>. It is not designed to be a lifelong cage, but a bridge to your new body.
                        </p>
                        <div class="space-y-4">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/40 text-red-500 font-bold text-xs">1-2M</div>
                                <div>
                                    <h4 class="text-white text-sm font-bold uppercase">Phase 1: Deep Burn</h4>
                                    <p class="text-gray-400 text-xs italic">Use the Xtreme protocol to crush stubborn fat stores and reset your baseline insulin sensitivity.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/40 text-green-500 font-bold text-xs">LIFE</div>
                                <div>
                                    <h4 class="text-white text-sm font-bold uppercase">Phase 2: Lifestyle LCHF</h4>
                                    <p class="text-gray-400 text-xs italic">Transition to a flexible Low-Carb High-Fat diet. Maintain healthy fats to enjoy metabolic freedom forever.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="bg-red-600 p-5 rounded-2xl text-center shadow-2xl active:scale-95 transition-all cursor-pointer">
                    <p class="text-white font-black uppercase italic tracking-widest">I UNDERSTAND THE RISK - ACCESS PROTOCOL</p>
                </div>
            </div>
        `
    }
];