import { useState, useRef } from "react";

type Step = "name" | "email" | "loading" | "success" | "error";

interface VerifyResponse {
  success: boolean;
  name?: string;
  certType?: string;
  label?: string;
  message?: string;
}

export default function App() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resultName, setResultName] = useState("");
  const [resultLabel, setResultLabel] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("#");
  const [errorMessage, setErrorMessage] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  function goToEmailStep() {
    if (!name.trim()) return;
    setStep("email");
    setTimeout(() => emailInputRef.current?.focus(), 0);
  }

  async function verify() {
    if (!email.trim()) return;
    setStep("loading");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data: VerifyResponse = await res.json();

      if (data.success) {
        setResultName(data.name || name);
        setResultLabel(data.label || "");
        const params = new URLSearchParams({ name, email });
        setDownloadUrl(`/api/certificate?${params.toString()}`);
        setStep("success");
      } else {
        setErrorMessage(data.message || "We couldn't verify those details.");
        setStep("error");
      }
    } catch {
      setErrorMessage("Something went wrong reaching the server. Please try again.");
      setStep("error");
    }
  }

  function restart() {
    setName("");
    setEmail("");
    setStep("name");
  }

  return (
    <div className="min-h-screen bg-[#eef1f6] flex flex-col items-center px-4 py-8">
      {/* Header */}
      <header className="w-full max-w-xl flex items-center justify-between flex-wrap gap-2 mb-6">
        <span className="text-2xl font-bold">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>
        <div className="text-center">
          <div className="font-extrabold text-xs tracking-wider text-[#1a2b4c]">
            IEEE JECRC STUDENT BRANCH
          </div>
          <div className="text-xs text-[#5f6b7a]">Poster Creation Impressions</div>
        </div>
        <span className="font-bold text-sm bg-white border border-[#e2e7f0] rounded-full px-3.5 py-1.5 text-[#1a2b4c]">
          #TeamGemini
        </span>
      </header>

      {/* Card */}
      <main className="w-full max-w-lg bg-white rounded-2xl shadow-xl px-9 pt-10 pb-9 text-center">
        <div className="mb-2">
          <span className="inline-block font-extrabold text-[13px] tracking-wider text-white bg-[#2f7dfb] rounded-sm px-4 py-1.5 -rotate-3 mr-2.5">
            POSTER
          </span>
          <span className="inline-block font-extrabold text-[13px] tracking-wider text-white bg-[#ec4899] rounded-sm px-4 py-1.5 rotate-3">
            CREATION
          </span>
        </div>
        <h1 className="font-black text-[42px] tracking-wide text-[#132241] my-1.5">
          IMPRESSIONS
        </h1>
        <p className="text-sm text-[#5f6b7a] mb-7">
          Enter your details to verify your registration and download your certificate.
        </p>

        {step === "name" && (
          <div className="text-left">
            <label className="block text-[13px] font-semibold text-[#1a2b4c] mb-1.5" htmlFor="name">
              Your full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToEmailStep()}
              placeholder="As you registered, e.g. Hardik Gupta"
              autoComplete="name"
              className="w-full px-4 py-3 text-base border-[1.5px] border-[#dfe6f0] rounded-lg mb-4 outline-none focus:border-[#2f7dfb]"
            />
            <button
              onClick={goToEmailStep}
              className="w-full py-3.5 font-bold text-white bg-[#2f7dfb] rounded-lg hover:bg-[#1b64d9]"
            >
              Next
            </button>
          </div>
        )}

        {step === "email" && (
          <div className="text-left">
            <p className="text-[13px] text-[#5f6b7a] mb-4">
              Name: <strong className="text-[#1a2b4c]">{name}</strong>{" "}
              <button onClick={() => setStep("name")} className="text-[#2f7dfb] text-[13px] font-semibold">
                Edit
              </button>
            </p>
            <label className="block text-[13px] font-semibold text-[#1a2b4c] mb-1.5" htmlFor="email">
              Your registered email
            </label>
            <input
              id="email"
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 text-base border-[1.5px] border-[#dfe6f0] rounded-lg mb-4 outline-none focus:border-[#2f7dfb]"
            />
            <button
              onClick={verify}
              className="w-full py-3.5 font-bold text-white bg-[#2f7dfb] rounded-lg hover:bg-[#1b64d9]"
            >
              Verify &amp; Get Certificate
            </button>
          </div>
        )}

        {step === "loading" && (
          <div>
            <div className="w-9 h-9 mx-auto mb-4 border-[3px] border-[#dfe6f0] border-t-[#2f7dfb] rounded-full animate-spin" />
            <p className="text-[#1a2b4c]">Checking your registration…</p>
          </div>
        )}

        {step === "success" && (
          <div>
            <div className="w-14 h-14 mx-auto mb-3.5 bg-[#e4f7ec] text-[#1f9d55] rounded-full flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <p className="text-lg font-bold text-[#1a2b4c] mb-1">
              You're verified, {resultName}!
            </p>
            <p className="text-sm text-[#5f6b7a] mb-5">{resultLabel}</p>
            <a
              href={downloadUrl}
              download
              className="block w-full py-3.5 font-bold text-white rounded-lg bg-gradient-to-r from-[#2f7dfb] to-[#1b53c9]"
            >
              Download Certificate
            </a>
            <button onClick={restart} className="mt-3.5 text-[#2f7dfb] text-[13px] font-semibold">
              Check another name
            </button>
          </div>
        )}

        {step === "error" && (
          <div>
            <div className="w-14 h-14 mx-auto mb-3.5 bg-[#fdeaea] text-[#d64545] rounded-full flex items-center justify-center text-xl font-bold">
              ✕
            </div>
            <p className="text-sm text-[#1a2b4c] mb-5 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => setStep("email")}
              className="w-full py-3.5 font-bold text-white bg-[#2f7dfb] rounded-lg hover:bg-[#1b64d9]"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Meet the Developer */}
      <section className="w-full max-w-lg mt-6 bg-white rounded-2xl shadow-lg px-6 py-5 flex items-center gap-5 text-left">
        <img
          src="/developer.jpg"
          alt="Hardik Gupta, developer of this portal"
          width={88}
          height={88}
          className="w-[88px] h-[88px] rounded-full object-cover border-4 border-[#eef1f6] shadow-md shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block font-extrabold text-[11px] tracking-wider text-white bg-[#ec4899] rounded-sm px-3 py-1 -rotate-2 mb-2">
            MEET THE DEVELOPER
          </span>
          <p className="font-extrabold text-lg text-[#132241] leading-tight">Hardik Gupta</p>
          <p className="text-xs text-[#5f6b7a] mt-0.5">
            Builder of AI systems · B.Tech CSE (AI &amp; Data Science), JECRC Foundation
          </p>
          <a
            href="https://hardik-agarwal-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[#2f7dfb] text-[13px] font-semibold hover:underline"
          >
            View portfolio →
          </a>
        </div>
      </section>

      <footer className="mt-7 text-xs text-[#5f6b7a] text-center">
        Organized by IEEE JECRC Student Branch · 24 September 2026
      </footer>
    </div>
  );
}
