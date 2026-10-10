import argparse
import os
import sys

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"   # hide TensorFlow info logs

import joblib
import numpy as np
import pandas as pd
from tensorflow import keras

FEATURES = ["T", "RH", "PT08.S1(CO)", "PT08.S2(NMHC)", "PT08.S4(NO2)"]   # same order as training
CLASS_NAMES = ["Good", "Moderate", "Poor"]


def label_from_co(co):
    """Same thresholds as the notebook (CO in mg/m3)."""
    if co < 2:
        return 0
    if co <= 4:
        return 1
    return 2


def load_artifacts(model_path, scaler_path):
    model = keras.models.load_model(model_path)
    scaler = joblib.load(scaler_path)
    return model, scaler


def predict(model, scaler, values):
    x = scaler.transform(np.array([values], dtype=float))
    probs = model.predict(x, verbose=0)[0]
    return int(probs.argmax()), probs


def manual_mode(model, scaler):
    print("\nEnter the 5 sensor values (type 'q' to go back).")
    print("Tip: typical UCI values -> T 15, RH 50, S1 1100, S2 900, S4 1450\n")
    while True:
        vals = []
        for name in FEATURES:
            s = input(f"  {name}: ").strip()
            if s.lower() == "q":
                return
            try:
                vals.append(float(s))
            except ValueError:
                print("  Not a number, start again.\n")
                break
        else:
            cls, probs = predict(model, scaler, vals)
            print(f"\n  Prediction: {CLASS_NAMES[cls]}")
            for n, p in zip(CLASS_NAMES, probs):
                print(f"    {n:9s} {p * 100:5.1f}%")
            actual = input("  (optional) real CO(GT) in mg/m3 to check right/wrong, or Enter to skip: ").strip()
            if actual:
                try:
                    true_cls = label_from_co(float(actual))
                    ok = "RIGHT" if true_cls == cls else "WRONG"
                    print(f"  True class: {CLASS_NAMES[true_cls]}  ->  {ok}")
                except ValueError:
                    print("  Skipped (not a number).")
            print()


def load_csv(csv_path):
    df = pd.read_csv(csv_path, sep=";", dtype=str)
    df = df.loc[:, ~df.columns.str.startswith("Unnamed")].dropna(how="all")
    df.columns = df.columns.str.strip()
    for c in df.columns.drop(["Date", "Time"]):
        df[c] = pd.to_numeric(df[c].str.strip().str.replace(",", ".", regex=False), errors="coerce")
    df = df.replace(-200, np.nan)
    df["datetime"] = pd.to_datetime(df["Date"] + " " + df["Time"], format="%d/%m/%Y %H.%M.%S")
    df = df.sort_values("datetime").set_index("datetime")
    df = df[FEATURES + ["CO(GT)"]]
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.interpolate(method="time", limit=3, limit_area="inside").dropna()
    df["label"] = [label_from_co(v) for v in df["CO(GT)"]]
    return df


def check_mode(model, scaler, csv_path, show_wrong=10):
    if not os.path.exists(csv_path):
        print(f"CSV not found: {csv_path}")
        return
    df = load_csv(csv_path)
    # same chronological split as training: last 15% is the test set
    test = df.iloc[int(len(df) * 0.85):]
    X = scaler.transform(test[FEATURES].to_numpy(dtype=float))
    y = test["label"].to_numpy()
    pred = model.predict(X, verbose=0).argmax(axis=1)

    acc = (pred == y).mean()
    print(f"\nTest rows: {len(test)}   Correct: {(pred == y).sum()}   Wrong: {(pred != y).sum()}")
    print(f"Accuracy: {acc * 100:.1f}%\n")

    print("Confusion matrix (rows = true, columns = predicted)")
    print(" " * 11 + "".join(f"{n:>10s}" for n in CLASS_NAMES))
    for i, n in enumerate(CLASS_NAMES):
        row = [int(((y == i) & (pred == j)).sum()) for j in range(3)]
        print(f"{n:>10s} " + "".join(f"{v:10d}" for v in row))

    print("\nPer-class recall")
    for i, n in enumerate(CLASS_NAMES):
        m = y == i
        if m.any():
            print(f"  {n:9s} {(pred[m] == i).mean() * 100:5.1f}%  ({int(m.sum())} samples)")

    wrong = np.where(pred != y)[0][:show_wrong]
    if len(wrong):
        print(f"\nFirst {len(wrong)} wrong predictions:")
        for k in wrong:
            r = test.iloc[k]
            print(f"  {test.index[k]}  CO(GT)={r['CO(GT)']:.1f}  true={CLASS_NAMES[y[k]]:9s} predicted={CLASS_NAMES[pred[k]]}")
    print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="air_quality_mlp.keras")
    ap.add_argument("--scaler", default="scaler.pkl")
    ap.add_argument("--csv", default="AirQualityUCI.csv")
    ap.add_argument("--check", action="store_true", help="run the accuracy check on the CSV and exit")
    args = ap.parse_args()

    for p in (args.model, args.scaler):
        if not os.path.exists(p):
            sys.exit(f"File not found: {p}  (run the script from the folder that contains it)")

    model, scaler = load_artifacts(args.model, args.scaler)
    print("Model and scaler loaded.")

    if args.check:
        check_mode(model, scaler, args.csv)
        return

    while True:
        print("1) Type sensor values and get a prediction")
        print("2) Check accuracy on the UCI CSV (right / wrong)")
        print("q) Quit")
        choice = input("> ").strip().lower()
        if choice == "1":
            manual_mode(model, scaler)
        elif choice == "2":
            path = input(f"CSV path [{args.csv}]: ").strip() or args.csv
            check_mode(model, scaler, path)
        elif choice == "q":
            break


if __name__ == "__main__":
    main()