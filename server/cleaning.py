"""Explicit, deterministic cleaning operations; input is never modified."""
import re
import pandas as pd
from server.storage import validate_frame

OPERATIONS = {'duplicates', 'fill', 'replace', 'drop_rows', 'drop_columns', 'rename', 'trim', 'lower', 'upper', 'title', 'find_replace', 'convert', 'date', 'empty_rows', 'empty_columns', 'column_names', 'detect_outliers', 'remove_outliers', 'cap_outliers', 'split', 'merge'}


def transform(df, operations):
    result = df.copy()
    for op in operations:
        kind, col = op.get('kind'), op.get('column')
        if kind not in OPERATIONS:
            raise ValueError('Unsupported cleaning operation.')
        if kind not in {'duplicates', 'empty_rows', 'empty_columns', 'column_names', 'merge'} and col not in result.columns:
            raise ValueError('Select an existing column.')
        if kind == 'duplicates': result = result.drop_duplicates()
        elif kind == 'empty_rows': result = result.replace(r'^\s*$', pd.NA, regex=True).dropna(how='all')
        elif kind == 'empty_columns': result = result.replace(r'^\s*$', pd.NA, regex=True).dropna(axis=1, how='all')
        elif kind == 'column_names':
            result.columns = [re.sub(r'[^\w]+', '_', str(c).strip().lower()).strip('_') or 'column' for c in result]
        elif kind == 'drop_columns': result = result.drop(columns=[col])
        elif kind == 'drop_rows': result = result.loc[~result[col].astype('string').eq(str(op.get('value', ''))).fillna(False)]
        elif kind == 'rename':
            name = str(op.get('value', '')).strip()
            if not name: raise ValueError('Enter a non-empty column name.')
            result = result.rename(columns={col: name})
        elif kind in {'trim', 'lower', 'upper', 'title', 'find_replace'}:
            if kind == 'find_replace':
                result[col] = result[col].map(lambda v: v.replace(str(op.get('value', '')), str(op.get('replacement', ''))) if isinstance(v, str) else v)
            else:
                method = {'trim': 'strip', 'lower': 'lower', 'upper': 'upper', 'title': 'title'}[kind]
                result[col] = result[col].map(lambda v: getattr(v, method)() if isinstance(v, str) else v)
        elif kind == 'replace':
            mask = result[col].astype('string').eq(str(op.get('value', ''))).fillna(False)
            result[col] = result[col].astype(object)
            result.loc[mask, col] = op.get('replacement', '')
        elif kind == 'fill':
            method = op.get('method', 'custom')
            if method in {'mean', 'median'}:
                if not pd.api.types.is_numeric_dtype(result[col]): raise ValueError('Mean and median need a numeric column.')
                value = getattr(result[col], method)()
                result[col] = result[col].astype(float)
            elif method == 'mode':
                modes = result[col].mode()
                if modes.empty: raise ValueError('An all-missing column has no mode. Use a custom value.')
                value = modes.iloc[0]
            elif method == 'custom':
                value = op.get('value', '')
                if pd.api.types.is_numeric_dtype(result[col]):
                    try: value = float(value)
                    except (ValueError, TypeError): raise ValueError('Enter a numeric fill value.')
                    result[col] = result[col].astype(float)
            else: raise ValueError('Choose mean, median, mode or custom.')
            if pd.isna(value): raise ValueError('No valid values to compute this statistic.')
            result[col] = result[col].fillna(value)
        elif kind == 'convert':
            target = op.get('value')
            if target == 'number': result[col] = pd.to_numeric(result[col], errors='raise')
            elif target == 'text': result[col] = result[col].astype('string')
            else: raise ValueError('Conversion target must be number or text.')
        elif kind == 'date':
            result[col] = pd.to_datetime(result[col], format=op.get('value') or 'ISO8601', errors='raise', utc=True).dt.tz_localize(None)
        elif kind in {'detect_outliers', 'remove_outliers', 'cap_outliers'}:
            if not pd.api.types.is_numeric_dtype(result[col]): raise ValueError('Outlier operations need a numeric column.')
            s = result[col]; q1, q3 = s.quantile(.25), s.quantile(.75)
            lower, upper = q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1)
            mask = (s < lower) | (s > upper)
            if kind == 'remove_outliers': result = result.loc[~mask]
            elif kind == 'cap_outliers': result[col] = s.clip(lower, upper)
            else:
                name = col + '_outlier'
                if name in result: raise ValueError('Outlier flag column already exists.')
                result[name] = mask
        elif kind == 'split':
            sep = str(op.get('value', ''))
            if not sep: raise ValueError('Enter a split separator.')
            parts = result[col].astype('string').str.split(sep, n=1, expand=True, regex=False)
            for i in range(parts.shape[1]):
                name = f'{col}_{i+1}'
                if name in result: raise ValueError('Split output column already exists.')
                result[name] = parts[i]
        elif kind == 'merge':
            columns = op.get('columns', [])
            name = str(op.get('replacement', 'merged')).strip()
            if len(columns) < 2 or any(c not in result for c in columns) or not name or name in result:
                raise ValueError('Choose at least two columns and a new output name.')
            result[name] = result[columns].astype('string').fillna('').agg(str(op.get('value', ' ')).join, axis=1)
        validate_frame(result)
    return result.reset_index(drop=True)
