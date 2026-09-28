# SPDX-License-Identifier: AGPL-3.0-or-later
"""Learns from a table, tells how good it is, predicts, and shows why.

    python yosoku.py 学習.xlsx --target 目的の列
    python yosoku.py 学習.xlsx --target 目的の列 --predict 新しい.xlsx --out 予測.xlsx

The table is an .xlsx or .csv. --target names the column to predict; every
other column is used, unless --drop lists columns to leave out. Text columns
are treated as categories. The kind of model follows the target: a column
with few distinct values is classified, a number is regressed.

Step 1 splits the rows into training and validation, fits LightGBM, prints
the score on the validation rows only, and the columns that mattered most.
Step 2 (--predict) fits on all rows, predicts the new table, and writes the
prediction plus the per-row SHAP values (why) next to it.

Nothing leaves the machine. Needs conda-forge: polars fastexcel xlsxwriter
scikit-learn lightgbm shap. A working example to rebuild, not a verified
part: it has not been run in this repository yet (2026-09-28), because the
packages are not installed here; only py_compile was run.
"""
import argparse
import sys

import numpy as np
import polars as pl


def read_table(path):
    if path.lower().endswith(".csv"):
        return pl.read_csv(path)
    return pl.read_excel(path)


def prepare(df, target, drop):
    """Returns features (pandas, categories typed) and the target column."""
    y = df[target] if target in df.columns else None
    cols = [c for c in df.columns if c != target and c not in drop]
    x = df.select(cols).to_pandas()
    for c in x.columns:
        if x[c].dtype == object:
            x[c] = x[c].astype("category")
    return x, y


def is_classification(y):
    return y.dtype == pl.Utf8 or y.dtype == pl.Boolean or y.n_unique() <= 10


def make_model(classify):
    import lightgbm as lgb
    if classify:
        return lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1)
    return lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, verbose=-1)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("table")
    p.add_argument("--target", required=True)
    p.add_argument("--drop", nargs="*", default=[], help="columns not to use")
    p.add_argument("--predict", help="table to predict")
    p.add_argument("--out", default="予測.xlsx")
    a = p.parse_args(argv)

    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, mean_absolute_error

    df = read_table(a.table)
    if a.target not in df.columns:
        sys.exit(f"目的の列 {a.target!r} がありません。列: {df.columns}")
    x, y = prepare(df, a.target, a.drop)
    classify = is_classification(y)
    y = y.to_pandas()

    # Step 1: how good is it, on rows the model did not see
    xtr, xva, ytr, yva = train_test_split(x, y, test_size=0.25, random_state=0,
                                          stratify=y if classify else None)
    model = make_model(classify).fit(xtr, ytr)
    pred = model.predict(xva)
    if classify:
        print(f"検証用 {len(yva)} 行での正解率: {accuracy_score(yva, pred):.3f}")
    else:
        print(f"検証用 {len(yva)} 行での平均の誤差: {mean_absolute_error(yva, pred):.3f}")
    order = np.argsort(model.feature_importances_)[::-1]
    print("効いた列(上から):")
    for i in order[:15]:
        print(f"  {x.columns[i]}  {model.feature_importances_[i]}")

    if not a.predict:
        return

    # Step 2: fit on everything, predict the new table, and say why per row
    import shap
    model = make_model(classify).fit(x, y)
    new = read_table(a.predict)
    xn, _ = prepare(new, a.target, a.drop)
    xn = xn[x.columns]
    for c in xn.columns:
        if str(x[c].dtype) == "category":
            xn[c] = xn[c].astype("category").cat.set_categories(x[c].cat.categories)
    out = new.with_columns(pl.Series("予測", model.predict(xn)))
    if classify and hasattr(model, "predict_proba"):
        out = out.with_columns(pl.Series("予測の確からしさ", model.predict_proba(xn).max(axis=1)))
    values = shap.TreeExplainer(model).shap_values(xn)
    if isinstance(values, list):          # one array per class: take the predicted class
        values = np.stack(values, axis=-1)
    if values.ndim == 3:
        idx = np.asarray(model.predict(xn))
        classes = list(model.classes_)
        values = np.stack([values[r, :, classes.index(idx[r])] for r in range(len(idx))])
    for j, c in enumerate(x.columns):
        out = out.with_columns(pl.Series(f"根拠:{c}", values[:, j]))
    if a.out.lower().endswith(".csv"):
        out.write_csv(a.out)
    else:
        out.write_excel(a.out)
    print(f"{a.out} に {len(out)} 行を書きました。根拠: の列は、値が大きいほど予測を押し上げた列です")


if __name__ == "__main__":
    main()
