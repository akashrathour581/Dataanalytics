import io
import uuid
import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional


from server.storage import DatasetStore, parse_uploaded_file
store = DatasetStore()


def sanitize_val(val):
    """Recursively replaces NaN, inf, -inf with None for JSON compliance."""
    if val is None or val is pd.NA or val is pd.NaT:
        return None
    if isinstance(val, dict):
        return {str(k): sanitize_val(v) for k, v in val.items()}
    if isinstance(val, (list, tuple)):
        return [sanitize_val(v) for v in val]
    if isinstance(val, (bool, np.bool_)):
        return bool(val)
    if isinstance(val, (float, np.floating)):
        if np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (pd.Timestamp, datetime.date, datetime.datetime)):
        return val.isoformat()
    return val


def infer_column_types(df: pd.DataFrame) -> Dict[str, str]:
    """Classifies columns into 'numeric', 'categorical', 'datetime', 'id'."""
    column_types = {}
    for col in df.columns:
        series = df[col]
        col_lower = str(col).lower()
        
        if pd.api.types.is_bool_dtype(series):
            column_types[col] = "categorical"
            continue

        # 1. Check ID
        if col_lower.endswith("_id") or col_lower == "id" or "code" in col_lower or col_lower.endswith("_key"):
            column_types[col] = "id"
            continue

        # 2. Check Datetime
        if pd.api.types.is_datetime64_any_dtype(series):
            column_types[col] = "datetime"
            continue

        if "date" in col_lower or "time" in col_lower or "month" in col_lower or "year" in col_lower or "day" in col_lower or pd.api.types.is_string_dtype(series) or series.dtype == "object":
            sample = series.dropna()
            if len(sample) > 0 and sample.astype(str).str.contains(r"[-/:]").any():
                try:
                    parsed = pd.to_datetime(sample, format='mixed', dayfirst=False, errors="coerce", utc=True)
                    if parsed.notna().mean() >= 0.95:
                        column_types[col] = "datetime"
                        continue
                except Exception:
                    pass

        # 3. Check Numeric
        if pd.api.types.is_numeric_dtype(series):
            if pd.api.types.is_integer_dtype(series) and series.nunique() == len(df) and "id" in col_lower:
                column_types[col] = "id"
            else:
                column_types[col] = "numeric"
            continue

        column_types[col] = "categorical"

    return column_types


