export const infoPagesData = {
  "contact-support": {
    slug: "contact-support",
    title: "Contact Support",
    subtitle: "We're here to help you 24/7. Reach out to our customer care team with any questions or order inquiries.",
    icon: "LuHeadphones",
    lastUpdated: "July 2026",
    sections: [
      {
        type: "contact-channels",
        channels: [
          {
            title: "Customer Support Line",
            detail: "+880 123 456789",
            subdetail: "Mon - Sat: 9:00 AM - 9:00 PM EST",
            icon: "LuPhone"
          },
          {
            title: "Email Assistance",
            detail: "support@nabisfashion.com",
            subdetail: "Guaranteed reply within 24 hours",
            icon: "LuMail"
          },
          {
            title: "Headquarters Office",
            detail: "42 Baker Street, Marylebone",
            subdetail: "London, NW1 6XE, United Kingdom",
            icon: "LuMapPin"
          }
        ]
      },
      {
        type: "form",
        title: "Send Us a Message",
        description: "Fill out the form below and one of our fashion specialists will get back to you promptly."
      },
      {
        type: "faq",
        title: "Frequently Asked Questions",
        items: [
          {
            q: "How can I track my order status?",
            a: "Once your order ships, you will receive an email with a tracking number and a link to monitor your delivery in real-time."
          },
          {
            q: "Can I cancel or modify an order after placing it?",
            a: "Orders are processed quickly. If you need to make changes, please contact us within 1 hour of placing your order."
          },
          {
            q: "Do you ship internationally?",
            a: "Yes! We ship to over 100 countries worldwide with duties prepaid options at checkout."
          }
        ]
      }
    ]
  },

  "shipping-info": {
    slug: "shipping-info",
    title: "Shipping & Delivery Information",
    subtitle: "Everything you need to know about our fast, reliable global shipping methods, rates, and transit times.",
    icon: "LuTruck",
    lastUpdated: "July 2026",
    sections: [
      {
        type: "grid",
        title: "Available Shipping Options",
        items: [
          {
            badge: "Free standard shipping over $50",
            name: "Standard Ground Delivery",
            time: "3 - 5 Business Days",
            cost: "FREE on orders over $50 ($4.99 under $50)",
            description: "Reliable eco-friendly transit using standard postal services."
          },
          {
            badge: "Fastest Express",
            name: "Priority Express Shipping",
            time: "1 - 2 Business Days",
            cost: "$14.99",
            description: "Guaranteed rapid delivery with air courier dispatch."
          },
          {
            badge: "Global Reach",
            name: "International Priority",
            time: "5 - 9 Business Days",
            cost: "Calculated at Checkout",
            description: "Express door-to-door international delivery with duty tax calculation."
          }
        ]
      },
      {
        type: "text",
        title: "Order Processing & Dispatch",
        content: [
          "All orders are processed and packed Monday through Friday (excluding national holidays). Orders placed before 2:00 PM EST will be processed on the same business day.",
          "Once your package departs our central warehouse, you will receive a dispatch confirmation email containing your courier tracking number.",
          "Please double-check your shipping address during checkout. NABIS FASHION is not responsible for delayed shipments due to incorrect address information provided."
        ]
      },
      {
        type: "text",
        title: "Customs, Duties & Taxes",
        content: [
          "For international shipments, customs tariffs, import taxes, and courier handling fees may apply upon entry into your destination country.",
          "DDP (Delivered Duty Paid) options are automatically calculated during checkout for supported regions so you experience no unexpected post-delivery fees."
        ]
      }
    ]
  },

  "returns-refunds": {
    slug: "returns-refunds",
    title: "Returns & Refunds Policy",
    subtitle: "We want you to love what you ordered. If something isn't right, return or exchange it hassle-free within 30 days.",
    icon: "LuRefreshCw",
    lastUpdated: "July 2026",
    sections: [
      {
        type: "highlights",
        title: "Our 30-Day Guarantee",
        items: [
          { title: "30-Day Window", detail: "Return any unworn, unwashed item with tags attached within 30 days of receiving your package." },
          { title: "Free Exchanges", detail: "Exchanging for a different size or color? Shipping for exchanges is 100% free!" },
          { title: "Instant Refund Option", detail: "Receive immediate store credit or standard refund to your original payment method." }
        ]
      },
      {
        type: "steps",
        title: "How to Initiate a Return",
        steps: [
          { number: "01", title: "Log in to Your Account", detail: "Go to 'My Profile & Orders' and select the items you wish to return." },
          { number: "02", title: "Print Shipping Label", detail: "Download and print our pre-paid return shipping label." },
          { number: "03", title: "Pack & Drop Off", detail: "Securely pack your items in the original packaging and drop off at your nearest postal location." },
          { number: "04", title: "Receive Refund", detail: "Once received and inspected at our hub, your refund will be processed within 3-5 business days." }
        ]
      },
      {
        type: "text",
        title: "Non-Returnable Items",
        content: [
          "For hygiene and safety reasons, the following items cannot be returned unless defective: Final Sale items, Intimates/Underwear, Pierced Jewelry, and Customized items.",
          "Items must be returned unworn, unwashed, undamaged, and with all original brand tags attached."
        ]
      }
    ]
  },

  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "At NABIS FASHION, we value your trust and are committed to protecting your personal data and privacy rights.",
    icon: "LuShieldCheck",
    lastUpdated: "July 2026",
    sections: [
      {
        type: "text",
        title: "1. Information We Collect",
        content: [
          "Personal Information: When you create an account, place an order, or subscribe to newsletters, we collect information such as your full name, email address, phone number, shipping address, and payment details.",
          "Automated Device Data: We automatically record your IP address, browser type, device information, and interaction logs through cookies to improve site security and performance."
        ]
      },
      {
        type: "text",
        title: "2. How We Use Your Data",
        content: [
          "To fulfill and deliver your orders accurately.",
          "To process secure transactions through encrypted payment gateways (e.g. Stripe).",
          "To send order updates, shipping notifications, and responsive customer support replies.",
          "To send personalized marketing communications (only if opted-in), which you can unsubscribe from at any time."
        ]
      },
      {
        type: "text",
        title: "3. Data Security & Cookies",
        content: [
          "We employ 256-bit SSL encryption, strict data access protocols, and PCI-DSS compliance to keep your personal data secure.",
          "Cookies help us remember your cart items, analyze traffic, and optimize user experience. You can customize cookie preferences via your browser settings."
        ]
      },
      {
        type: "text",
        title: "4. Your Rights",
        content: [
          "You have the right to access, modify, correct, or request deletion of your personal data at any time.",
          "To exercise these rights or request a data download, contact privacy@nabisfashion.com."
        ]
      }
    ]
  },

  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    subtitle: "Please read these terms carefully before accessing or using the NABIS FASHION website and services.",
    icon: "LuFileText",
    lastUpdated: "July 2026",
    sections: [
      {
        type: "text",
        title: "1. Overview & Agreement",
        content: [
          "This website is operated by NABIS FASHION. Throughout the site, the terms 'we', 'us', and 'our' refer to NABIS FASHION.",
          "By visiting our site or purchasing something from us, you engage in our 'Service' and agree to be bound by the following terms and conditions."
        ]
      },
      {
        type: "text",
        title: "2. Online Store Terms",
        content: [
          "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence.",
          "You may not use our products for any illegal or unauthorized purpose, nor may you violate any laws in your jurisdiction."
        ]
      },
      {
        type: "text",
        title: "3. Product Accuracy & Pricing",
        content: [
          "Prices for our products are subject to change without prior notice.",
          "We reserve the right at any time to modify or discontinue any product or service without notice.",
          "We make every effort to display the colors and images of our products as accurately as possible."
        ]
      },
      {
        type: "text",
        title: "4. User Accounts & Security",
        content: [
          "You are responsible for maintaining the confidentiality of your account credentials and password.",
          "NABIS FASHION reserves the right to refuse service or terminate accounts at our discretion if terms are breached."
        ]
      }
    ]
  }
};
