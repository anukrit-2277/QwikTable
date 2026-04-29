# QwikTable — Application Summary

## What is QwikTable?

QwikTable is a smart restaurant queue management platform designed for the city of Jaipur. It solves a simple but frustrating problem — **waiting in long lines at popular restaurants**. Instead of standing at the door and physically waiting for a table, customers can join the queue remotely from their phone, track their position in real time, and even pre-order their meal before they arrive. When their table is almost ready, they get a sound alert and a notification telling them to head over.

For restaurant owners, QwikTable provides a live dashboard to manage their queue — they can see who's waiting, notify customers, seat them, or cancel entries with a single click.

---

## The Problem It Solves

You walk up to a popular restaurant on a busy evening. There's a 30-minute wait. You have no idea how long it'll actually take, you're standing around awkwardly, and by the time you sit down, you still have to wait for your food to be prepared. It's a frustrating experience for the customer, and the restaurant loses potential diners who walk away.

QwikTable fixes this by letting everything happen remotely and in real time.

---

## How It Works — The Customer's Journey

### 1. Landing on the App

When a customer opens QwikTable, they're greeted with a visually rich home screen — a full-screen video background of a dining experience with the tagline **"Never wait in line for a table again"**. Right there on the hero section, there's a search bar to find restaurants.

### 2. Exploring Restaurants

Scrolling down, the customer sees a curated list of **real Jaipur restaurants** — Tapri Central, Bar Palladio, Rawat Mishthan Bhandar, Suvarna Mahal, LMB, Handi Restaurant, Curious Life Coffee Roasters, and Niros. Each restaurant is displayed as a card showing:

- A real photo of the restaurant or its food
- The restaurant's name, cuisine type, and location
- Its rating (color-coded — green for 4+, amber for 3+, red for below)
- The current estimated wait time
- How many people are already in the queue
- Average cost for two

Customers can filter restaurants by criteria like **shortest wait**, **top-rated**, **walk-in friendly** (very short queue), **pre-order available**, or **large group capacity**. There are also curated collections like "Shortest Queues", "Premium Dining", "Pre-Order Friendly", and "Walk-in Ready" — each showing a beautiful cover image and a count of matching restaurants.

There's also a **map view** where customers can see all the restaurants plotted on an interactive map of Jaipur, making it easy to find what's close by.

### 3. Viewing a Restaurant's Page

Tapping on a restaurant card opens its dedicated page. Here the customer sees:

- The restaurant's name, cuisine, full address, rating, and table count
- A **live queue ticker** showing real-time stats — how many people are in the queue, estimated wait time, total tables, and how many are currently occupied. This updates automatically every few seconds.
- A **"Join Queue"** button with a clear message: *"Skip the physical wait. Join remotely and we'll notify you when your table is almost ready."*
- A **full menu** that the customer can browse to plan their order ahead of time

### 4. Joining the Queue

When the customer taps "Join Queue", they're taken to a simple form where they enter:

- **Their name**
- **Their phone number** (this is how they can look up their queue later)
- **Party size** — they select from 1 to 6+ guests using quick-select buttons

After submitting, they're immediately placed in the queue and redirected to their live status page.

### 5. Tracking Queue Status (The Waiting Experience)

This is where QwikTable really shines. Once a customer joins the queue, they see a **live status dashboard** with:

- **A countdown timer** — showing the estimated remaining wait in minutes and seconds, counting down in real time
- **Their position in the queue** — e.g., #3
- **Groups ahead** — how many other parties are still ahead of them
- **A visual progress bar** — filling up as they move closer to the front
- **Their party size** — as a quick reference

The status badge shows either **"Waiting"** (with a pulsing yellow indicator) or **"Table Ready Soon"** (with a green indicator) depending on their state.

While waiting, the customer sees a reassuring message: *"You can relax nearby. We'll alert you with sound + notification when your table is ~5 min away."* There's also a tip suggesting they bookmark the page or use the "My Queue" feature to check back anytime.

**The entire page auto-refreshes every 5 seconds**, so the customer always sees the latest data without manually reloading.

### 6. Pre-Ordering a Meal

While waiting in the queue, the customer can switch to the **"Pre-Order"** tab. Here they can:

- Browse the full restaurant menu organized by category (Starters, Main Course, Desserts, Beverages, etc.)
- Add items to a cart with quantity controls (+ and − buttons)
- See a running total of their order
- Save their pre-order with one tap

The pre-order is attached to their queue entry, so when they're seated, the restaurant already knows what they want and can start preparing it. This means **less waiting for food after being seated**.

Once a pre-order is saved, it shows up on the status tab as a summary — listing every item, its quantity, and the total amount.

### 7. Getting Notified

When the restaurant owner marks a customer as "notified" (meaning their table will be ready in about 5 minutes), several things happen simultaneously:

- **A full-screen seat alert** drops down on their screen — a bold green banner saying *"Your table at [Restaurant Name] is almost ready! Please head to the restaurant now."*
- **A notification sound plays** — a two-tone beep generated directly in the browser, so it works even without any special setup
- **A browser notification pops up** (if the customer gave permission) saying *"Your table at [Restaurant Name] is almost ready! Head over now."*
- The status badge changes to **"Table Ready Soon"** with a green glow
- A prominent banner appears: *"Head to [Restaurant Name] now — your table will be ready in ~5 minutes!"*

### 8. Being Seated

