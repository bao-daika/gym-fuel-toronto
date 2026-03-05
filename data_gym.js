const gymStores = [
    { 
        id: "g_hone", store: "Hone Fitness Queen & Spadina", address: "196 Spadina Ave., Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.65017, lng: -79.39740,
        price: 30, features: "Hammer Strength, Turf, 24/7 Access", hours: "6AM - 11PM", quiet_time: "10AM - 2PM", busy_time: "5PM - 8PM"
    },
    { 
        id: "g_goodlife", store: "GoodLife Richmond and John", address: "267 Richmond St W, Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.64875, lng: -79.39194,
        price: 70, features: "Olympic Platforms, Sauna, Towel Service", hours: "24 Hours", quiet_time: "11PM - 5AM", busy_time: "4PM - 7PM"
    },
    { 
        id: "m_openmat", store: "OpenMat MMA", address: "295 College St, Toronto", category: "Gyms & Martial Arts", sub_type: "MartialArts", lat: 43.65757, lng: -79.40130,
        price: 180, features: "BJJ, Muay Thai, Wrestling, Yoga", hours: "11AM - 9PM", quiet_time: "1PM - 4PM", busy_time: "6PM - 8PM"
    },
    { 
        id: "m_161boxing", store: "161 Boxing Club", address: "161 Spadina Ave., Toronto", category: "Gyms & Martial Arts", sub_type: "MartialArts", lat: 43.64832, lng: -79.39579,
        price: 150, features: "Boxing Rings, Heavy Bags, Speed Bags", hours: "7AM - 9PM", quiet_time: "12PM - 3PM", busy_time: "5PM - 8PM"
    },
    { 
        id: "g_anytime", store: "Anytime Fitness", address: "370 King St W, Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.64651, lng: -79.39162,
        price: 55, features: "24/7 Access, Private Showers, Cardio", hours: "24 Hours", quiet_time: "1PM - 4PM", busy_time: "7AM - 9AM"
    },
    { 
        id: "m_tkmt", store: "TKMT Downtown", address: "610 Queen St W, Toronto", category: "Gyms & Martial Arts", sub_type: "MartialArts", lat: 43.64717, lng: -79.40490,
        price: 160, features: "Muay Thai, Kickboxing, Clinch Work", hours: "4PM - 9PM", quiet_time: "N/A", busy_time: "6PM - 8PM"
    },
    { 
        id: "g_f45", store: "F45 Training King West", address: "67A Portland St, Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.64371, lng: -79.39919,
        price: 250, features: "Functional HIIT, Group Classes, Heart Monitoring", hours: "6AM - 8PM", quiet_time: "11AM - 4PM", busy_time: "6AM - 9AM"
    },
    { 
        id: "g_fitfactory", store: "Fit Factory Downtown", address: "373 King St W, Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.64570, lng: -79.39290,
        price: 200, features: "Bootcamp, Boxing, Strength & Conditioning", hours: "6AM - 9PM", quiet_time: "1PM - 4PM", busy_time: "5PM - 7PM"
    },
    { 
        id: "g_equinox", store: "Equinox Bay Street", address: "199 Bay St., Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.64808, lng: -79.37966,
        price: 280, features: "Luxury Amenities, Eucalyptus Towels, Spa", hours: "5AM - 10PM", quiet_time: "10AM - 3PM", busy_time: "12PM - 2PM"
    },
    { 
        id: "g_barrys", store: "Barry's Richmond", address: "310 Richmond St W, Toronto", category: "Gyms & Martial Arts", sub_type: "Gym", lat: 43.64898, lng: -79.39186,
        price: 32, features: "Woodway Treadmills, Red Room, HIIT", hours: "6AM - 9PM", quiet_time: "2PM - 4PM", busy_time: "5PM - 7PM"
    }
].map(s => ({
    ...s,
    render: (data) => `
        <h1 class="text-3xl font-black uppercase tracking-tighter">${data.store}</h1>
        <p class="text-xs text-gray-400 mb-6">${data.address}</p>
        
        <div class="grid grid-cols-2 gap-4 mb-32">
            <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                <span class="text-blue-400 text-[10px] font-bold uppercase mb-1 block">⚡ Features</span>
                <p class="text-[11px] leading-tight text-gray-200">${data.features}</p>
            </div>
            <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                <span class="text-orange-400 text-[10px] font-bold uppercase mb-1 block">⏰ Hours</span>
                <p class="text-[11px] leading-tight text-gray-200">${data.hours}</p>
            </div>
            <div class="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 text-green-400 font-bold">
                <span class="text-[10px] uppercase mb-1 block">🟢 Quiet</span>
                <p class="text-sm">${data.quiet_time}</p>
            </div>
            <div class="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-red-400 font-bold">
                <span class="text-[10px] uppercase mb-1 block">🔴 Busy</span>
                <p class="text-sm">${data.busy_time}</p>
            </div>
        </div>

        <div class="fixed bottom-0 left-0 right-0 p-6 glass border-t border-gray-800 text-center z-[2002]">
            <span class="text-[10px] text-gray-400 block uppercase tracking-widest">${data.sub_type === 'Gym' ? 'Membership From' : 'Price / Monthly'}</span>
            <span class="text-4xl font-black text-blue-400">$${data.price}</span>
        </div>
    `
}));