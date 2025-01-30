import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'whitelisted' | 'not-whitelisted'>('idle');
  const [whitelistSource, setWhitelistSource] = useState<'a' | 'b' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allowlistA, setAllowlistA] = useState<Set<string>>(new Set());
  const [allowlistB, setAllowlistB] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadWhitelist = async () => {
      try {
        const [responseA, responseB] = await Promise.all([
          fetch('/assets/sunborn-allowlist-a.csv'),
          fetch('/assets/sunborn-allowlist-b.csv')
        ]);

        const [textA, textB] = await Promise.all([
          responseA.text(),
          responseB.text()
        ]);

        const addressesA = new Set(textA.split('\n').map(line => line.trim()));
        const addressesB = new Set(textB.split('\n').map(line => line.trim()));

        addressesA.delete('');
        addressesA.delete('address');
        addressesA.delete('wallet');
        
        addressesB.delete('');
        addressesB.delete('address');
        addressesB.delete('wallet');

        setAllowlistA(addressesA);
        setAllowlistB(addressesB);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading whitelist:', error);
        setIsLoading(false);
      }
    };

    loadWhitelist();
  }, []);

  const checkWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;

    setStatus('checking');
    
    setTimeout(() => {
      const cleanAddress = walletAddress.trim();
      if (allowlistA.has(cleanAddress)) {
        setWhitelistSource('a');
        setStatus('whitelisted');
      } else if (allowlistB.has(cleanAddress)) {
        setWhitelistSource('b');
        setStatus('whitelisted');
      } else {
        setWhitelistSource(null);
        setStatus('not-whitelisted');
      }
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[url('/assets/sunborn-bg.jpg')] bg-cover bg-center bg-no-repeat text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          <p className="text-xl font-pochaevsk">Loading whitelist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/assets/sunborn-bg.jpg')] bg-cover bg-center bg-no-repeat text-white flex items-center justify-center">
      <div className="container mx-auto px-4 w-full max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 font-pochaevsk text-white uppercase tracking-wider">
            Sunborn Ascension
          </h1>
          <p className="text-lg md:text-xl text-white font-pochaevsk">
            Are you worthy enough, I dare you
          </p>
        </div>

        <div className="w-full max-w-xl mx-auto bg-black/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-2xl border border-cyan-500/20">
          <form onSubmit={checkWhitelist} className="space-y-6">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-cyan-200/50"
              placeholder="Enter wallet address..."
              spellCheck="false"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={status === 'checking' || !walletAddress}
              className="w-full bg-cyan-600/20 hover:bg-cyan-500/30 disabled:bg-cyan-950/20 disabled:cursor-not-allowed py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition font-pochaevsk border border-cyan-400/30"
            >
              {status === 'checking' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Check Status</span>
                </>
              )}
            </button>
          </form>

          {(status === 'whitelisted' || status === 'not-whitelisted') && (
            <div className={`mt-6 p-4 rounded-lg ${
              status === 'whitelisted' 
                ? 'bg-cyan-500/10 border border-cyan-400/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="flex items-center space-x-3">
                {status === 'whitelisted' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-cyan-400" />
                    <p className="font-medium font-pochaevsk">
                      {whitelistSource === 'a' 
                        ? "Welcome Priest, You're in a High House"
                        : "Welcome my Disciple. You're worthy enough to rise in the ranks."}
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-400" />
                    <p className="font-medium font-pochaevsk">Sorry, you are not worthy yet.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;