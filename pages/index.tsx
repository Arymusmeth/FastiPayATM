// pages/index.tsx – Next.js + RainbowKit + wagmi + viem

"use client";

import React, { useState } from "react";
import {
  WagmiConfig,
  createConfig,
  configureChains,
  useAccount,
  useConnect,
  useDisconnect,
  useContractWrite,
} from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import {
  getDefaultWallets,
  RainbowKitProvider,
  ConnectButton,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { parseEther, Address } from "viem";

// --- 🔗 WorldChain definition (placeholder RPC) ---------------------------
export const worldChain = {
  id: 1891, // ⚠️ reemplázalo por el ID real si cambia
  name: "WorldChain",
  network: "worldchain",
  nativeCurrency: {
    name: "WorldCoin",
    symbol: "WDC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.worldchain.builders"] },
    public: { http: ["https://rpc.worldchain.builders"] },
  },
  blockExplorers: {
    default: {
      name: "WorldChain Explorer",
      url: "https://explorer.worldchain.builders",
    },
  },
  testnet: false,
} as const;
// -------------------------------------------------------------------------

// 🛠️ wagmi + RainbowKit config
const { chains, publicClient } = configureChains(
  [worldChain],
  [
    jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }) }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "FastiPayATM",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // 👉 pon tu ID de WalletConnect v2
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// --- 🪙 Token HFT (reemplaza address/ABI si cambia) -----------------------
const HFT_ADDRESS = "0x4fcf00000000000000000000000000000000bd4" as Address; // tu token
const HFT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;
// -------------------------------------------------------------------------

export default function Home() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Page />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

function Page() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  // Contract write (mint 100 HFT al usuario)
  const {
    write: mint,
    isLoading: minting,
    isSuccess: minted,
    data: txHash,
  } = useContractWrite({
    address: HFT_ADDRESS,
    abi: HFT_ABI,
    functionName: "mint",
    args: address ? [address, parseEther("100")] : undefined,
  });

  return (
    <main className="min-h-screen p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">
        FastiPayATM en línea <span className="ml-2">✅</span>
      </h1>
      <p className="mb-8 text-gray-700 max-w-xl">
        Interfaz Web3 lista para conectar tu wallet y comenzar.
      </p>

      {/* Conectar / Desconectar */}
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
        accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
      />

      {isConnected && (
        <section className="mt-10 space-y-4">
          <div className="text-sm text-gray-500">Conectado como {address}</div>

          {/* Botón Mint */}
          <button
            onClick={() => mint?.()}
            disabled={minting || minted}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {minting ? "Minting…" : minted ? "Minted 🎉" : "MINT 100 HFT"}
          </button>

          {/* Hash de TX */}
          {txHash && (
            <p className="text-sm mt-2 text-blue-600">
              Hash: {" "}
              <a
                href={`https://explorer.worldchain.builders/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {txHash.slice(0, 10)}…
              </a>
            </p>
          )}

          {/* Desconectar */}
          <button
            onClick={() => disconnect()}
            className="text-xs text-red-500 underline mt-4"
          >
            Desconectar
          </button>
        </section>
      )}
    </main>
  );
}
