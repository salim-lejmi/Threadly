"""Builds a synthetic, labelled dataset of legit and scam listings (data/listings.csv)."""
import csv
import os
import random

random.seed(42)

SERVICES = {
    "Home repair": ["plumbing repair", "electrical wiring", "painting", "air conditioner maintenance",
                    "furniture assembly", "tile installation"],
    "Design": ["logo design", "brand identity", "poster design", "social media graphics", "website mockups"],
    "Tutoring": ["math tutoring", "English lessons", "physics classes", "programming lessons",
                 "exam preparation"],
    "Photography": ["wedding photography", "portrait sessions", "product photography", "event coverage"],
    "Food and baking": ["custom cakes", "catering for events", "homemade pastries", "meal prep"],
    "Tech help": ["laptop repair", "phone screen replacement", "website development", "network setup",
                  "data recovery"],
    "Beauty": ["makeup for events", "hair styling", "nail care", "skin care sessions"],
    "Other": ["moving help", "gardening", "car washing", "translation services", "pet sitting"],
}

CITIES = ["Tunis", "Sfax", "Sousse", "Ariana", "Bizerte", "Nabeul", "Monastir", "Gabes",
          "Kairouan", "La Marsa"]

LEGIT_TITLES = [
    "{s} in {c}", "Professional {s}", "Affordable {s} - {c}",
    "{s} by an experienced provider", "Reliable {s} service", "{s} for homes and small businesses",
]

LEGIT_SENTENCES = [
    "I offer {s} in {c} with {n} years of experience.",
    "Message me to discuss what you need, I reply within a day.",
    "Quote after a short chat about your project.",
    "Happy to show previous work and give references.",
    "Payment after the job is done, cash or bank transfer.",
    "Clean work, clear pricing and no hidden costs.",
    "Available weekdays and weekends around {c}.",
    "A deposit of 20% may be agreed for larger jobs, the rest on completion.",
    "Contact me here or on WhatsApp to schedule a visit.",
    "Satisfaction guaranteed, if you are not happy I will redo the work.",
    "Urgent jobs are welcome, I will try to come the same day.",
    "Students and families get a discount.",
    "Flexible hours, {s} tailored to your needs.",
    "Fully equipped with my own tools and materials.",
]

SCAM_TITLES = [
    "URGENT {s} - guaranteed results", "{s} - 100% GUARANTEED", "Earn money fast with {s}",
    "Limited offer {s} only today", "{s} cheapest price, send deposit now",
]

SCAM_SENTENCES = [
    "Send the full payment first by Western Union and I will start immediately.",
    "No refunds, no meetings, contact only on WhatsApp.",
    "Guaranteed income of {m} TND per week, no experience needed.",
    "Pay a small registration fee to get started and earn fast.",
    "Transfer the money in advance to secure your spot, only a few places left.",
    "Pay in crypto or gift cards only.",
    "Contact me outside the platform, do not message here.",
    "I am travelling abroad, send the deposit to my agent first and the work will be delivered later.",
    "Click the link and enter your bank details to claim your free prize.",
    "Double your money in 7 days, risk free, send money now.",
    "Price is 90% lower than anyone else, act now before it ends!!!",
    "Advance payment by bank transfer required before any meeting.",
    "Send a copy of your ID and card number to confirm the order.",
    "Limited offer, today only, hurry!",
]


def fill(sentence, s, c):
    return sentence.format(s=s, c=c, n=random.randint(1, 15), m=random.randint(1000, 9000))


def pick_service():
    cat = random.choice(list(SERVICES))
    return cat, random.choice(SERVICES[cat]), random.choice(CITIES)


def make_legit():
    cat, s, c = pick_service()
    title = random.choice(LEGIT_TITLES).format(s=s.capitalize(), c=c)
    body = " ".join(fill(x, s, c) for x in random.sample(LEGIT_SENTENCES, random.randint(2, 4)))
    return f"{title}. {cat}. {body}"


def make_scam():
    cat, s, c = pick_service()
    title = random.choice(SCAM_TITLES + LEGIT_TITLES).format(s=s.capitalize(), c=c)
    sentences = random.sample(SCAM_SENTENCES, random.choice([1, 1, 2, 3]))
    sentences += random.sample(LEGIT_SENTENCES, random.randint(0, 3))
    random.shuffle(sentences)
    body = " ".join(fill(x, s, c) for x in sentences)
    return f"{title}. {cat}. {body}"


def main():
    rows = [(make_legit(), 0) for _ in range(1200)] + [(make_scam(), 1) for _ in range(800)]

    rows = [(t, 1 - y if random.random() < 0.02 else y) for t, y in rows]
    random.shuffle(rows)

    os.makedirs("data", exist_ok=True)
    with open("data/listings.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows ({sum(y for _, y in rows)} scam) to data/listings.csv")


if __name__ == "__main__":
    main()