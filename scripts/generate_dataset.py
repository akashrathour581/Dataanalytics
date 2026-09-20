import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

PRODUCTS = [
    ("Classic Lamp", "Home"),
    ("Noise-Cancel Headphones", "Electronics"),
    ("Running Shoes", "Apparel"),
    ("Organic Coffee", "Grocery"),
    ("Blender Pro", "Home"),
    ("Smartphone X", "Electronics"),
    ("Yoga Mat", "Sports"),
    ("LED Monitor 24\"", "Electronics"),
    ("Denim Jacket", "Apparel"),
    ("Electric Kettle", "Home"),
    ("Trail Backpack", "Sports"),
    ("Gourmet Tea", "Grocery"),
    ("Scented Candle", "Home"),
    ("Wireless Mouse", "Electronics"),
    ("Tennis Racket", "Sports"),
    ("Protein Bar Pack", "Grocery"),
    ("Formal Shirt", "Apparel"),
    ("Air Purifier", "Home"),
    ("Smartwatch Pro", "Electronics"),
    ("Kitchen Knife Set", "Home"),
]

REGIONS = ["North", "South", "East", "West", "Central"]
PAYMODES = ["Credit Card", "Debit Card", "Cash", "UPI", "Net Banking"]


def random_date(start, end):
    """Generates a random date within a specified range.

    Args:
        start (datetime): The start date.
        end (datetime): The end date.

    Returns:
        datetime: A random date between start and end.
    """
    delta = end - start
    int_delta = delta.days
    random_day = random.randrange(int_delta + 1)
    return start + timedelta(days=random_day)


def generate_dataset(n_rows=700, seed=42):
    """Generates a synthetic retail sales dataset.

    Args:
        n_rows (int): The number of rows (transactions) to generate.
        seed (int): The random seed for reproducibility.

    Returns:
        pd.DataFrame: A DataFrame containing the generated retail sales data.
    """
    random.seed(seed)
    np.random.seed(seed)

    start = datetime.now() - timedelta(days=365 * 2)
    end = datetime.now()

    rows = []
    for i in range(1, n_rows + 1):
        order_id = f"ORD{100000 + i}"
        order_date = random_date(start, end)
        customer_id = f"CUST{random.randint(1000, 1999)}"
        product, category = random.choice(PRODUCTS)
        region = random.choice(REGIONS)
        quantity = int(np.random.choice([1, 1, 1, 2, 2, 3, 4], p=[0.4,0.2,0.2,0.1,0.04,0.04,0.02]))
        base_price = {
            "Home": random.uniform(20, 250),
            "Electronics": random.uniform(50, 1200),
            "Apparel": random.uniform(15, 120),
            "Grocery": random.uniform(3, 40),
            "Sports": random.uniform(10, 350),
        }[category]
        price = round(base_price * np.random.uniform(0.85, 1.25), 2)
        sales = round(price * quantity, 2)
        margin = np.random.uniform(0.05, 0.35)
        profit = round(sales * margin, 2)
        payment = random.choice(PAYMODES)

        if random.random() < 0.01:
            product_name = None
        else:
            product_name = product

        if random.random() < 0.01:
            sales_val = None
        else:
            sales_val = sales

        rows.append(
            {
                "Order_ID": order_id,
                "Order_Date": order_date.strftime("%Y-%m-%d"),
                "Customer_ID": customer_id,
                "Product_Name": product_name,
                "Category": category,
                "Region": region,
                "Sales": sales_val,
                "Quantity": quantity,
                "Profit": profit,
                "Payment_Mode": payment,
            }
        )

    df = pd.DataFrame(rows)
    df = pd.concat([df, df.sample(3, random_state=seed)], ignore_index=True)
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    return df


if __name__ == "__main__":
    df = generate_dataset(700)
    df.index.name = "idx"
    import os

    os.makedirs("data", exist_ok=True)
    df.to_csv("data/retail_sales.csv", index=False)
    df.to_excel("data/retail_sales.xlsx", index=False, engine="openpyxl")
    print("Generated data/retail_sales.csv and data/retail_sales.xlsx with", len(df), "rows")
