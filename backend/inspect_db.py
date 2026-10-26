import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "doodh_ledger.db")

def inspect():
    if not os.path.exists(DB_PATH):
        print(f"Database file not found at: {DB_PATH}")
        print("Please start the backend once to initialize the database.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("\n" + "="*60)
    print("📁 DATABASE: doodh_ledger.db")
    print("="*60)

    # 1. Users / Milkmen
    print("\n🧑‍🌾 VENDORS / USERS (users):")
    cursor.execute("SELECT id, name, phone, business_name, upi_id FROM users")
    users = cursor.fetchall()
    if users:
        print(f"{'ID':<4} | {'Name':<25} | {'Phone':<12} | {'Business':<25} | {'UPI ID':<20}")
        print("-" * 90)
        for u in users:
            print(f"{u[0]:<4} | {u[1]:<25} | {u[2]:<12} | {u[3]:<25} | {str(u[4]):<20}")
    else:
        print("No users found.")

    # 2. Customers
    print("\n👥 CUSTOMERS (customers):")
    cursor.execute("SELECT id, name, phone, address, default_quantity, milk_type, price_per_liter FROM customers WHERE is_active=1")
    customers = cursor.fetchall()
    if customers:
        print(f"{'ID':<4} | {'Name':<20} | {'Phone':<12} | {'Address':<30} | {'Qty(L)':<6} | {'Type':<8} | {'Rate(₹)':<6}")
        print("-" * 95)
        for c in customers:
            print(f"{c[0]:<4} | {c[1]:<20} | {str(c[2]):<12} | {str(c[3]):<30} | {c[4]:<6} | {c[5]:<8} | {c[6]:<6}")
    else:
        print("No customers found.")

    # 3. Customer SubUsers (Family Members)
    print("\n👨‍👩‍👧‍👦 CUSTOMER SUB-USERS / FAMILY MEMBERS (customer_subusers):")
    cursor.execute("SELECT id, customer_id, name, phone, relation FROM customer_subusers")
    subusers = cursor.fetchall()
    if subusers:
        print(f"{'ID':<4} | {'Cust ID':<8} | {'Name':<20} | {'Relation':<15} | {'Phone':<15}")
        print("-" * 65)
        for s in subusers:
            print(f"{s[0]:<4} | {s[1]:<8} | {s[2]:<20} | {s[4]:<15} | {str(s[3]):<15}")
    else:
        print("No subusers recorded yet.")

    # 4. Customer Messages
    print("\n💬 MESSAGES (customer_messages):")
    cursor.execute("SELECT id, customer_id, sender_name, sender_role, message, created_at FROM customer_messages")
    msgs = cursor.fetchall()
    if msgs:
        print(f"{'ID':<4} | {'Cust ID':<8} | {'Sender':<15} | {'Role':<10} | {'Message':<35}")
        print("-" * 80)
        for m in msgs:
            print(f"{m[0]:<4} | {m[1]:<8} | {m[2]:<15} | {m[3]:<10} | {m[4]:<35}")
    else:
        print("No messages recorded yet.")

    # 5. Daily Logs
    print("\n🥛 DAILY LOGS (daily_logs):")
    cursor.execute("SELECT id, customer_id, date, quantity_delivered, status FROM daily_logs ORDER BY date DESC, id ASC LIMIT 10")
    logs = cursor.fetchall()
    if logs:
        print(f"{'ID':<4} | {'Cust ID':<8} | {'Date':<12} | {'Delivered (L)':<14} | {'Status':<10}")
        print("-" * 55)
        for l in logs:
            print(f"{l[0]:<4} | {l[1]:<8} | {l[2]:<12} | {l[3]:<14} | {l[4]:<10}")
        print("*(Showing latest 10 logs)*")
    else:
        print("No daily logs recorded yet.")

    print("\n" + "="*60 + "\n")
    conn.close()

if __name__ == "__main__":
    inspect()