def generate_automated_eda(df: pd.DataFrame, dataset_id: str, filename: str, active_sheet: str) -> Dict[str, Any]:
    """Generates complete exploratory data analysis report and chart recommendations."""
    df = df.replace([np.inf, -np.inf], np.nan)
    total_rows = int(len(df))
    total_cols = int(len(df.columns))
    total_cells = total_rows * total_cols
    missing_cells = int(df.isna().sum().sum())
    completeness = round(((total_cells - missing_cells) / max(total_cells, 1)) * 100, 2)
    
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / max(total_rows, 1)) * 100, 2)
    
    # Calculate Data Health Score (0 - 100)
    health_score = max(0, min(100, int(completeness * 0.7 + (100 - duplicate_pct) * 0.3)))

    col_types = infer_column_types(df)
    
    # Column Profiles
    profiles = []
    numeric_cols = []
    categorical_cols = []
    datetime_cols = []

    for col in df.columns:
        ctype = col_types[col]
        series = df[col]
        null_count = int(series.isna().sum())
        null_pct = round((null_count / max(total_rows, 1)) * 100, 2)
        unique_count = int(series.nunique(dropna=True))

        profile = {
            "name": str(col),
            "type": ctype,
            "null_count": null_count,
            "null_pct": null_pct,
            "unique_count": unique_count,
            "count": int(series.count()),
            "unique_pct": round(unique_count / max(total_rows, 1) * 100, 2),
            "constant": unique_count == 1,
            "high_cardinality": unique_count > 50 and unique_count / max(total_rows, 1) > .9,
            "potential_id": ctype == "id" or (total_rows > 1 and unique_count == total_rows),
            "quality_score": round(100 - null_pct, 2) if total_rows else 0,
            "sample_values": [sanitize_val(v) for v in series.dropna().head(5).tolist()]
        }

        if ctype == "numeric":
            numeric_cols.append(col)
            valid = series.dropna()
            if len(valid) > 0:
                profile.update({
                    "min": sanitize_val(valid.min()),
                    "max": sanitize_val(valid.max()),
                    "mean": sanitize_val(valid.mean()),
                    "median": sanitize_val(valid.median()),
                    "std": sanitize_val(valid.std()),
                    "variance": sanitize_val(valid.var()),
                    "mode": [sanitize_val(v) for v in valid.mode().head(10)] if valid.nunique() < len(valid) else [],
                    "range": sanitize_val(valid.max() - valid.min()),
                    "iqr": sanitize_val(valid.quantile(.75) - valid.quantile(.25)),
                    "q50": sanitize_val(valid.quantile(.5)),
                    "p05": sanitize_val(valid.quantile(.05)),
                    "p95": sanitize_val(valid.quantile(.95)),
                    "skewness": sanitize_val(valid.skew()) if len(valid) >= 3 and valid.nunique() > 1 else None,
                    "outlier_count": int(((valid < valid.quantile(.25) - 1.5 * (valid.quantile(.75) - valid.quantile(.25))) | (valid > valid.quantile(.75) + 1.5 * (valid.quantile(.75) - valid.quantile(.25)))).sum()),
                    "q25": sanitize_val(valid.quantile(0.25)),
                    "q75": sanitize_val(valid.quantile(0.75)),
                    "sum": sanitize_val(valid.sum())
                })
        elif ctype == "categorical":
            categorical_cols.append(col)
            val_counts = series.value_counts(dropna=True).head(5)
            profile["top_categories"] = [
                {"label": str(k), "count": int(v), "percentage": round((v / max(total_rows, 1)) * 100, 1)}
                for k, v in val_counts.items()
            ]
        elif ctype == "datetime":
            datetime_cols.append(col)
            try:
                parsed = pd.to_datetime(series, format="mixed", errors="coerce", utc=True).dropna()
                if len(parsed) > 0:
                    profile["min_date"] = parsed.min().strftime("%Y-%m-%d")
                    profile["max_date"] = parsed.max().strftime("%Y-%m-%d")
                    profile["range_days"] = int((parsed.max() - parsed.min()).days)
                    for period, fmt in [("day", "%Y-%m-%d"), ("month", "%Y-%m"), ("year", "%Y")]:
                        counts = parsed.dt.strftime(fmt).value_counts().sort_index()
                        profile["records_by_" + period] = {str(k): int(v) for k, v in counts.head(1000).items()}
                    profile["invalid_dates"] = int(series.notna().sum() - len(parsed))
            except Exception:
                pass

        profiles.append(profile)

    # Executive KPIs
    kpi_items = []
    if numeric_cols:
        for ncol in numeric_cols[:4]:
            val = df[ncol].dropna()
            if len(val) > 0:
                total_val = val.sum()
                avg_val = val.mean()
                kpi_items.append({
                    "column": ncol,
                    "total": sanitize_val(total_val),
                    "average": sanitize_val(avg_val),
                    "min": sanitize_val(val.min()),
                    "max": sanitize_val(val.max())
                })

    # Smart Auto-Generated Charts
    charts = []

    # 1. Time Series Chart (if date exists)
    if datetime_cols and numeric_cols:
        date_col = datetime_cols[0]
        # Prefer Sales or Profit or first numeric
        metric_col = next((c for c in ["Sales", "Revenue", "Amount", "Profit"] if c in numeric_cols), numeric_cols[0])
        try:
            df_temp = df[[date_col, metric_col]].dropna().copy()
            df_temp["_date"] = pd.to_datetime(df_temp[date_col], format="mixed", errors="coerce", utc=True).dt.tz_convert(None)
            df_temp = df_temp.dropna(subset=["_date"])
            df_temp["_period"] = df_temp["_date"].dt.to_period("M").dt.to_timestamp()
            ts_data = df_temp.groupby("_period")[metric_col].sum().reset_index().sort_values("_period")
            chart_data = [
                {"time": row["_period"].strftime("%Y-%m"), "value": sanitize_val(row[metric_col])}
                for _, row in ts_data.iterrows()
            ]
            if len(chart_data) > 1:
                charts.append({
                    "id": "time_series_trend",
                    "title": f"Monthly Trend: {metric_col} over Time",
                    "type": "area",
                    "x_key": "time",
                    "y_key": "value",
                    "data": chart_data,
                    "description": f"Displays aggregate monthly progression of {metric_col}."
                })
        except Exception:
            pass

    # 2. Top Categorical Ranking (e.g. Products or Top Category)
    # Pick categorical column with good cardinality (between 5 and 200)
    high_card_cat = next((c for c in categorical_cols if "product" in c.lower() or "name" in c.lower() or df[c].nunique() >= 8), None)
    if not high_card_cat and categorical_cols:
        high_card_cat = categorical_cols[0]

    if high_card_cat and numeric_cols:
        metric_col = next((c for c in ["Sales", "Revenue", "Amount"] if c in numeric_cols), numeric_cols[0])
        try:
            cat_grouped = df.groupby(high_card_cat)[metric_col].sum().reset_index()
            cat_grouped = cat_grouped.sort_values(metric_col, ascending=False).head(10)
            bar_data = [
                {"category": str(row[high_card_cat]), "value": sanitize_val(row[metric_col])}
                for _, row in cat_grouped.iterrows()
            ]
            if bar_data:
                charts.append({
                    "id": "top_categories_bar",
                    "title": f"Top 10 {high_card_cat} by {metric_col}",
                    "type": "bar",
                    "x_key": "category",
                    "y_key": "value",
                    "data": bar_data,
                    "description": f"Ranking of top {high_card_cat} items ordered by aggregate {metric_col}."
                })
        except Exception:
            pass

    # 3. Category Composition (Donut / Pie)
    # Pick a low cardinality categorical column (e.g. Category, Segment, Region)
    pie_cat = next((c for c in categorical_cols if "cat" in c.lower() or "segment" in c.lower() or "region" in c.lower() or 2 <= df[c].nunique() <= 10), None)
    if not pie_cat and categorical_cols:
        pie_cat = categorical_cols[-1]

    if pie_cat:
        pie_metric = next((c for c in ["Profit", "Sales", "Revenue"] if c in numeric_cols), (numeric_cols[1] if len(numeric_cols) > 1 else (numeric_cols[0] if numeric_cols else None)))
        try:
            if pie_metric:
                pie_grouped = df.groupby(pie_cat)[pie_metric].sum().reset_index()
                pie_grouped = pie_grouped.sort_values(pie_metric, ascending=False).head(7)
                pie_data = [
                    {"name": str(row[pie_cat]), "value": sanitize_val(row[pie_metric])}
                    for _, row in pie_grouped.iterrows()
                ]
            else:
                top_counts = df[pie_cat].value_counts().head(7)
                pie_data = [{"name": str(k), "value": int(v)} for k, v in top_counts.items()]
            
            if pie_data and all(v["value"] is not None and v["value"] >= 0 for v in pie_data) and sum(v["value"] for v in pie_data) > 0:
                charts.append({
                    "id": "composition_pie",
                    "title": f"Share by {pie_cat} ({pie_metric or 'Count'})",
                    "type": "pie",
                    "data": pie_data,
                    "description": f"Proportional share across {pie_cat} segments."
                })
        except Exception:
            pass

    # 4. Regional Breakdown (if Region exists and isn't pie_cat)
    region_col = next((c for c in categorical_cols if "region" in c.lower() or "city" in c.lower() or "state" in c.lower()), None)
    if region_col and region_col != pie_cat and numeric_cols:
        try:
            r_metric = numeric_cols[0]
            r_grouped = df.groupby(region_col)[r_metric].sum().reset_index().sort_values(r_metric, ascending=False).head(8)
            r_data = [{"category": str(r[region_col]), "value": sanitize_val(r[r_metric])} for _, r in r_grouped.iterrows()]
            if r_data:
                charts.append({
                    "id": "region_breakdown",
                    "title": f"{region_col} Breakdown by {r_metric}",
                    "type": "bar",
                    "x_key": "category",
                    "y_key": "value",
                    "data": r_data,
                    "description": f"Performance across geographic {region_col} segments."
                })
        except Exception:
            pass

    # 5. Correlation Matrix (Numeric features)
    correlation_matrix = []
    if len(numeric_cols) >= 2:
        num_subset = df[numeric_cols[:6]].select_dtypes(include=[np.number])
        corr = num_subset.corr()
        for i, col1 in enumerate(corr.columns):
            for j, col2 in enumerate(corr.columns):
                correlation_matrix.append({
                    "x": col1,
                    "y": col2,
                    "value": sanitize_val(corr.iloc[i, j])
                })

    # AI & Automated Narrative Insights
    insights = []
    insights.append(f"Analyzed {total_rows:,} rows across {total_cols} columns with an overall completeness score of {completeness}%.")
    if duplicate_rows > 0:
        insights.append(f"Identified {duplicate_rows:,} duplicate rows ({duplicate_pct}%), which can be cleaned with 1 click.")
    else:
        insights.append("Zero duplicate rows detected across the dataset.")

    if categorical_cols and numeric_cols:
        cat = categorical_cols[0]
        metric = numeric_cols[0]
        top_cat = df.groupby(cat)[metric].sum().sort_values(ascending=False)
        if len(top_cat) > 0:
            top_name = top_cat.index[0]
            insights.append(f"'{top_name}' has the highest total {metric} among non-missing {cat} groups: {sanitize_val(top_cat.iloc[0])}.")

    if missing_cells and profiles:
        worst = max(profiles, key=lambda p: p["null_count"])
        insights.append(f"{worst['name']} has the most missing values: {worst['null_count']} ({worst['null_pct']}%).")
    for chart in charts:
        if chart['id'] == 'time_series_trend':
            points = chart['data']
            first, last = points[0], points[-1]
            if first['value'] and first['value'] > 0 and last['value'] is not None:
                change = (last['value'] - first['value']) / first['value'] * 100
                insights.append(f"Monthly total changed by {change:.2f}% between {first['time']} and {last['time']}; partial months may affect comparison.")


    if numeric_cols:
        # Check for outliers via IQR
        metric = numeric_cols[0]
        s = df[metric].dropna()
        q25, q75 = s.quantile(0.25), s.quantile(0.75)
        iqr = q75 - q25
        outliers = ((s < (q25 - 1.5 * iqr)) | (s > (q75 + 1.5 * iqr))).sum()
        if outliers > 0:
            insights.append(f"Found {outliers:,} potential outlier records in {metric} based on 1.5x IQR boundary.")

    return {
        "dataset_id": dataset_id,
        "filename": filename,
        "active_sheet": active_sheet,
        "summary": {
            "total_rows": total_rows,
            "total_cols": total_cols,
            "total_cells": total_cells,
            "missing_cells": missing_cells,
            "completeness_pct": completeness,
            "duplicate_rows": duplicate_rows,
            "duplicate_pct": duplicate_pct,
            "health_score": health_score if total_cells else 0,
            "numeric_count": len(numeric_cols),
            "categorical_count": len(categorical_cols),
            "datetime_count": len(datetime_cols)
        },
        "column_types": col_types,
        "column_profiles": profiles,
        "kpis": kpi_items,
        "charts": charts,
        "correlation": {
            "columns": numeric_cols[:6],
            "matrix": correlation_matrix
        },
        "insights": insights
    }


