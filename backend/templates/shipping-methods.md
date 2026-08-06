# PrintEZ Official Shipping Methods & Delivery Policy

This document serves as the authoritative source of truth for PrintEZ shipping methods, production turnarounds, and free shipping rules. AI Voice Concierge agents and backend order processing services must strictly adhere to these verified rules without deriving or inventing numbers.

---

## 1. Free Shipping Threshold

* **Official Rule:** **Free Ground Shipping on all orders over $150.00** (based on cart item subtotal before taxes or promotional discounts).
* **Eligibility:** Automatically applied to standard Ground shipments across the continental United States whenever the order subtotal reaches or exceeds $150.00.
* **AI Concierge Guidance:** Whenever an order subtotal approaches or exceeds $150.00, enthusiastically announce to the customer: *"Good news! Because your order subtotal is over $150, you qualify for completely free standard Ground shipping!"*

---

## 2. Available Shipping Methods

PrintEZ relies on trusted commercial delivery networks (UPS, FedEx, and USPS) to deliver custom printing orders safely and on time:

| Method Code | Shipping Method Name | Production & Transit Time | Cost / Eligibility |
| :--- | :--- | :--- | :--- |
| `free` | **Free Ground Shipping** | 3 to 5 business days transit (plus 24-48 hrs custom production) | **$0.00** (Applicable to orders with subtotal ≥ $150.00) |
| `ground` | **Standard Ground** | 3 to 5 business days transit (plus 24-48 hrs custom production) | Standard calculated carrier rate (For orders under $150.00) |
| `expedited` | **Expedited / Priority Air** | 1 to 2 business days transit (plus rush processing options) | Calculated real-time during secure checkout |

---

## 3. Operating Guidelines for AI Telephony Concierge

1. **Promote Value Volume:** Always mention the **$150 Free Shipping threshold** when advising callers on order quantities (such as 1,000 check packages or multi-part form bundles) to help customers maximize value and unlock free shipping.
2. **Production Turnaround Awareness:** Remind customers that custom checks, invoice books, and printed business forms require **24 to 48 business hours** for factory printing and MICR quality verification before leaving our facility.
3. **No Hallucinated Rates:** For shipments under $150, explain clearly that standard Ground shipping applies and exact carrier delivery fees will be displayed on their secure invoice link. Under NO circumstances should you guess, estimate, or invent a specific dollar figure for delivery freight!
4. **Knowledge Lookup:** If a caller asks detailed shipping questions, call the `lookup_knowledge` tool with query `"shipping methods"` to retrieve these exact terms.
