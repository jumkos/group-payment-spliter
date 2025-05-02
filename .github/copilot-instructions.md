# Copilot Instructions: Group Payment Splitter (MEVN Stack)  

## 🎯 **Core Features**  
1. **Proportional Discount Distribution**  
   - Discounts are split based on each person's order value.  
   - Formula:  
     ```javascript  
     const discountShare = (personAmount / subtotal) * totalDiscount;  
     const amountOwed = personAmount - discountShare + (deliveryFee / totalPeople);  
     ```  
   - *Example*:  
     - Subtotal: Rp65,000 (Orders: A=15k, B=16k, C=20k, D=10k + Delivery=4k)  
     - Discount: Rp20,000 → Person C (Rp20k) gets ~Rp6,154 off.  

2. **Rounding Rules**  
   - Round to nearest **Rp100** (e.g., Rp10,385 → Rp10,400).  

---  

## ⚙️ **Tech Stack (MEVN)**  
- **Backend**: Node.js + Express.js  
  - API endpoints for:  
    - `/calculate` (POST): Processes form data, returns splits.  
    - `/history` (GET): Fetches past orders.  
- **Frontend**: Vue.js 3  
  - Form input with validation.  
  - Table output (columns: `Person | Order Amount | Discount Share | Final Owed`).  
- **Database**: MongoDB  
  - Schema:  
    ```javascript  
    {  
      orders: [  
        { name: string, amount: number, discountShare: number, finalOwed: number }  
      ],  
      deliveryFee: number,  
      totalDiscount: number,  
      createdAt: Date  
    }  
    ```  

---  

## ⚠️ **Avoid**  
- Hardcoding currency (always use **Rp**).  
- Equal discount splits (strictly proportional).  
- Floating-point precision errors (use `toFixed(2)` for display).  

---  

## 📝 **Workflow Rules**  
1. **Input Form (Vue.js)**  
   - Dynamic fields to add/remove people.  
   - Required: Name, Order Amount.  
   - Optional: Delivery Fee, Discount (default to 0).  

2. **Output Table**  
   - Highlight who saved the most (e.g., green row for largest discount share).  

3. **History Page**  
   - Sort by date, filter by total spent.  

---  

## 🧪 **Test Cases for Reliability**  
### **1. Discount Distribution**  
- **Input**: Orders=[15k, 16k, 20k, 10k], Delivery=4k, Discount=20k  
- **Expect**:  
  - Person C (Rp20k) gets largest discount (~Rp6,154).  
  - Sum of final owed = Rp45k (65k - 20k).  

### **2. Edge Cases**  
- **Partial Payment**:  
  - Person B already paid Rp10k → Deduct from `finalOwed`.  
- **Zero Discount**:  
  - Ensure `deliveryFee` is split evenly.  
- **Rounding Validation**:  
  - Rp10,385 → Rp10,400 (nearest Rp100).  

### **3. Data Integrity (MongoDB)**  
- Verify no duplicate orders on save.  
- Ensure `createdAt` timestamps are UTC.  

---  

## 💬 **Tone & Style**  
- **Code Comments**: JSDoc for functions, inline for complex logic.  
- **UI Text**: Friendly but concise (e.g., "✅ Saved to history!").  

---  
