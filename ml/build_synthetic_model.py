"""
Synthetic NBFC loan-default model — portfolio demonstration only.

Generates a synthetic lending portfolio (no real customer data), then:
  1. Bins features and computes WOE / IV (scorecard style)
  2. Trains a WOE-based logistic-regression scorecard
  3. Trains Logistic Regression, Random Forest and Gradient Boosting PD models
  4. Evaluates ROC-AUC, Gini, KS, precision, recall, F1, confusion matrix,
     decile gains table, 5-fold CV
  5. Explains the gradient-boosting model with SHAP
  6. Exports everything the website charts need to ../js/synthetic-model.js

Run:  python ml/build_synthetic_model.py
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (confusion_matrix, f1_score, precision_score,
                             recall_score, roc_auc_score, roc_curve)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler

SEED = 42
N = 20000
rng = np.random.default_rng(SEED)
OUT = Path(__file__).resolve().parents[1] / "js" / "synthetic-model.js"

# ---------------------------------------------------------------- 1. data
age = rng.integers(21, 66, N)
income = np.clip(rng.lognormal(np.log(38000), 0.55, N), 12000, 300000).round(-2)
loan_amount = np.clip(rng.lognormal(np.log(350000), 0.6, N), 50000, 1500000).round(-3)
tenure = rng.choice([12, 18, 24, 36, 48, 60], N, p=[.08, .1, .22, .3, .18, .12])
bureau = np.clip(rng.normal(715, 70, N), 300, 900).round()
prev_dpd = rng.choice([0, 15, 45, 75, 100], N, p=[.62, .2, .1, .05, .03])
bounces = np.clip(rng.poisson(0.35 + (prev_dpd > 0) * 0.9, N), 0, 8)
prev_defaults = rng.choice([0, 1, 2, 3], N, p=[.86, .1, .03, .01])
payment_ratio = np.clip(rng.beta(9, 1.1, N) - (prev_dpd / 600), 0.35, 1.0).round(3)
region = rng.choice(["North", "South", "East", "West", "Central"], N)
product = rng.choice(["Used CV", "New CV", "Two-wheeler", "MSME", "Car"], N)

rate = 0.16 / 12
emi = loan_amount * rate * (1 + rate) ** tenure / ((1 + rate) ** tenure - 1)
# existing monthly obligations (other EMIs); about half of borrowers have none
existing_emi = np.where(rng.random(N) < 0.5, 0,
                        np.clip(rng.lognormal(np.log(6000), 0.7, N), 1000, 60000)).round(-2)
# FOIR = fixed obligations to income ratio = (new EMI + existing EMIs) / income
foir = np.clip((emi + existing_emi) / income, 0.02, 2.0)

logit = (-4.25
         - 0.0105 * (bureau - 715)
         + 0.018 * prev_dpd
         + 0.34 * bounces
         + 0.62 * prev_defaults
         - 4.2 * (payment_ratio - 0.88)
         + 1.7 * np.clip(foir - 0.45, 0, None)
         - 0.22 * np.log(income / 38000)
         + 0.012 * np.clip(28 - age, 0, None) * 3
         + 0.25 * ((bounces >= 2) & (payment_ratio < 0.8))   # interaction: trees can find it
         + rng.normal(0, 0.55, N))
pd_true = 1 / (1 + np.exp(-logit))
default = (rng.random(N) < pd_true).astype(int)

df = pd.DataFrame(dict(age=age, monthly_income=income, loan_amount=loan_amount,
                       tenure_months=tenure, bureau_score=bureau, prev_max_dpd=prev_dpd,
                       emi_bounce_12m=bounces, prev_defaults=prev_defaults,
                       payment_ratio=payment_ratio, existing_emi=existing_emi, foir=foir.round(3),
                       region=region, product=product, default=default))
bad_rate = df.default.mean()

# ---------------------------------------------------------------- 2. WOE / IV
NUMERIC_BINS = {
    "bureau_score": [300, 600, 650, 700, 750, 800, 901],
    "prev_max_dpd": [-1, 0, 30, 60, 90, 999],
    "emi_bounce_12m": [-1, 0, 1, 2, 3, 99],
    "payment_ratio": [0, 0.7, 0.8, 0.9, 0.95, 1.01],
    "prev_defaults": [-1, 0, 1, 99],
    "foir": [0, 0.3, 0.4, 0.5, 0.65, 9],
    "monthly_income": [0, 20000, 30000, 45000, 70000, 1e9],
    "age": [20, 25, 30, 40, 50, 66],
    "loan_amount": [0, 150000, 300000, 500000, 800000, 1e9],
    "tenure_months": [0, 18, 24, 36, 48, 60],
}
CATEGORICAL = ["region", "product"]
LABELS = {
    "bureau_score": "Bureau score", "prev_max_dpd": "Max DPD (prev. 12m)",
    "emi_bounce_12m": "EMI bounces (12m)", "payment_ratio": "Payment ratio",
    "prev_defaults": "Previous defaults", "foir": "FOIR",
    "monthly_income": "Monthly income", "age": "Applicant age", "loan_amount": "Loan amount",
    "tenure_months": "Tenure (months)", "region": "Region", "product": "Product",
}


def woe_table(series, target):
    t = pd.DataFrame({"bin": series.astype(str), "y": target})
    g = t.groupby("bin", observed=True)["y"].agg(["count", "sum"])
    g.columns = ["total", "bad"]
    g["good"] = g.total - g.bad
    dist_good = (g.good + 0.5) / g.good.sum()
    dist_bad = (g.bad + 0.5) / g.bad.sum()
    g["woe"] = np.log(dist_good / dist_bad)          # convention: ln(%good / %bad)
    g["iv"] = (dist_good - dist_bad) * g.woe
    g["bad_rate"] = g.bad / g.total
    return g


binned = {}
woe_tables = {}
for col, edges in NUMERIC_BINS.items():
    binned[col] = pd.cut(df[col], edges, include_lowest=True)
    woe_tables[col] = woe_table(binned[col], df.default)
for col in CATEGORICAL:
    binned[col] = df[col]
    woe_tables[col] = woe_table(df[col], df.default)

iv_rank = sorted(((LABELS[c], float(t.iv.sum())) for c, t in woe_tables.items()),
                 key=lambda x: -x[1])


def fmt_bin(interval, col):
    if not isinstance(interval, pd.Interval):
        return str(interval)
    lo, hi = interval.left, interval.right
    money = col in ("monthly_income", "loan_amount")
    def f(v):
        if money:
            return "₹" + (f"{v/100000:.1f}L" if v >= 100000 else f"{v/1000:.0f}k")
        return f"{round(v, 2):g}"
    if hi >= 1e8 or hi >= 999:
        return f"> {f(lo)}"
    if lo < 0:
        return f"≤ {f(hi)}"
    return f"{f(lo)}–{f(hi)}"


BIN_LABELS = {  # friendlier labels for the website
    "bureau_score": {"(800.0, 901.0]": "800+", "(299.999, 600.0]": "≤ 600"},
    "emi_bounce_12m": {"(-1.001, 0.0]": "0", "(0.0, 1.0]": "1", "(1.0, 2.0]": "2", "(2.0, 3.0]": "3", "(3.0, 99.0]": "4+"},
    "payment_ratio": {"(0.95, 1.01]": "0.95–1.00", "(-0.001, 0.7]": "< 0.70", "(0.7, 0.8]": "0.70–0.80",
                      "(0.8, 0.9]": "0.80–0.90", "(0.9, 0.95]": "0.90–0.95"},
    "foir": {"(0.65, 9.0]": "> 0.65", "(-0.001, 0.3]": "≤ 0.30", "(0.3, 0.4]": "0.30–0.40",
             "(0.4, 0.5]": "0.40–0.50", "(0.5, 0.65]": "0.50–0.65"},
}
# keep bin order from pd.cut categories
woe_detail = {}
for col in ["bureau_score", "payment_ratio", "emi_bounce_12m", "foir"]:
    cats = binned[col].cat.categories
    tbl = woe_tables[col]
    rows = []
    for c in cats:
        r = tbl.loc[str(c)]
        rows.append({"bin": BIN_LABELS.get(col, {}).get(str(c), fmt_bin(c, col)), "count": int(r.total), "badRate": round(float(r.bad_rate), 4),
                     "woe": round(float(r.woe), 3)})
    woe_detail[col] = {"label": LABELS[col], "rows": rows}

# ---------------------------------------------------------------- 3. scorecard (WOE logistic regression)
SC_FEATS = [c for c, _ in sorted(((c, woe_tables[c].iv.sum()) for c in woe_tables), key=lambda x: -x[1])
            if woe_tables[c].iv.sum() >= 0.02 and c not in CATEGORICAL][:7]
X_woe = pd.DataFrame({c: binned[c].astype(str).map(woe_tables[c].woe) for c in SC_FEATS}).astype(float)
y = df.default.values
Xw_tr, Xw_te, y_tr, y_te, idx_tr, idx_te = train_test_split(
    X_woe, y, np.arange(N), test_size=0.3, stratify=y, random_state=SEED)
sc_model = LogisticRegression(max_iter=1000).fit(Xw_tr, y_tr)
sc_p = sc_model.predict_proba(Xw_te)[:, 1]

PDO, BASE, BASE_ODDS = 20, 600, 30
factor = PDO / np.log(2)
offset = BASE - factor * np.log(BASE_ODDS)
log_odds_good = -sc_model.decision_function(Xw_te)
scores = np.clip(offset + factor * log_odds_good, 300, 900)


def ks_stats(y_true, p, points=50):
    order = np.argsort(-p)
    ys = y_true[order]
    cum_bad = np.cumsum(ys) / ys.sum()
    cum_good = np.cumsum(1 - ys) / (1 - ys).sum()
    diff = cum_bad - cum_good
    k = int(np.argmax(diff))
    idx = np.linspace(0, len(ys) - 1, points).astype(int)
    curve = [{"pop": round((i + 1) / len(ys), 3), "bad": round(float(cum_bad[i]), 4),
              "good": round(float(cum_good[i]), 4)} for i in idx]
    return float(diff[k]), round((k + 1) / len(ys), 3), curve


def roc_points(y_true, p, n=40):
    fpr, tpr, _ = roc_curve(y_true, p)
    idx = np.unique(np.linspace(0, len(fpr) - 1, n).astype(int))
    return [{"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)} for i in idx]


def gains_table(y_true, p):
    d = pd.DataFrame({"y": y_true, "p": p}).sort_values("p", ascending=False).reset_index(drop=True)
    d["decile"] = pd.qcut(d.index, 10, labels=False) + 1
    g = d.groupby("decile").agg(accounts=("y", "size"), bads=("y", "sum"), minP=("p", "min"), maxP=("p", "max"))
    g["goods"] = g.accounts - g.bads
    g["badRate"] = g.bads / g.accounts
    g["cumBadPct"] = g.bads.cumsum() / g.bads.sum()
    g["cumGoodPct"] = g.goods.cumsum() / g.goods.sum()
    g["ks"] = g.cumBadPct - g.cumGoodPct
    g["lift"] = g.badRate / d.y.mean()
    return [{"decile": int(i), "accounts": int(r.accounts), "bads": int(r.bads),
             "badRate": round(float(r.badRate), 4), "cumBadPct": round(float(r.cumBadPct), 4),
             "ks": round(float(r.ks), 4), "lift": round(float(r.lift), 2)} for i, r in g.iterrows()]


def threshold_metrics(y_true, p, thr):
    pred = (p >= thr).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, pred).ravel()
    return {"threshold": round(float(thr), 3),
            "precision": round(float(precision_score(y_true, pred)), 4),
            "recall": round(float(recall_score(y_true, pred)), 4),
            "f1": round(float(f1_score(y_true, pred)), 4),
            "cm": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}}


def best_f1_threshold(y_true, p, recall_target=0.70):
    """Policy cut-off: the highest threshold that still captures `recall_target` of defaulters.
    In lending a missed defaulter usually costs more than an extra review call."""
    grid = np.linspace(0.6, 0.02, 59)
    for t in grid:
        if recall_score(y_true, (p >= t).astype(int)) >= recall_target:
            return float(t)
    return 0.02


sc_auc = roc_auc_score(y_te, sc_p)
sc_ks, sc_ks_at, sc_ks_curve = ks_stats(y_te, sc_p)
sc_thr = best_f1_threshold(y_te, sc_p)

# score distribution good vs bad (bins of 20 points)
edges = np.arange(int(np.floor(scores.min() / 20) * 20), int(np.ceil(scores.max() / 20) * 20) + 1, 20)
hist_good, _ = np.histogram(scores[y_te == 0], edges)
hist_bad, _ = np.histogram(scores[y_te == 1], edges)
score_dist = [{"from": int(edges[i]), "to": int(edges[i + 1]),
               "good": int(hist_good[i]), "bad": int(hist_bad[i])} for i in range(len(edges) - 1)]

# risk segments
q = np.round(np.quantile(scores, [0.2, 0.4, 0.6, 0.8]) / 5) * 5
band_edges = [0, *[int(v) for v in q], 2000]
band_names = ["E · Very high", "D · High", "C · Medium", "B · Low", "A · Very low"]
bands = pd.cut(scores, band_edges, labels=band_names)
seg = (pd.DataFrame({"band": bands, "y": y_te}).groupby("band", observed=False)["y"]
       .agg(["size", "mean"]).reset_index())
segments = [{"band": str(r.band), "accounts": int(r["size"]), "badRate": round(float(r["mean"]), 4),
             "range": f"{band_edges[i]}–{band_edges[i+1]}" if i < 4 else f"≥ {band_edges[i]}"}
            for i, r in seg.iterrows()]
segments[0]["range"] = f"< {band_edges[1]}"

coefs = dict(zip(SC_FEATS, sc_model.coef_[0]))

# ---------------------------------------------------------------- 4. PD models on raw features
# Loan amount, tenure, income and existing obligations enter through the engineered FOIR
# (avoids collinear raw columns giving counter-intuitive signs).
FEATS = ["bureau_score", "prev_max_dpd", "emi_bounce_12m", "prev_defaults",
         "payment_ratio", "foir"]
X = df[FEATS].copy()
X_tr, X_te = X.iloc[idx_tr], X.iloc[idx_te]

scaler = StandardScaler().fit(X_tr)
lr = LogisticRegression(max_iter=2000, C=1.0).fit(scaler.transform(X_tr), y_tr)
rf = RandomForestClassifier(n_estimators=300, max_depth=8, min_samples_leaf=40,
                            random_state=SEED, n_jobs=-1).fit(X_tr, y_tr)
gb = GradientBoostingClassifier(n_estimators=250, max_depth=3, learning_rate=0.05,
                                subsample=0.8, random_state=SEED).fit(X_tr, y_tr)

probs = {"Logistic Regression": lr.predict_proba(scaler.transform(X_te))[:, 1],
         "Random Forest": rf.predict_proba(X_te)[:, 1],
         "Gradient Boosting": gb.predict_proba(X_te)[:, 1]}

cv = StratifiedKFold(5, shuffle=True, random_state=SEED)
models = []
for name, p in probs.items():
    auc = roc_auc_score(y_te, p)
    ks, ks_at, ks_curve = ks_stats(y_te, p)
    thr = best_f1_threshold(y_te, p)
    est = {"Logistic Regression": LogisticRegression(max_iter=2000),
           "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=8, min_samples_leaf=40, random_state=SEED, n_jobs=-1),
           "Gradient Boosting": GradientBoostingClassifier(n_estimators=150, max_depth=3, learning_rate=0.05, subsample=0.8, random_state=SEED)}[name]
    Xcv = scaler.transform(X_tr) if name == "Logistic Regression" else X_tr
    cv_auc = cross_val_score(est, Xcv, y_tr, cv=cv, scoring="roc_auc")
    models.append({"name": name, "auc": round(auc, 4), "gini": round(2 * auc - 1, 4), "ks": round(ks, 4),
                   "cvAuc": round(float(cv_auc.mean()), 4), "cvSd": round(float(cv_auc.std()), 4),
                   "roc": roc_points(y_te, p), "ksCurve": ks_curve, **threshold_metrics(y_te, p, thr)})

gb_p = probs["Gradient Boosting"]
gb_gains = gains_table(y_te, gb_p)

# PD calibration (predicted vs actual by decile) for GB
cal = (pd.DataFrame({"p": gb_p, "y": y_te}).assign(dec=lambda d: pd.qcut(d.p, 10, labels=False) + 1)
       .groupby("dec").agg(pred=("p", "mean"), actual=("y", "mean")).reset_index())
calibration = [{"decile": int(r.dec), "pred": round(float(r.pred), 4), "actual": round(float(r.actual), 4)}
               for _, r in cal.iterrows()]

# ---------------------------------------------------------------- 5. SHAP
import shap  # noqa: E402

FEAT_LABELS = {"age": "Age", "loan_amount": "Loan amount", "tenure_months": "Tenure",
               "bureau_score": "Credit score", "prev_max_dpd": "Previous DPD",
               "emi_bounce_12m": "EMI bounce count", "prev_defaults": "Previous defaults",
               "payment_ratio": "Payment ratio", "foir": "FOIR",
               "log_income": "Income"}
sample = X_te.sample(2000, random_state=SEED)
explainer = shap.TreeExplainer(gb)
sv = explainer.shap_values(sample)
shap_global = sorted(({"feature": FEAT_LABELS[c], "meanAbs": round(float(np.abs(sv[:, i]).mean()), 4)}
                      for i, c in enumerate(X.columns)), key=lambda d: -d["meanAbs"])

perm = sorted(({"feature": FEAT_LABELS[c], "importance": round(float(v), 4)}
               for c, v in zip(X.columns, gb.feature_importances_)), key=lambda d: -d["importance"])

# ---------------------------------------------------------------- 6. browser scoring model (LR, exact linear SHAP)
lr_export = {"intercept": round(float(lr.intercept_[0]), 5),
             "features": [{"key": c, "label": FEAT_LABELS[c], "coef": round(float(b), 5),
                           "mean": round(float(m), 5), "sd": round(float(s), 5)}
                          for c, b, m, s in zip(X.columns, lr.coef_[0], scaler.mean_, scaler.scale_)]}

lr_p = probs["Logistic Regression"]
band_cut = {"low": 0.08, "high": 0.25}
band_dist = {"Low": int((lr_p < band_cut["low"]).sum()),
             "Medium": int(((lr_p >= band_cut["low"]) & (lr_p < band_cut["high"])).sum()),
             "High": int((lr_p >= band_cut["high"]).sum())}
band_bad = {"Low": round(float(y_te[lr_p < band_cut["low"]].mean()), 4),
            "Medium": round(float(y_te[(lr_p >= band_cut["low"]) & (lr_p < band_cut["high"])].mean()), 4),
            "High": round(float(y_te[lr_p >= band_cut["high"]].mean()), 4)}

payload = {
    "_note": "SYNTHETIC DEMONSTRATION — generated by ml/build_synthetic_model.py. Not company or customer data.",
    "dataset": {"rows": N, "train": int(len(y_tr)), "test": int(len(y_te)), "badRate": round(float(bad_rate), 4),
                "features": len(NUMERIC_BINS) + len(CATEGORICAL)},
    "scorecard": {"features": [LABELS[c] for c in SC_FEATS], "auc": round(sc_auc, 4), "gini": round(2 * sc_auc - 1, 4),
                  "ks": round(sc_ks, 4), "ksAt": sc_ks_at, "roc": roc_points(y_te, sc_p), "ksCurve": sc_ks_curve,
                  **threshold_metrics(y_te, sc_p, sc_thr),
                  "iv": [{"feature": f, "iv": round(v, 4)} for f, v in iv_rank],
                  "woe": woe_detail, "scoreDist": score_dist, "segments": segments,
                  "coefs": [{"feature": LABELS[c], "coef": round(float(coefs[c]), 4)} for c in SC_FEATS],
                  "scaling": {"pdo": PDO, "base": BASE, "baseOdds": BASE_ODDS,
                              "factor": round(float(factor), 3), "offset": round(float(offset), 3)},
                  "gains": gains_table(y_te, sc_p)},
    "pd": {"models": models, "gains": gb_gains, "calibration": calibration, "shapGlobal": shap_global,
           "importance": perm, "lr": lr_export, "bands": {"cut": band_cut, "count": band_dist, "badRate": band_bad}},
}
OUT.write_text("/* AUTO-GENERATED by ml/build_synthetic_model.py — SYNTHETIC DEMONSTRATION DATA */\n"
               "window.SYNTH = " + json.dumps(payload, ensure_ascii=False) + ";\n", encoding="utf-8")

print(f"bad rate {bad_rate:.3%}")
print("IV:", [(f, round(v, 3)) for f, v in iv_rank])
print(f"scorecard AUC {sc_auc:.3f} KS {sc_ks:.3f} feats {SC_FEATS}")
for m in models:
    print(m["name"], m["auc"], m["ks"], m["cvAuc"], m["threshold"], m["precision"], m["recall"], m["f1"])
print("segments", segments)
print("bands", band_dist, band_bad)
print("shap", shap_global[:5])
print("written", OUT, OUT.stat().st_size)
