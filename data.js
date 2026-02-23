// ==========================================
// DATA CENTER - SUPER CORE TORONTO (V4 - FINAL)
// ==========================================
// Khung: Bathurst - Bay | College - Front West
// Đội hình: 10 Store (3 Tàu - 7 Tây) chiến lược nhất.
// Tiêu chí: Mặt tiền, dễ tìm, mở cửa cuối tuần (Rabba 24/7).
// Mentor Note: Đã bảo mật Huê Thạnh và tối ưu lộ trình cho sếp Bảo.

const categories = [
    { label: "Protein Good Food", icon: "utensils", desc: "High protein under $15" },
    { label: "Gyms & Martial Arts", icon: "dumbbell", desc: "Gyms & MMA studios" },
    { label: "Supplements Store", icon: "pill", desc: "Protein & shops" },
    { label: "Fitness Hangout", icon: "tree-pine", desc: "Parks & run clubs" }
];

const markerColors = { 
    Supermarket: "#16a34a", 
    Restaurant: "#ea580c", 
    Gym: "#2563eb", 
    Supplements: "#dc2626",
    Park: "#22c55e"
};

const stores = [
    // --- NHÓM 3 SIÊU THỊ TÀU (LÕI SPADINA - DUNDAS) ---
    { 
        id: "s_huasheng", 
        store: "Hua Sheng (Huê Thạnh)", 
        address: "299 Spadina Ave, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6548, lng: -79.3988,
        flyer_img: "img/huasheng_live.jpg", 
        items: [{ name: "Ground Beef", price: 4.99, protein: 22, x: 30, y: 40, w: 40, h: 25 }]
    },
    { 
        id: "s_kaiwei", 
        store: "Kai Wei Supermarket", 
        address: "253 Spadina Ave, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6542, lng: -79.3991,
        flyer_img: "img/kaiwei_live.jpg", 
        items: [{ name: "Chicken Drumsticks", price: 1.88, protein: 24, x: 20, y: 30, w: 50, h: 15 }]
    },
    { 
        id: "s_luckymoose", 
        store: "Lucky Moose Food Mart", 
        address: "393 Dundas St W, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6534, lng: -79.3957,
        flyer_img: "img/luckymoose_live.jpg", 
        items: [{ name: "Pork Loin", price: 2.49, protein: 26, x: 15, y: 20, w: 60, h: 20 }]
    },

    // --- NHÓM 7 SIÊU THỊ TÂY/MODERN (PHỦ KÍN LÕI TRUNG TÂM) ---
    { 
        id: "s_tandt_college", 
        store: "T&T Supermarket College", 
        address: "297 College St, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6582, lng: -79.4002,
        flyer_img: "img/tandt_college.jpg", 
        items: [{ name: "Salmon Fillet", price: 11.88, protein: 20, x: 50, y: 50, w: 20, h: 10 }]
    },
    { 
        id: "s_loblaws_queen", 
        store: "Loblaws Queen St W", 
        address: "585 Queen St W, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6477, lng: -79.4016,
        flyer_img: "img/loblaws_queen.jpg", 
        items: [{ name: "AAA Ribeye", price: 15.99, protein: 25, x: 50, y: 50, w: 20, h: 10 }]
    },
    { 
        id: "s_kingfresh", 
        store: "King Fresh (King West)", 
        address: "322 King St W, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6469, lng: -79.3897,
        flyer_img: "img/kingfresh_live.jpg", 
        items: [{ name: "Pork Belly", price: 4.50, protein: 22, x: 50, y: 50, w: 20, h: 10 }]
    },
    { 
        id: "s_mikes_independent", 
        store: "Mike's Independent (Peter St)", 
        address: "111 Peter St, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6483, lng: -79.3920,
        flyer_img: "img/mikes_independent.jpg", 
        items: [{ name: "Chicken Breast Pack", price: 11.50, protein: 31, x: 50, y: 50, w: 20, h: 10 }]
    },
    { 
        id: "s_rabba_adelaide", 
        store: "Rabba Fine Foods (Adelaide)", 
        address: "252 Adelaide St W, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6485, lng: -79.3885,
        flyer_img: "img/rabba_live.jpg", 
        items: [{ name: "Eggs 12pk", price: 4.99, protein: 6, x: 50, y: 50, w: 20, h: 10 }]
    },
    { 
        id: "s_sobeys_front", 
        store: "Sobeys Front St W", 
        address: "156 Front St W, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6450, lng: -79.3850,
        flyer_img: "img/sobeys_front.jpg", 
        items: [{ name: "Lean Ground Beef", price: 6.99, protein: 26, x: 50, y: 50, w: 20, h: 10 }]
    },
    { 
        id: "s_farmboy_bay", 
        store: "Farm Boy (Bay St)", 
        address: "777 Bay St, Toronto", 
        category: "Protein Good Food", 
        sub_type: "Supermarket", 
        lat: 43.6605, lng: -79.3848,
        flyer_img: "img/farmboy_this_week.jpg", 
        items: [{ name: "Sirloin Steak", price: 14.99, protein: 27, x: 40, y: 30, w: 30, h: 20 }]
    }
];

const dietPlans = [
    { goal: "Muscle Gain", cal: "2500 kcal", menu: ["Sáng: 3 trứng + bánh mì đen", "Trưa: 200g ức gà", "Tối: 200g Bò"] },
    { goal: "Fat Loss", cal: "1800 kcal", menu: ["Sáng: Sữa yogurt Hy Lạp", "Trưa: Salad gà", "Tối: Cá hấp"] }
];