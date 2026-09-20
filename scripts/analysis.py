import pandas as pd
import matplotlib.pyplot as plt
import os

OUTPUT_DIR = "outputs"
DATA_PATH = "data/retail_sales.xlsx"


def ensure_dirs():
    """Ensures that the output directory exists."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_and_clean(path=DATA_PATH):
    """Loads the retail sales data, cleans it, and handles missing values.

    Args:
        path (str): The path to the Excel data file.

    Returns:
        pd.DataFrame: The cleaned DataFrame.
    """
    try:
        df = pd.read_excel(path, engine="openpyxl")
    except FileNotFoundError:
        print(f"Error: Data file not found at {path}")
        raise SystemExit(1)
    except Exception as e:
        print(f"Error loading data: {e}")
        raise SystemExit(1)

    print("Loaded rows:", len(df))

    before = len(df)
    df = df.drop_duplicates()
    print(f"Dropped duplicates: {before - len(df)} rows removed")

    missing_before = df.isna().sum().sum()
    print("Total missing cells before handling:", missing_before)

    df["Order_Date"] = pd.to_datetime(df["Order_Date"], errors="coerce")

    df["Product_Name"] = df["Product_Name"].fillna("Unknown Product")
    # Fill missing Sales based on median sales per product, or 0 if product has no sales history
    df["Sales"] = df["Sales"].fillna(
        df.groupby("Product_Name")["Sales"].transform("median").fillna(0)
    )

    df = df.dropna(subset=["Order_Date"])  # drop if date could not be parsed

    missing_after = df.isna().sum().sum()
    print("Total missing cells after handling:", missing_after)
    return df


def basic_eda(df):
    """Performs basic exploratory data analysis (EDA) on the DataFrame.

    Args:
        df (pd.DataFrame): The input DataFrame.
    """
    print("\n=== DataFrame Info ===")
    print(df.info())
    print("\n=== Describe numeric ===")
    print(df.describe())
    print("\n=== Sample rows ===")
    print(df.head())


def pivot_tables(df):
    """Generates various pivot tables for sales analysis.

    Args:
        df (pd.DataFrame): The input DataFrame.

    Returns:
        dict: A dictionary containing different pivot tables.
    """
    pivots = {}
    df["Order_Month"] = df["Order_Date"].dt.to_period("M").dt.to_timestamp()
    pivots["sales_by_region"] = df.groupby("Region")["Sales"].sum().sort_values(ascending=False)
    pivots["monthly_sales"] = df.groupby("Order_Month")["Sales"].sum().sort_index()
    pivots["top_products"] = df.groupby("Product_Name")["Sales"].sum().sort_values(ascending=False).head(10)
    pivots["category_profit"] = df.groupby("Category")["Profit"].sum().sort_values(ascending=False)
    return pivots


def save_pivots_to_excel(pivots, path="outputs/pivots.xlsx"):
    """Saves the generated pivot tables to an Excel file.

    Args:
        pivots (dict): A dictionary of pivot tables.
        path (str): The path to save the Excel file.
    """
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        for name, series in pivots.items():
            df = series.reset_index()
            df.columns = [c if "index" not in c else "Index" for c in df.columns]
            df.to_excel(writer, sheet_name=name[:31], index=False)
    print("Saved pivot tables to", path)


def visualizations(df, pivots):
    """Generates and saves various data visualizations.

    Args:
        df (pd.DataFrame): The input DataFrame.
        pivots (dict): A dictionary of pivot tables.
    """
    ensure_dirs()
    # Monthly sales trend (line)
    plt.figure(figsize=(12, 6))
    pivots["monthly_sales"].plot(marker='o', color='#1f77b4', linewidth=2)
    plt.title('Monthly Sales Trend', fontsize=16)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Sales', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/monthly_sales_trend.png")
    plt.close()

    # Top 10 products by sales (bar)
    plt.figure(figsize=(12, 7))
    pivots["top_products"].sort_values().plot(kind='barh', color='#ff7f0e')
    plt.title('Top 10 Products by Sales', fontsize=16)
    plt.xlabel('Sales', fontsize=12)
    plt.ylabel('Product Name', fontsize=12)
    plt.grid(axis='x', linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/top10_products.png")
    plt.close()

    # Category-wise profit (bar)
    plt.figure(figsize=(10, 6))
    pivots["category_profit"].plot(kind='bar', color='#2ca02c')
    plt.title('Category-wise Profit', fontsize=16)
    plt.xlabel('Category', fontsize=12)
    plt.ylabel('Profit', fontsize=12)
    plt.grid(axis='y', linestyle='--', alpha=0.6)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/category_profit.png")
    plt.close()
    print('Saved visualizations to', OUTPUT_DIR)


def profitability_analysis(df):
    """Performs profitability analysis and calculates key metrics.

    Args:
        df (pd.DataFrame): The input DataFrame.

    Returns:
        dict: A dictionary containing profitability metrics.
    """
    tot_sales = df["Sales"].sum()
    tot_profit = df["Profit"].sum()
    orders = df["Order_ID"].nunique()
    print(f"Total Sales: {tot_sales:,.2f}")
    print(f"Total Profit: {tot_profit:,.2f}")
    print(f"Total Orders: {orders}")

    df["profit_margin"] = df["Profit"] / df["Sales"]
    margin_by_category = df.groupby("Category")["profit_margin"].mean().sort_values(ascending=False)
    print("\nAverage profit margin by category:")
    print(margin_by_category)
    return {"total_sales": tot_sales, "total_profit": tot_profit, "total_orders": orders, "margin_by_category": margin_by_category}


def top_customers(df, top_n=10):
    """Identifies and prints the top customers by sales.

    Args:
        df (pd.DataFrame): The input DataFrame.
        top_n (int): The number of top customers to display.

    Returns:
        pd.Series: A Series of top customers and their sales.
    """
    cust = df.groupby("Customer_ID")["Sales"].sum().sort_values(ascending=False).head(top_n)
    print(f"\nTop {top_n} customers by sales:")
    print(cust)
    return cust


def save_summary_metrics(metrics, path="outputs/summary_metrics.txt"):
    """Saves the summary metrics to a text file.

    Args:
        metrics (dict): A dictionary of summary metrics.
        path (str): The path to save the text file.
    """
    with open(path, "w") as f:
        f.write(f"Total Sales: {metrics['total_sales']:.2f}\n")
        f.write(f"Total Profit: {metrics['total_profit']:.2f}\n")
        f.write(f"Total Orders: {metrics['total_orders']}\n")
    print('Saved summary metrics to', path)


if __name__ == '__main__':
    ensure_dirs()
    if not os.path.exists(DATA_PATH):
        print('Data file not found. Run scripts/generate_dataset.py first to create data/retail_sales.xlsx')
        raise SystemExit(1)

    df = load_and_clean(DATA_PATH)
    basic_eda(df)
    pivots = pivot_tables(df)
    save_pivots_to_excel(pivots)
    metrics = profitability_analysis(df)
    top_customers(df)
    visualizations(df, pivots)
    save_summary_metrics(metrics)
    print('\nBusiness insights and next steps are included in README.md')
