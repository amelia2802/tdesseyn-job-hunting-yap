import { useState, useEffect } from "react";
import { PiLinkLight } from "react-icons/pi";
import { IoIosArrowRoundForward } from "react-icons/io";
import { FaXTwitter, FaLinkedin, FaCheck } from "react-icons/fa6";
import { FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function SubmitForm() {
  const [currentState, setCurrentState] = useState(1);
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [guestName, setGuestName] = useState("");
  const [manualPaste, setManualPaste] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processingStage, setProcessingStage] = useState(0);

  // Fake processing stages simulator
  useEffect(() => {
    let interval;
    if (currentState === 5) {
      interval = setInterval(() => {
        setProcessingStage((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per stage for testing
    } else {
      setProcessingStage(0);
    }
    return () => clearInterval(interval);
  }, [currentState]);

  // Handle URL change logic
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);

    if (!val && currentState < 5) {
      setCurrentState(1);
      setPlatform(null);
      setManualPaste(false);
      return;
    }

    if (currentState >= 5) return;

    if (val.includes("linkedin.com")) {
      setPlatform("linkedin");
      setCurrentState(3); // Warning state
      setManualPaste(true); // Auto-check manual paste
    } else if (val.includes("twitter.com") || val.includes("x.com")) {
      setPlatform("twitter");
      setCurrentState(2);
      setManualPaste(false);
    } else {
      setPlatform(null);
      setCurrentState(2);
    }
  };

  const handleManualPasteToggle = (e) => {
    const isChecked = e.target.checked;
    setManualPaste(isChecked);
    if (isChecked) {
      setCurrentState(4);
    } else if (platform === "linkedin") {
      setCurrentState(3);
    } else {
      setCurrentState(2);
    }
  };

  const handleExtractClick = (e) => {
    e.preventDefault();
    if (currentState === 6) {
      setCurrentState(7); // from needs manual -> success
    } else {
      setCurrentState(5); // start processing
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* State 7: Success */}
      {currentState === 7 && (
        <div className="w-full bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6 shadow-sm flex items-start gap-3">
          <FiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-green-800 font-medium">Done! 8 tips extracted from "Negotiating your first offer"</h3>
            <button className="text-green-700 mt-2 text-sm font-semibold hover:underline flex items-center gap-1">
              View episode <IoIosArrowRoundForward className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* State 8: Error */}
      {currentState === 8 && (
        <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 shadow-sm flex items-start gap-3">
          <FiXCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-800 font-medium">Something went wrong: yt-dlp couldn't download this Space.</h3>
            <p className="text-red-700 text-sm mt-1">The recording may have been deleted or was a private space.</p>
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => setCurrentState(6)}
                className="text-red-700 text-sm font-semibold hover:underline"
              >
                Try manual paste instead
              </button>
              <button
                onClick={() => setCurrentState(1)}
                className="text-gray-500 text-sm hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 6: Needs Manual Paste */}
      {currentState === 6 && (
        <div className="w-full bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-6 shadow-sm flex items-start gap-3">
          <FiAlertTriangle className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-amber-800 font-medium">LinkedIn couldn't be downloaded automatically.</h3>
            <p className="text-amber-700 text-sm mt-1">Please paste the transcript below to continue.</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      {currentState !== 7 && currentState !== 8 && (
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative transition-all">
          {currentState === 5 && (
            <div className="absolute inset-0 bg-white/60 z-10 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
              <div className="bg-white border shadow-lg rounded-lg p-6 w-11/12 max-w-md">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-lavendar border-t-transparent animate-spin"></span>
                  Extracting tips...
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${processingStage >= 0 ? "text-gray-800" : "text-gray-400"}`}>
                    {processingStage > 0 ? <FaCheck className="text-green-500" /> : (processingStage === 0 ? <span className="w-3 h-3 rounded-full bg-lavendar animate-ping"></span> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>)}
                    <span className="text-sm">Downloading audio</span>
                  </div>
                  <div className={`flex items-center gap-3 ${processingStage >= 1 ? "text-gray-800" : "text-gray-400"}`}>
                    {processingStage > 1 ? <FaCheck className="text-green-500" /> : (processingStage === 1 ? <span className="w-3 h-3 rounded-full bg-lavendar animate-ping"></span> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>)}
                    <span className="text-sm">Transcribing... {processingStage === 1 && <span className="text-xs text-gray-500 ml-2">(Gemini is processing)</span>}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${processingStage >= 2 ? "text-gray-800" : "text-gray-400"}`}>
                    {processingStage > 2 ? <FaCheck className="text-green-500" /> : (processingStage === 2 ? <span className="w-3 h-3 rounded-full bg-lavendar animate-ping"></span> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>)}
                    <span className="text-sm">Extracting tips</span>
                  </div>
                  <div className={`flex items-center gap-3 ${processingStage >= 3 ? "text-gray-800" : "text-gray-400"}`}>
                    {processingStage >= 3 ? <FaCheck className="text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                    <span className="text-sm">Done</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400 text-right">Approx. 1-3 min</div>
              </div>
            </div>
          )}

          <form className="w-full flex flex-col gap-4" onSubmit={handleExtractClick}>

            {/* Input Row */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {platform === "twitter" ? (
                    <FaXTwitter className="text-gray-700" />
                  ) : platform === "linkedin" ? (
                    <FaLinkedin className="text-blue-600" />
                  ) : (
                    <PiLinkLight className="text-gray-400 text-xl" />
                  )}
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavendar focus:border-transparent transition-all"
                  placeholder="Paste a Twitter Space or LinkedIn URL"
                  disabled={currentState === 5 || currentState === 6}
                />
              </div>

              {currentState <= 4 && (
                <button
                  type="submit"
                  disabled={!url && currentState === 1}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors whitespace-nowrap
                    ${(!url && currentState === 1) || currentState === 5 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm"}`}
                >
                  Extract Tips <IoIosArrowRoundForward className="text-xl" />
                </button>
              )}
            </div>

            {/* Expanded Fields (States 2, 3, 4) */}
            {currentState >= 2 && currentState <= 4 && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2">

                {/* State 3: LinkedIn Warning */}
                {currentState === 3 && (
                  <div className="flex gap-3 text-amber-700 bg-amber-50/50 p-3 rounded border border-amber-200/50">
                    <FiAlertTriangle className="text-lg flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">
                      LinkedIn downloads often fail. Check "paste manually" if extraction doesn't work, or paste captions from the LinkedIn Live page.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Episode Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-lavendar text-sm text-gray-700"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Solo episode"
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-lavendar text-sm text-gray-700"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60 mt-2">
                  <input
                    type="checkbox"
                    id="manualPaste"
                    checked={manualPaste}
                    onChange={handleManualPasteToggle}
                    className="w-4 h-4 text-lavendar rounded border-gray-300 focus:ring-lavendar"
                  />
                  <label htmlFor="manualPaste" className="text-sm text-gray-600 cursor-pointer select-none">
                    Paste transcript manually
                  </label>
                </div>

                {/* State 4: Manual Textarea */}
                {currentState === 4 && (
                  <div className="pt-2 animate-in fade-in zoom-in-95">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste the transcript or captions below:
                    </label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lavendar font-mono"
                      placeholder="(paste text here)"
                    ></textarea>
                  </div>
                )}
              </div>
            )}

            {/* State 6 Form Fields (Needs Manual fallback) */}
            {currentState === 6 && (
              <div className="space-y-4 animate-in fade-in pt-2">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lavendar focus:border-transparent font-mono"
                  placeholder="Paste the transcript or captions here..."
                ></textarea>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!transcript.trim()}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm
                      ${!transcript.trim() ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand-primary hover:bg-brand-primary/90 text-white"}`}
                  >
                    Extract from text <IoIosArrowRoundForward className="text-xl" />
                  </button>
                </div>
              </div>
            )}

          </form>
          {currentState === 1 && (
            <figcaption className="text-xs text-center text-gray-500 mt-4">
              Paste a link from Taylor's live sessions to extract key insights
            </figcaption>
          )}
        </div>
      )}

      {/* Development Controls (For Testing the 8 States) */}
      <div className="mt-12 w-full p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dev Controls: Test States</h4>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((stateNum) => (
            <button
              key={stateNum}
              onClick={() => {
                setCurrentState(stateNum);
                if (stateNum === 1) { setUrl(""); setPlatform(null); setManualPaste(false); }
                if (stateNum === 2) { setUrl("twitter.com/i/spaces/123"); setPlatform("twitter"); setManualPaste(false); }
                if (stateNum === 3) { setUrl("linkedin.com/events/123"); setPlatform("linkedin"); setManualPaste(true); }
                if (stateNum === 4) { setUrl("linkedin.com/events/123"); setPlatform("linkedin"); setManualPaste(true); }
              }}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${currentState === stateNum ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}`}
            >
              State {stateNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}