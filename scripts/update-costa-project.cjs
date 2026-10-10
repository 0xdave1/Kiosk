const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.log("No connection string found");
  process.exit(1);
}

const sql = postgres(connectionString);

async function run() {
  const projectId = "6993cb84-8bf7-4ece-8071-244d1f1e6bfe";
  const project = await sql`SELECT * FROM projects WHERE id = ${projectId}`;
  if (!project.length) {
    console.log("Costa project not found");
    process.exit(1);
  }

  const existingContent = JSON.parse(project[0].content || "{}");

  const tailoredCostaContent = {
    ...existingContent,
    businessName: "Costa",
    tagline: "Executive Coaster Bus Charters & Nationwide Group Transit",
    category: "Passenger Transit & Luxury Bus Charter",
    heroHeadline: "Executive Coaster Bus Charters. Safe, Air-Conditioned & On Time.",
    heroSubheadline: "30-seater luxury air-conditioned coaster buses for corporate tours, family weddings, church retreats, intercity travel, and airport pickups across Nigeria. Bring your Costa.",
    aboutText: "Based at Plot 312, Nyanya Sports Centre Layout, Costa provides dependable, comfortable, and executive coaster bus rental services tailored for group travel across Abuja and nationwide. Our modern fleet is fully air-conditioned, meticulously serviced, and navigated by licensed, courteous professional drivers.",
    primaryColor: "#034575",
    themeMode: "light",
    contactEmail: "jeremiahvictorgp@gmail.com",
    contactPhone: "+2348116062226",
    whatsappNumber: "2348116062226",
    whatsappLink: "https://wa.me/2348116062226",
    locationAddress: "Plot 312, Nyanya Sports Centre Layout",
    services: [
      {
        title: "Interstate & Intercity Group Charter",
        description: "Point-to-point nationwide transit for families, organizations, and private groups with punctual departures and experienced highway drivers.",
        price: "Custom Route Quote",
        duration: "Single or Return Trip",
        icon: "Compass"
      },
      {
        title: "Corporate & Executive Shuttles",
        description: "Punctual staff conveyance, VIP airport transfers, and executive conference delegate shuttles tailored for corporate teams.",
        price: "Daily / Retainer",
        duration: "Scheduled Dispatch",
        icon: "Briefcase"
      },
      {
        title: "Weddings, Church Retreats & Events",
        description: "Convey your guests in comfort and prestige. 30-seater luxury air-conditioned coaster buses with dedicated uniformed chauffeurs.",
        price: "Special Event Rates",
        duration: "Full Day Charter",
        icon: "Users"
      },
      {
        title: "Excursions & Educational Tours",
        description: "Highest safety standards, functional seatbelts, and vetted highway-certified drivers for school trips, athletic teams, and retreats.",
        price: "Special Tour Rates",
        duration: "Multi-Day Available",
        icon: "ShieldCheck"
      }
    ],
    products: [
      {
        name: "Executive 30-Seater Coaster Bus (City Charter)",
        price: "₦120,000 / day",
        description: "Fully air-conditioned, clean reclining seats, sound system, vetted city driver. Perfect for intra-state movement and events.",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=85",
        category: "City Charters",
        badge: "Most Popular"
      },
      {
        name: "Interstate VIP Highway Coaster Bus",
        price: "₦180,000 / day",
        description: "Dual-cooling high capacity AC, generous rear cargo luggage bay, USB ports, certified long-distance highway chauffeur.",
        image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=85",
        category: "Interstate Transit",
        badge: "Executive VIP"
      },
      {
        name: "Multi-Day Nationwide Tour Package",
        price: "Custom Route Quote",
        description: "Multi-state charter with dedicated driver maintenance, route safety planning, and 24/7 logistics coordination.",
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=85",
        category: "Multi-Day Tours",
        badge: "Full Support"
      }
    ],
    benefits: [
      {
        title: "100% Chilled Air Conditioning",
        description: "Dual-evaporator cooling systems keep all 30 passenger rows freezing cold even during midday Nigerian heat."
      },
      {
        title: "Vetted Highway Chauffeurs",
        description: "Defensive-driving certified drivers with years of interstate highway experience and spotless safety records."
      },
      {
        title: "Instant WhatsApp Booking",
        description: "Direct reservation confirmation on WhatsApp with transparent quotes and zero hidden fees."
      }
    ],
    testimonials: [
      {
        name: "Blessing & Kenneth A.",
        role: "Wedding Clients, Abuja",
        review: "Conveyed our entire wedding bridal train from Nyanya to Maitama without a single hitch. Freezing cold AC, punctual driver, and super polite. Costa is simply the best!",
        rating: 5
      },
      {
        name: "Pastor Timothy O.",
        role: "Grace Assembly Youth",
        review: "We hired two coaster buses for our church annual youth camp in Jos. Clean vehicles, smooth engine, no mechanical breakdowns, and our driver was extraordinarily patient.",
        rating: 5
      },
      {
        name: "Alhaji S. Mohammed",
        role: "Operations Director",
        review: "We rely on Costa for all our company quarterly field visits. Always on time, spotless interiors, and transparent pricing. 10/10 recommendation.",
        rating: 5
      }
    ],
    faqs: [
      {
        question: "What is the passenger capacity of your coaster buses?",
        answer: "Each coaster bus in our fleet comfortably seats 30 adult passengers with ergonomic high-back seating and generous luggage storage."
      },
      {
        question: "Are fuel and driver allowances included in the quote?",
        answer: "Yes, we provide transparent all-inclusive charter quotes that include fuel, driver allowance, and route planning depending on your destination."
      },
      {
        question: "How far in advance should I reserve a bus?",
        answer: "We recommend booking at least 48 to 72 hours prior to your travel date, though emergency same-day dispatch is available depending on fleet availability."
      }
    ],
    updatedAt: new Date().toISOString()
  };

  await sql`
    UPDATE projects
    SET 
      content = ${JSON.stringify(tailoredCostaContent)},
      status = 'Live',
      progress = 100,
      "updatedAt" = NOW()
    WHERE id = ${projectId}
  `;

  console.log("Successfully updated Costa project with tailored Coaster Bus Charter data!");
  await sql.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