def query_aggregation(df: pd.DataFrame, x_col: str, y_col: Optional[str] = None, agg_func: str = "sum", limit: int = 15) -> List[Dict[str, Any]]:
    """Performs dynamic group-by aggregations for the interactive chart builder."""
    if x_col not in df.columns:
        raise ValueError(f"Column '{x_col}' does not exist.")

    if agg_func not in {"count", "sum", "mean", "avg", "min", "max", "median"}:
        raise ValueError("Choose a supported aggregation.")
    if not 1 <= limit <= 100:
        raise ValueError("Limit must be between 1 and 100.")
    df = df.replace([np.inf, -np.inf], np.nan)
    if agg_func == "count":
        result = df.groupby(x_col, dropna=False).size()
    else:
        if y_col not in df.columns or not pd.api.types.is_numeric_dtype(df[y_col]):
            raise ValueError("Choose a numeric metric column.")
        grouped = df.groupby(x_col, dropna=False)[y_col]
        result = grouped.sum(min_count=1) if agg_func == "sum" else grouped.agg("mean" if agg_func == "avg" else agg_func)
    result = result.sort_values(ascending=False).head(limit)
    return [{"key": "(missing)" if pd.isna(k) else str(k), "value": sanitize_val(v)} for k, v in result.items()]


def clean_dataframe(df: pd.DataFrame, drop_duplicates: bool = False, fill_numeric: str = "none", fill_categorical: str = "none") -> pd.DataFrame:
    """Applies quick data cleaning operations to the DataFrame."""
    cleaned = df.copy()
    
    if drop_duplicates:
        cleaned = cleaned.drop_duplicates()

    # Fill numeric nulls
    if fill_numeric != "none":
        for col in cleaned.select_dtypes(include=[np.number]).columns:
            if fill_numeric == "median":
                cleaned[col] = cleaned[col].fillna(cleaned[col].median())
            elif fill_numeric == "mean":
                cleaned[col] = cleaned[col].fillna(cleaned[col].mean())
            elif fill_numeric == "zero":
                cleaned[col] = cleaned[col].fillna(0)

    # Fill categorical nulls
    if fill_categorical != "none":
        for col in cleaned.select_dtypes(include=["object", "category"]).columns:
            if fill_categorical == "mode":
                mode_val = cleaned[col].mode()
                if not mode_val.empty:
                    cleaned[col] = cleaned[col].fillna(mode_val[0])
            elif fill_categorical == "unknown":
                cleaned[col] = cleaned[col].fillna("Unknown")

    return cleaned


def export_dataframe_bytes(df: pd.DataFrame, export_format: str = "xlsx") -> (io.BytesIO, str):
    """Exports DataFrame to bytes buffer as Excel or CSV."""
    if export_format not in {"csv", "xlsx", "json"}:
        raise ValueError("Choose CSV, Excel or JSON export.")
    if export_format == "json":
        return io.BytesIO(df.to_json(orient="records", date_format="iso", force_ascii=False).encode("utf-8")), "application/json"
    def safe(v):
        return "'" + v if isinstance(v, str) and v.lstrip().startswith(("=", "+", "-", "@", "\t", "\r", "\n")) else v
    df = df.copy().map(safe)
    df.columns = [safe(str(c)) for c in df.columns]
    buf = io.BytesIO()
    if export_format.lower() == "csv":
        df.to_csv(buf, index=False, encoding="utf-8")
        media_type = "text/csv"
    else:
        with pd.ExcelWriter(buf, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="CleanedData")
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    buf.seek(0)
    return buf, media_type
