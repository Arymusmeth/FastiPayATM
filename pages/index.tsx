'use client';
import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useSwitchNetwork, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();

  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const ADMIN_WALLET = '0x4fcf0b5f3bcd8ad4715dbbdf624c158255419bd4'.toLowerCase();

  const handleMint = async () => {
    if (!walletClient) return alert('No wallet client');
    try {
      setMinting(true);
      setTxHash(null);
      const hash = await walletClient.sendTransaction({
        to: walletClient.account.address,
        value: parseEther('0.0001'),
      });
      setTxHash(hash);
    } catch (err: any) {
      alert(err.message || 'Minting error');
    } finally {
      setMinting(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">🚀 FastiPay ATM</h1>
      <p className="text-center mb-4">API frontend y panel en vivo.</p>

      <ConnectButton />

      {isConnected && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400 mb-2">Conectado como:</p>
          <p className="font-mono text-green-400">{address}</p>

          {address?.toLowerCase() === ADMIN_WALLET && (
            <>
              <button
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition"
                onClick={handleMint}
                disabled={minting}
              >
                {minting ? 'Minting...' : 'MINT HFT'}
              </button>
              {txHash && (
                <p className="mt-2 text-sm text-blue-400">
                  Hash: <a href={`https://explorer.worldchain.builders/tx/${txHash}`} target="_blank" rel="noreferrer">{txHash.slice(0, 10)}...</a>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
