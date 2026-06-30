"use client";

import { useState, useEffect } from "react";
import { app, auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface TestStep {
  name: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function TestFirebase() {
  const [steps, setSteps] = useState<Record<string, TestStep>>({
    env: { name: "Environment Variables Check", status: "idle", message: "" },
    appInit: { name: "Firebase App Initialization", status: "idle", message: "" },
    authCheck: { name: "Firebase Auth Service Connection", status: "idle", message: "" },
    firestoreCheck: { name: "Firestore Write/Read Operation", status: "idle", message: "" },
    storageCheck: { name: "Firebase Storage Connection", status: "idle", message: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState<"idle" | "running" | "success" | "error">("idle");

  const runDiagnostics = async () => {
    setIsLoading(true);
    setOverallStatus("running");
    
    // Reset steps to loading/idle
    setSteps({
      env: { name: "Environment Variables Check", status: "loading", message: "" },
      appInit: { name: "Firebase App Initialization", status: "idle", message: "" },
      authCheck: { name: "Firebase Auth Service Connection", status: "idle", message: "" },
      firestoreCheck: { name: "Firestore Write/Read Operation", status: "idle", message: "" },
      storageCheck: { name: "Firebase Storage Connection", status: "idle", message: "" },
    });

    // 1. Env variables check (accessed statically so Next.js bundles them to the client)
    const envValues = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // Check if variables are defined and not empty strings
    const missing = Object.entries(envValues)
      .filter(([_, val]) => !val || val === "")
      .map(([key]) => key);
    
    await new Promise((resolve) => setTimeout(resolve, 600)); // Smooth UX transition

    const isEnvOk = missing.length === 0;
    setSteps((prev) => ({
      ...prev,
      env: {
        ...prev.env,
        status: isEnvOk ? "success" : "error",
        message: isEnvOk
          ? "All required environment variables are loaded."
          : `Missing keys: ${missing.map(k => k.replace("NEXT_PUBLIC_FIREBASE_", "")).join(", ")}. Check your .env.local file and restart Next.js dev server.`,
      },
    }));

    if (!isEnvOk) {
      setSteps((prev) => ({
        ...prev,
        appInit: { ...prev.appInit, status: "error", message: "Skipped: Configuration missing." },
        authCheck: { ...prev.authCheck, status: "error", message: "Skipped" },
        firestoreCheck: { ...prev.firestoreCheck, status: "error", message: "Skipped" },
        storageCheck: { ...prev.storageCheck, status: "error", message: "Skipped" },
      }));
      setOverallStatus("error");
      setIsLoading(false);
      return;
    }

    // 2. Firebase App Init
    try {
      setSteps((prev) => ({ ...prev, appInit: { ...prev.appInit, status: "loading" } }));
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      if (app) {
        setSteps((prev) => ({
          ...prev,
          appInit: {
            ...prev.appInit,
            status: "success",
            message: `Connected successfully to Project ID: "${app.options.projectId}"`,
          },
        }));
      } else {
        throw new Error("Firebase app could not be initialized.");
      }
    } catch (err: any) {
      setSteps((prev) => ({
        ...prev,
        appInit: { ...prev.appInit, status: "error", message: err.message || "Failed to initialize." },
      }));
      setOverallStatus("error");
      setIsLoading(false);
      return;
    }

    // 3. Auth Check
    let authOk = false;
    try {
      setSteps((prev) => ({ ...prev, authCheck: { ...prev.authCheck, status: "loading" } }));
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (auth) {
        setSteps((prev) => ({
          ...prev,
          authCheck: { ...prev.authCheck, status: "success", message: "Auth service is connected and ready." },
        }));
        authOk = true;
      } else {
        throw new Error("Auth service is undefined.");
      }
    } catch (err: any) {
      setSteps((prev) => ({
        ...prev,
        authCheck: { ...prev.authCheck, status: "error", message: err.message || "Auth connection failed." },
      }));
    }

    // 4. Firestore Check (Read/Write test)
    let firestoreOk = false;
    try {
      setSteps((prev) => ({ ...prev, firestoreCheck: { ...prev.firestoreCheck, status: "loading" } }));
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (db) {
        // Attempt a write operation to a test collection
        const testRef = collection(db, "kitkart_connection_test");
        const docRef = await addDoc(testRef, {
          test: true,
          timestamp: serverTimestamp(),
          message: "Connection diagnostics test run",
        });

        // Attempt to clean up (delete the document)
        await deleteDoc(doc(db, "kitkart_connection_test", docRef.id));

        setSteps((prev) => ({
          ...prev,
          firestoreCheck: {
            ...prev.firestoreCheck,
            status: "success",
            message: "Successfully performed write, read, and delete transactions in kitkart_connection_test collection.",
          },
        }));
        firestoreOk = true;
      } else {
        throw new Error("Firestore instance (db) is undefined.");
      }
    } catch (err: any) {
      setSteps((prev) => ({
        ...prev,
        firestoreCheck: {
          ...prev.firestoreCheck,
          status: "error",
          message: `${err.message || "Firestore operation failed."} Ensure security rules allow write access, or check network connection.`,
        },
      }));
    }

    // 5. Storage Check
    let storageOk = false;
    try {
      setSteps((prev) => ({ ...prev, storageCheck: { ...prev.storageCheck, status: "loading" } }));
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (storage) {
        setSteps((prev) => ({
          ...prev,
          storageCheck: {
            ...prev.storageCheck,
            status: "success",
            message: `Storage instance connected. Bucket: "${storage.app.options.storageBucket}"`,
          },
        }));
        storageOk = true;
      } else {
        throw new Error("Storage service is undefined.");
      }
    } catch (err: any) {
      setSteps((prev) => ({
        ...prev,
        storageCheck: { ...prev.storageCheck, status: "error", message: err.message || "Storage connection failed." },
      }));
    }

    setOverallStatus(authOk && firestoreOk && storageOk ? "success" : "error");
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div style={{ paddingTop: "120px", paddingBottom: "80px", minHeight: "100vh", backgroundColor: "var(--clr-bg)" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--sp-8)" }}>
          <span className="section-label">System Diagnostics</span>
          <h1 style={{ fontSize: "2.5rem", color: "var(--clr-text)", marginBottom: "var(--sp-3)" }}>
            Firebase Connection
          </h1>
          <p style={{ color: "var(--clr-text-secondary)", fontSize: "1.1rem" }}>
            Validating SDK client initialization, Firestore connectivity, and storage interfaces.
          </p>
        </div>

        {/* Diagnostic Status Box */}
        <div
          style={{
            background: "var(--clr-surface)",
            border: "1px solid var(--clr-border)",
            borderRadius: "var(--r-lg)",
            padding: "var(--sp-8)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            marginBottom: "var(--sp-8)",
          }}
        >
          {/* Diagnostic Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
            {Object.entries(steps).map(([key, step]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--sp-4)",
                  paddingBottom: "var(--sp-4)",
                  borderBottom: "1px solid var(--clr-border)",
                }}
              >
                {/* Status Indicator Icon */}
                <div style={{ marginTop: "4px" }}>
                  {step.status === "loading" && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "2px solid var(--clr-gold)",
                        borderTopColor: "transparent",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  )}
                  {step.status === "success" && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4caf50"
                      strokeWidth="3"
                      width="20"
                      height="20"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {step.status === "error" && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f44336"
                      strokeWidth="3"
                      width="20"
                      height="20"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  {step.status === "idle" && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "2px solid var(--clr-border)",
                      }}
                    />
                  )}
                </div>

                {/* Step Details */}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: step.status === "error" ? "#f44336" : "var(--clr-text)",
                      marginBottom: "4px",
                    }}
                  >
                    {step.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: step.status === "error" ? "#ff8a80" : "var(--clr-text-secondary)",
                      lineHeight: "1.4",
                    }}
                  >
                    {step.status === "loading" && "Validating component..."}
                    {step.status === "idle" && "Waiting to start..."}
                    {step.status !== "idle" && step.status !== "loading" && step.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "var(--sp-6)",
              paddingTop: "var(--sp-4)",
            }}
          >
            <div>
              {overallStatus === "success" && (
                <span style={{ color: "#4caf50", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="18" height="18">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Firebase Connection Fully Operational
                </span>
              )}
              {overallStatus === "error" && (
                <span style={{ color: "#f44336", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="18" height="18">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Diagnostics Failed. Please fix configuration.
                </span>
              )}
              {overallStatus === "running" && (
                <span style={{ color: "var(--clr-gold)", fontWeight: 600 }}>Running diagnostics check...</span>
              )}
            </div>

            <button
              className="btn btn-primary"
              onClick={runDiagnostics}
              disabled={isLoading}
              style={{
                padding: "10px 20px",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
                style={{ animation: isLoading ? "spin 1.5s linear infinite" : "none" }}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" />
              </svg>
              {isLoading ? "Running..." : "Re-Run Diagnostics"}
            </button>
          </div>
        </div>

        {/* Quick Reference / Guidance Panel */}
        <div
          style={{
            background: "var(--clr-surface-alt)",
            border: "1px solid var(--clr-border)",
            borderRadius: "var(--r-md)",
            padding: "var(--sp-6)",
          }}
        >
          <h4 style={{ color: "var(--clr-gold)", marginBottom: "var(--sp-2)", fontSize: "1.1rem" }}>
            Need Help Troubleshooting?
          </h4>
          <ul
            style={{
              color: "var(--clr-text-secondary)",
              fontSize: "0.95rem",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-2)",
              paddingLeft: "var(--sp-4)",
              listStyleType: "disc",
            }}
          >
            <li>
              <strong>Restart Server:</strong> If you edited the `.env.local` file, you must stop and restart the
              Next.js development server to load the new values.
            </li>
            <li>
              <strong>Firestore Rules:</strong> If Firestore write fails, check your Firebase Console rules. For test
              environments, you can allow reads/writes temporarily or configure proper authenticated access.
            </li>
            <li>
              <strong>Browser Console:</strong> Open developer tools (F12) to view detailed network or permission
              errors returned from the Firebase SDK.
            </li>
          </ul>
        </div>
      </div>

      {/* Embedded CSS for animation */}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
