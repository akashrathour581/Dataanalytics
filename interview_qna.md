Interview Questions & Model Answers (based on this project)

1. Q: How did you generate the dataset and ensure it was realistic?
   A: I used a scripted data generator (`scripts/generate_dataset.py`) with realistic product categories, regional distribution, and price ranges. I added random margins and occasional missing values and duplicates to simulate real-world dirty data.

2. Q: What cleaning steps did you perform and why?
   A: Removed duplicates, parsed and formatted dates, filled missing `Product_Name` with "Unknown Product", and filled missing `Sales` using a grouping median estimate to avoid bias. Dropped rows with unparsable dates.

3. Q: How did you calculate monthly sales trend?
   A: Converted `Order_Date` to a monthly period `Order_Month` and aggregated `Sales` by month using groupby in Pandas, ensuring sorted index for time-series plotting.

4. Q: Which KPIs did you include and why?
   A: Total Sales, Total Profit, Total Orders — these provide top-line revenue, profitability, and volume indicators for quick business decision-making.

5. Q: How would you identify high-value customers?
   A: Aggregate `Sales` by `Customer_ID`, sort descending, and analyze frequency and recency. Combine with RFM analysis for segmentation.

6. Q: Suggest one strategy to improve profit margins.
   A: Increase promotion of higher-margin categories, negotiate supplier terms for low-margin high-volume items, and bundle accessories with high-margin products.

7. Q: What visualizations did you create and why?
   A: Monthly sales trend to detect seasonality, top 10 products to identify bestsellers, and category-wise profit to prioritize categories for margin improvements.

8. Q: How would you move this to a production pipeline?
   A: Parameterize scripts, add CI checks, schedule dataset generation and analysis via cron or workflow, store results in a BI-friendly database, and build dashboards in Power BI/Tableau or Excel with refreshable connections.

9. Q: How do you validate your synthetic data?
   A: Check distributions (mean/median), ensure non-negative sales/profit, validate date ranges, and sample rows to ensure realistic combinations.

10. Q: What are limitations of this synthetic dataset?
    A: No true customer lifecycle data, simplified pricing rules, and limited seasonality modeling. Use real data enrichment for production-grade insights.
