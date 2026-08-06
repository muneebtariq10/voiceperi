# PrintEZ Official Shipping Methods, Rate Calculations & Tax Policy

This document serves as the authoritative source of truth for PrintEZ shipping options, mathematical rate percentages, minimum carrier fees, and store sales tax calculations. AI Voice Concierge agents and backend checkout services must strictly apply these formulas when computing order estimates.

---

## 1. Free Shipping Threshold (Ground Shipping Only)

* **Official Rule:** **Free Ground Shipping ($0.00) on all orders with an item subtotal of $150.00 or more** (before taxes or promotional discounts).
* **Eligibility:** Automatically replaces standard Ground shipping rates for continental U.S. delivery whenever the cart subtotal reaches or exceeds `$150.00`.
* **AI Concierge Script:** *"Good news! Because your order subtotal is over $150, you qualify for completely free standard Ground shipping!"*

---

## 2. Shipping Rate Calculation Matrix & Percentage Formulas

PrintEZ calculates live shipping delivery fees based on an item subtotal percentage with a mandatory minimum carrier cost. For any given shipping method, the price is calculated as:
$$\text{Shipping Fee} = \max(\text{Minimum Cost}, \text{Subtotal} \times \text{Rate \%})$$

| Shipping Method | Rate (%) of Subtotal | Minimum Cost ($) | Sort Order | Calculation Formula & Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Free Shipping** | **0%** | **$0.00** | 1 | Applicable automatically when Subtotal $\ge$ **$150.00** |
| **Ground** | **17%** | **$11.99** | 2 | Fee is **17% of Subtotal** or **$11.99 minimum** (for orders under $150.00) |
| **Two-Day** | **65%** | **$55.00** | 3 | Fee is **65% of Subtotal** or **$55.00 minimum** (whichever is greater) |
| **Next Day** | **80%** | **$79.99** | 4 | Fee is **80% of Subtotal** or **$79.99 minimum** (whichever is greater) |

### Practical Calculation Examples for AI Agents & Backend Staging

* **Example 1 ($55.99 Order via Ground):**
  * Subtotal is `$55.99` (Under $150 Free Shipping threshold).
  * $17\%$ of $\$55.99 = \$9.52$. Because $\$9.52$ is below the minimum carrier cost, **Ground Shipping is capped at the $\$11.99$ minimum**.
  * Estimated Total = $\$55.99 + \$11.99 = \mathbf{\$67.98}$.
* **Example 2 ($120.00 Order via Ground):**
  * $17\%$ of $\$120.00 = \$20.40$. Because $\$20.40$ exceeds the $\$11.99$ minimum, **Ground Shipping is $\$20.40$**.
  * Estimated Total = $\$120.00 + \$20.40 = \mathbf{\$140.40}$.
* **Example 3 ($200.00 Order via Ground vs. Next Day):**
  * **If Ground:** Subtotal is over $150, so Ground Shipping is **$0.00 (Free Shipping)**. Total = **$200.00**.
  * **If Next Day Air:** Expedited shipping does not qualify for free promotion. $80\%$ of $\$200.00 = \$160.00$. Next Day Air is **$160.00**. Total = **$360.00**.

---

## 3. Store Sales Tax Policy & Percentage Calculation

* **Applicability:** Store sales tax is **only applicable to orders shipped within select physical nexus states** (such as commercial operational facilities in New York, New Jersey, or designated local warehouse jurisdictions).
* **Out-of-State Exemptions:** Orders shipping out-of-state across the vast majority of U.S. jurisdictions, or ordered by verified tax-exempt corporate entities, qualify for **0% ($0.00) sales tax**.
* **Calculation Formula:** For applicable taxable destination states, sales tax is computed strictly on the item subtotal (and taxable shipping fees where required by state law):
  $$\text{Estimated Tax} = \text{Taxable Amount} \times \text{Applicable State Sales Tax \%}$$
* **AI Concierge Guidance:** If a customer asks about taxes, respond: *"Sales tax is only applicable to select state destinations where we maintain a physical presence. If your shipping address is in an exempt jurisdiction or if you hold a valid corporate tax exemption certificate, your sales tax will be $0.00 upon checkout!"*

---

## 4. Operating Instructions for AI Voice Concierge

1. **Calculate Accurate Live Quotes:** When reciting estimated pricing to callers, explicitly apply the **17% Ground / $11.99 Minimum** formula for orders under $150, or promote **$0.00 Free Shipping** for orders $150 and above.
2. **Explain Expedited Tiers Clearly:** If a caller requires urgent delivery, quote the Two-Day (65% / $55 min) or Next Day (80% / $79.99 min) formulas accurately without guessing.
3. **Transparent Tax Guidance:** State clearly that sales tax is automatically applied during secure link checkout based on state nexus laws, remaining $0.00 for exempt jurisdictions.