Once the customer arrives and is seated by the restaurant, their status page shows a celebration screen with a confetti emoji — *"You're seated! Enjoy your meal. Your pre-order is being prepared."* — with a button to go back to the home page.

### 9. Checking Queue Status Later (My Queue)

If a customer closes their browser or forgets their queue page URL, they can go to the **"My Queue"** section from the navigation bar. Here they enter the **phone number** they used when joining the queue, and the app looks up all their active queue entries.

For each entry, they see the restaurant name, party size, position, status (Waiting / Table Almost Ready / Seated / Cancelled), estimated wait, and groups ahead. They can tap "View Full Status" to go back to the full live status page.

This page also shows a **step-by-step guide** on how the whole process works — Join → Track → Get Notified → Walk In & Sit.

### 10. Leaving the Queue

At any point while waiting, the customer can tap **"Leave Queue"** at the bottom of their status page. A confirmation dialog asks *"Are you sure you want to leave the queue?"* — if confirmed, their entry is cancelled and the page shows a goodbye message.

---

## How It Works — The Restaurant Owner's Journey

### 1. Logging In

Restaurant owners access their management dashboard through the **"Restaurant Login"** link in the navigation bar. They select their restaurant from a dropdown list and enter their password. (For demo purposes, the password is `admin123` for all restaurants.)

### 2. The Queue Management Dashboard

After logging in, the restaurant owner sees a clean management dashboard showing:

- **Their restaurant name** at the top
- **Two key stats** — total people currently in queue and number of tables available (free)
- **Two sections** of queue entries:

#### Notified Section (🔔 Arriving Soon)
This shows customers who have been notified and are on their way. For each entry, the owner sees:
- Customer name
- Party size
- How they joined (online vs walk-in)
- Their position number
- Whether they have a pre-order (shown as a 📦 badge)
- A **"Seat"** button — to mark them as seated when they arrive

#### Waiting Section (⏳ Waiting)
This shows all customers still in the queue, listed by position. For each entry, the owner sees:
- Position number (#1, #2, etc.)
- Customer name
- Party size
- Join type
- Estimated wait time
- Pre-order indicator
- Three action buttons:
  - **"Notify"** — sends an alert to the customer that their table will be ready in ~5 minutes
  - **"Seat"** — marks them as seated (skipping the notify step if needed)
  - **"✕" (Cancel)** — removes them from the queue

When the queue is empty, the dashboard shows a celebratory message: *"No one waiting — the queue is clear! 🎉"*

The dashboard **auto-refreshes every 5 seconds**, so the owner always has a live view of the queue without needing to manually reload.

---

## Key Features at a Glance

| Feature | What It Does |
|---|---|
| **Remote Queue Join** | Customers join from anywhere using their phone — no physical waiting |
| **Live Wait Estimate** | Real-time countdown timer with queue position and groups ahead |
| **Pre-Order Meals** | Browse the menu and order while waiting — food starts cooking when you sit |
| **Smart Seat Alerts** | Sound + visual + browser notification when table is ~5 min away |
| **Party Size Matching** | Queue entries track group size for better table allocation |
| **My Queue Lookup** | Check queue status anytime using just your phone number |
| **Restaurant Dashboard** | Owners manage the queue — notify, seat, or cancel customers in one click |
| **Live Queue Ticker** | Restaurant pages show real-time queue stats that update automatically |
| **Map View** | See all nearby restaurants plotted on an interactive map |
| **Curated Collections** | Discover restaurants by shortest wait, top rating, pre-order support, etc. |
| **Beautiful Restaurant Cards** | Each restaurant shows real photos, ratings, cuisine, wait time, and cost |

---

## Who Is It For?

**For Diners:**
- Anyone tired of waiting at restaurant doors
- Groups who want to plan ahead and pre-order
- People who want to explore nearby options and compare wait times
- Customers who value their time and prefer a modern dining experience

**For Restaurant Owners:**
- Restaurants with consistent wait times who want to manage queues digitally
- Owners who want to reduce walkaway rates (customers who leave because of long waits)
- Establishments that want to offer pre-ordering to speed up table turnover
- Any restaurant that wants to give their customers a premium, modern experience

---

## The Restaurants on the Platform

QwikTable currently features **8 popular Jaipur restaurants** spanning a range of cuisines and price points:

| Restaurant | Cuisine | Known For |
|---|---|---|
| Tapri Central | Café / Chai | Iconic chai with a view (~₹300 for two) |
| Bar Palladio | Italian / Bar | Elegant palatial dining (~₹2,500 for two) |
| Rawat Mishthan Bhandar | Sweets / Snacks | Legendary pyaaz kachori (~₹200 for two) |
| Suvarna Mahal | Fine Dining | Royal Rajasthani-Mughlai cuisine (~₹4,000 for two) |
| Laxmi Mishthan Bhandar (LMB) | Vegetarian | Heritage restaurant since 1954 (~₹600 for two) |
| Handi Restaurant | Mughlai / North Indian | Famous handi-style curries (~₹800 for two) |
| Curious Life Coffee Roasters | Café / Coffee | Specialty coffee and brunch (~₹500 for two) |
| Niros | Multi-Cuisine | Jaipur's oldest fine-dining since 1949 (~₹1,200 for two) |

---

## In One Line

> **QwikTable lets you skip the restaurant wait — join the queue from your phone, pre-order your meal, and walk in when your table is ready.**
